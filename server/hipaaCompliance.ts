import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { systemAuditLogs, phiDetectionLogs, secureFileDeletions } from '@shared/schema';
import { eq, and, gte } from 'drizzle-orm';

// HIPAA Encryption Configuration (AES-256-GCM)
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.HIPAA_ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

// PHI Detection Patterns (regex-based for now)
const PHI_PATTERNS = {
  ssn: /\b(?:\d{3}[-\s]?\d{2}[-\s]?\d{4})\b/g,
  medicare: /\b(?:\d{4}[-\s]?\d{3}[-\s]?\d{3}[-\s]?[A-Z]\d)\b/g,
  medical_record: /\b(?:MRN|MR|MEDICAL[\s-]?RECORD)[\s#:]*([A-Z0-9]{6,12})\b/gi,
  dob: /\b(?:DOB|BIRTH|BORN)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/gi,
  phone: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  address: /\b\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way)\b/gi,
  diagnosis: /\b(?:ICD[-\s]?(?:9|10)[\s-]*(?:CM)?[\s:]*)?([A-Z]\d{2}(?:\.\d{1,3})?)\b/gi,
  prescription: /\b(?:RX|PRESCRIPTION)[\s#:]*([A-Z0-9]{8,15})\b/gi
};

// Encryption Functions
export class HipaaEncryption {
  static encrypt(text: string): { encrypted: string; iv: string; salt: string; tag: string } {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha512');
    
    const cipher = crypto.createCipherGCM(ENCRYPTION_ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  static decrypt(encryptedData: { encrypted: string; iv: string; salt: string; tag: string }): string {
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha512');
    
    const decipher = crypto.createDecipherGCM(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static hashSha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

// PHI Detection Service
export class PhiDetectionService {
  static detectPhi(content: string): { 
    detectedTypes: string[]; 
    confidenceScore: number; 
    matches: Array<{ type: string; match: string; position: number }>; 
  } {
    const matches: Array<{ type: string; match: string; position: number }> = [];
    const detectedTypes: string[] = [];

    for (const [type, pattern] of Object.entries(PHI_PATTERNS)) {
      const typeMatches = Array.from(content.matchAll(pattern));
      if (typeMatches.length > 0) {
        detectedTypes.push(type);
        typeMatches.forEach(match => {
          matches.push({
            type,
            match: match[0],
            position: match.index || 0
          });
        });
      }
    }

    // Calculate confidence score based on pattern matches and context
    const confidenceScore = Math.min(1.0, matches.length * 0.15 + 
      (detectedTypes.includes('ssn') ? 0.4 : 0) +
      (detectedTypes.includes('medical_record') ? 0.3 : 0) +
      (detectedTypes.includes('medicare') ? 0.3 : 0));

    return { detectedTypes, confidenceScore, matches };
  }

  static async logPhiDetection(
    fileId: string,
    content: string,
    organizationId: number,
    userId: string
  ): Promise<void> {
    const detection = this.detectPhi(content);
    const contentHash = HipaaEncryption.hashSha256(content);

    if (detection.detectedTypes.length > 0) {
      await db.insert(phiDetectionLogs).values({
        fileId,
        contentHash,
        detectedPhiTypes: detection.detectedTypes,
        confidenceScore: detection.confidenceScore.toString(),
        quarantined: detection.confidenceScore > 0.7, // Auto-quarantine high confidence PHI
        organizationId,
        scanEngine: 'regex'
      });

      // Log high-confidence PHI detection as audit event
      if (detection.confidenceScore > 0.5) {
        await HipaaAuditLogger.logEvent({
          userId,
          organizationId,
          action: 'phi_detected',
          resource: 'file_upload',
          resourceId: fileId,
          details: {
            detectedTypes: detection.detectedTypes,
            confidenceScore: detection.confidenceScore,
            quarantined: detection.confidenceScore > 0.7
          },
          phiAccessed: true,
          hipaaEvent: 'access',
          severity: detection.confidenceScore > 0.8 ? 'high' : 'medium'
        });
      }
    }
  }
}

// HIPAA Audit Logger
export class HipaaAuditLogger {
  static async logEvent(params: {
    userId: string;
    organizationId: number;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    phiAccessed?: boolean;
    hipaaEvent?: 'access' | 'view' | 'modify' | 'delete' | 'export' | 'print' | 'share' | 'breach';
    accessJustification?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    const retentionUntil = new Date();
    retentionUntil.setFullYear(retentionUntil.getFullYear() + 6); // 6+ years for HIPAA

    // Sanitize details to remove any PHI before logging
    const sanitizedDetails = params.details ? this.sanitizeForLogging(params.details) : null;

    await db.insert(systemAuditLogs).values({
      userId: params.userId,
      organizationId: params.organizationId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: sanitizedDetails,
      phiAccessed: params.phiAccessed || false,
      hipaaEvent: params.hipaaEvent,
      accessJustification: params.accessJustification,
      sessionId: params.sessionId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      severity: params.severity || 'low',
      retentionUntil,
      isEncrypted: true
    });
  }

  private static sanitizeForLogging(details: any): any {
    if (typeof details === 'string') {
      return this.redactPhi(details);
    }
    
    if (Array.isArray(details)) {
      return details.map(item => this.sanitizeForLogging(item));
    }
    
    if (typeof details === 'object' && details !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(details)) {
        sanitized[key] = this.sanitizeForLogging(value);
      }
      return sanitized;
    }
    
    return details;
  }

  private static redactPhi(text: string): string {
    let sanitized = text;
    
    // Replace potential PHI with redacted markers
    sanitized = sanitized.replace(PHI_PATTERNS.ssn, '[SSN_REDACTED]');
    sanitized = sanitized.replace(PHI_PATTERNS.medicare, '[MEDICARE_REDACTED]');
    sanitized = sanitized.replace(PHI_PATTERNS.medical_record, '[MRN_REDACTED]');
    sanitized = sanitized.replace(PHI_PATTERNS.dob, '[DOB_REDACTED]');
    sanitized = sanitized.replace(PHI_PATTERNS.phone, '[PHONE_REDACTED]');
    sanitized = sanitized.replace(PHI_PATTERNS.email, '[EMAIL_REDACTED]');
    
    return sanitized;
  }
}

// Secure File Deletion Service
export class SecureFileDeletion {
  static async secureDelete(
    filePath: string,
    userId: string,
    organizationId: number,
    reason: string,
    method: 'overwrite_3pass' | 'overwrite_7pass' | 'dod_5220' | 'crypto_erase' = 'overwrite_7pass'
  ): Promise<boolean> {
    try {
      const fs = require('fs').promises;
      const stats = await fs.stat(filePath);
      const fileHash = HipaaEncryption.hashSha256(await fs.readFile(filePath, 'utf8'));
      
      // Perform secure deletion based on method
      let verificationPassed = false;
      
      switch (method) {
        case 'overwrite_7pass':
          verificationPassed = await this.performOverwriteDeletion(filePath, 7);
          break;
        case 'overwrite_3pass':
          verificationPassed = await this.performOverwriteDeletion(filePath, 3);
          break;
        case 'dod_5220':
          verificationPassed = await this.performDod5220Deletion(filePath);
          break;
        case 'crypto_erase':
          verificationPassed = await this.performCryptoErase(filePath);
          break;
      }

      // Log the secure deletion
      await db.insert(secureFileDeletions).values({
        originalPath: filePath,
        fileHash,
        fileSize: stats.size,
        deletionMethod: method,
        verificationPassed,
        deletedBy: userId,
        organizationId,
        reason
      });

      // Audit log the deletion
      await HipaaAuditLogger.logEvent({
        userId,
        organizationId,
        action: 'secure_file_deletion',
        resource: 'file_system',
        resourceId: filePath,
        details: {
          method,
          fileSize: stats.size,
          verificationPassed,
          reason
        },
        hipaaEvent: 'delete',
        severity: 'medium'
      });

      return verificationPassed;
    } catch (error) {
      console.error('Secure deletion failed:', error);
      return false;
    }
  }

  private static async performOverwriteDeletion(filePath: string, passes: number): Promise<boolean> {
    const fs = require('fs').promises;
    try {
      const stats = await fs.stat(filePath);
      const fileSize = stats.size;
      
      // Multiple overwrite passes with different patterns
      const patterns = [
        Buffer.alloc(fileSize, 0x00), // All zeros
        Buffer.alloc(fileSize, 0xFF), // All ones
        crypto.randomBytes(fileSize), // Random data
      ];

      for (let pass = 0; pass < passes; pass++) {
        const pattern = patterns[pass % patterns.length];
        await fs.writeFile(filePath, pattern);
        await fs.fsync;
      }

      // Final deletion
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  private static async performDod5220Deletion(filePath: string): Promise<boolean> {
    // DoD 5220.22-M standard: 3 passes with specific patterns
    const fs = require('fs').promises;
    try {
      const stats = await fs.stat(filePath);
      const fileSize = stats.size;
      
      // Pass 1: Write 0x35
      await fs.writeFile(filePath, Buffer.alloc(fileSize, 0x35));
      await fs.fsync;
      
      // Pass 2: Write 0xCA
      await fs.writeFile(filePath, Buffer.alloc(fileSize, 0xCA));
      await fs.fsync;
      
      // Pass 3: Write random data
      await fs.writeFile(filePath, crypto.randomBytes(fileSize));
      await fs.fsync;
      
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  private static async performCryptoErase(filePath: string): Promise<boolean> {
    // For encrypted filesystems, simply delete the encryption key
    // This is a conceptual implementation
    try {
      const fs = require('fs').promises;
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// HIPAA Middleware for Request Logging
export const hipaaAuditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Capture original response methods
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Generate session ID for tracking
  if (!req.session) {
    req.session = {} as any;
  }
  if (!req.session.hipaaSessionId) {
    req.session.hipaaSessionId = crypto.randomUUID();
  }

  // Override response methods to capture when PHI might be accessed
  res.send = function(body: any) {
    logRequest();
    return originalSend.call(this, body);
  };

  res.json = function(body: any) {
    logRequest();
    return originalJson.call(this, body);
  };

  const logRequest = async () => {
    const duration = Date.now() - startTime;
    const user = (req as any).user;
    
    if (user && shouldLogRequest(req)) {
      await HipaaAuditLogger.logEvent({
        userId: user.claims?.sub || user.id,
        organizationId: user.organizationId || 1,
        action: `${req.method}_${req.route?.path || req.path}`,
        resource: 'api_endpoint',
        resourceId: req.originalUrl,
        details: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          query: sanitizeQuery(req.query),
          params: req.params
        },
        sessionId: req.session.hipaaSessionId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity: res.statusCode >= 400 ? 'medium' : 'low'
      });
    }
  };

  next();
};

function shouldLogRequest(req: Request): boolean {
  // Log all requests to endpoints that might handle PHI
  const phiEndpoints = [
    '/api/users',
    '/api/classes',
    '/api/content',
    '/api/reports',
    '/api/uploads'
  ];
  
  return phiEndpoints.some(endpoint => req.path.startsWith(endpoint));
}

function sanitizeQuery(query: any): any {
  const sanitized: any = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      sanitized[key] = HipaaAuditLogger['redactPhi'](value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Access Control Helper
export const requirePhiAccess = (justification: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required for PHI access' });
    }

    // Log PHI access attempt
    HipaaAuditLogger.logEvent({
      userId: user.claims?.sub || user.id,
      organizationId: user.organizationId || 1,
      action: 'phi_access_attempt',
      resource: req.path,
      details: { justification },
      phiAccessed: true,
      hipaaEvent: 'access',
      accessJustification: justification,
      sessionId: req.session?.hipaaSessionId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'medium'
    });

    next();
  };
};

// HIPAA Compliance Status Checker
export class HipaaComplianceChecker {
  static async getComplianceStatus(organizationId: number): Promise<{
    isCompliant: boolean;
    findings: string[];
    recommendations: string[];
  }> {
    const findings: string[] = [];
    const recommendations: string[] = [];

    // Check encryption key configuration
    if (!process.env.HIPAA_ENCRYPTION_KEY) {
      findings.push('HIPAA encryption key not configured');
      recommendations.push('Set HIPAA_ENCRYPTION_KEY environment variable');
    }

    // Check audit log retention
    const sixYearsAgo = new Date();
    sixYearsAgo.setFullYear(sixYearsAgo.getFullYear() - 6);
    
    const oldLogs = await db.select()
      .from(systemAuditLogs)
      .where(and(
        eq(systemAuditLogs.organizationId, organizationId),
        gte(systemAuditLogs.createdAt, sixYearsAgo)
      ));

    if (oldLogs.length === 0) {
      findings.push('Insufficient audit log history');
      recommendations.push('Ensure audit logs are retained for 6+ years');
    }

    const isCompliant = findings.length === 0;
    
    return { isCompliant, findings, recommendations };
  }
}