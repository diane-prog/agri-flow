import { SetMetadata } from '@nestjs/common';
import { VerificationLevelEnum } from '../enum';

export const KYC_LEVEL_KEY = 'kycLevel';
export const RequireKyc = (level: VerificationLevelEnum) => SetMetadata(KYC_LEVEL_KEY, level);
