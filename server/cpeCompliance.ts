import { Request, Response, NextFunction } from 'express';
import { lmsStorage } from './newStorage';

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
      // CPE functionality disabled during LMS revamp
      return next();
      
      // CPE assessment logic will be reimplemented with new course structure

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
    // CPE functionality will be reimplemented with new LMS structure
    return null;
    
    if (!classData?.isNasbaApproved) {
      return null; // Not a CPE-eligible course
    }

    const cpeCredits = calculateCpeCredits(timeSpentMinutes);
    
    if (cpeCredits === 0) {
      return null; // Insufficient time for CPE credits
    }

    // CPE audit logging will be reimplemented
    return null;
      completionDate: new Date(),
      assessmentScore,
      timeSpentMinutes,
      ipAddress: req?.ip,
      userAgent: req?.get('User-Agent'),
      verificationStatus: 'verified'
    });

    // Certificate generation will be reimplemented
    return null;
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