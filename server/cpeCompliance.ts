import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// CPE Compliance Utilities for NASBA standards
export function calculateCpeCredits(timeSpentMinutes: number): number {
  // NASBA standard: 50 minutes = 1 CPE credit
  return Math.floor(timeSpentMinutes / 50 * 100) / 100; // Round to 2 decimal places
}

export function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CPE-${timestamp}-${random}`.toUpperCase();
}

// Middleware to enforce NASBA compliance checks
export const checkCPECompliance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { classId } = req.params;

    if (!user || user.role !== 'student') {
      return next();
    }

    if (classId) {
      const classData = await storage.getClass(parseInt(classId));
      
      if (classData?.isNasbaApproved && classData?.requiresAssessment) {
        // Check if user has completed required assessment
        const interactions = await storage.getUserInteractions(user.claims.sub, parseInt(classId));
        const hasCompletedAssessment = interactions.some(
          interaction => interaction.interactionType === 'quiz_complete' && 
          interaction.score && interaction.score >= (classData.minimumPassingScore || 70)
        );

        if (!hasCompletedAssessment) {
          return res.status(403).json({ 
            message: 'Assessment completion required for NASBA CPE credit',
            requiresAssessment: true,
            minimumScore: classData.minimumPassingScore || 70
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error('CPE compliance check failed:', error);
    next(error);
  }
};

// Auto-generate CPE audit log when course is completed
export const logCpeCompletion = async (
  userId: string, 
  classId: number, 
  timeSpentMinutes: number, 
  assessmentScore?: number,
  req?: Request
) => {
  try {
    const classData = await storage.getClass(classId);
    
    if (!classData?.isNasbaApproved) {
      return null; // Not a CPE-eligible course
    }

    const cpeCredits = calculateCpeCredits(timeSpentMinutes);
    
    if (cpeCredits === 0) {
      return null; // Insufficient time for CPE credits
    }

    // Create audit log entry
    const auditLog = await storage.createCpeAuditLog({
      userId,
      classId,
      action: 'completion',
      cpeCreditsEarned: cpeCredits.toString(),
      completionDate: new Date(),
      assessmentScore,
      timeSpentMinutes,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      verificationStatus: 'verified'
    });

    // Generate certificate if all requirements met
    if (assessmentScore && assessmentScore >= (classData.minimumPassingScore || 70)) {
      const certificate = await storage.createCpeCertificate({
        certificateNumber: generateCertificateNumber(),
        userId,
        classId,
        cpeCreditsAwarded: cpeCredits.toString(),
        verificationHash: generateVerificationHash(userId, classId, cpeCredits),
        status: 'active'
      });

      return { auditLog, certificate };
    }

    return { auditLog };
  } catch (error) {
    console.error('Failed to log CPE completion:', error);
    throw error;
  }
};

function generateVerificationHash(userId: string, classId: number, credits: number): string {
  const data = `${userId}-${classId}-${credits}-${Date.now()}`;
  return Buffer.from(data).toString('base64').substring(0, 32);
}