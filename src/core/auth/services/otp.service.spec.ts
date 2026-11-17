import { OtpService } from './otp.service';

describe('OtpService', () => {
    let service: OtpService;
    let mockRedisService: any;
    let mockConfigService: any;
    let mockMailerService: any;

    beforeEach(() => {
        mockRedisService = {
            isEnabled: jest.fn().mockReturnValue(true),
            set: jest.fn().mockResolvedValue(undefined),
            get: jest.fn().mockResolvedValue('123456'),
            del: jest.fn().mockResolvedValue(undefined),
        };
        mockConfigService = {
            get: jest.fn().mockReturnValue(10),
        };
        mockMailerService = {
            sendMail: jest.fn().mockResolvedValue({ messageId: 'msg-1' }),
        };

        service = new OtpService(mockRedisService, mockConfigService, mockMailerService);
    });

    it('should generate a 6-digit code and store it in Redis', async () => {
        const code = await service.generateOtp('+22997000000');

        expect(code).toHaveLength(6);
        expect(mockRedisService.set).toHaveBeenCalledWith(
            'otp:+22997000000',
            code,
            600,
        );
    });

    it('should send email when identity is an email', async () => {
        const code = await service.generateOtp('user@agriflow.bj', 'Bio');

        expect(code).toHaveLength(6);
        expect(mockMailerService.sendMail).toHaveBeenCalledWith(
            'user@agriflow.bj',
            expect.stringContaining(code),
            expect.any(String),
        );
    });

    it('should verify matching code and delete from Redis', async () => {
        const isValid = await service.verifyOtp('+22997000000', '123456');

        expect(isValid).toBe(true);
        expect(mockRedisService.del).toHaveBeenCalledWith(
            'otp:+22997000000',
        );
    });

    it('should reject wrong code', async () => {
        mockRedisService.get.mockResolvedValue('123456');

        const isValid = await service.verifyOtp('+22997000000', '999999');

        expect(isValid).toBe(false);
        expect(mockRedisService.del).not.toHaveBeenCalled();
    });
});
