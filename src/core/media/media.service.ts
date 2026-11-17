import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { FileTypeEnum } from '../../common/enum';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import { SignUploadDto } from './dto/sign-upload.dto';
import { Media } from './entities/media.entity';
import { MediaRepository } from './repositories/media.repository';

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);
    private configured = false;

    constructor(
        private readonly configService: ConfigService,
        private readonly mediaRepository: MediaRepository,
    ) {
        this.configure();
    }

    private configure(): void {
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY') || process.env.CLOUDINARY_API_KEY;
        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET') || process.env.CLOUDINARY_API_SECRET;

        if (cloudName && apiKey && apiSecret) {
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
                secure: true,
            });
            this.configured = true;
            this.logger.log(`☁️ Cloudinary configuré avec succès pour le compte [${cloudName}]`);
        } else {
            this.logger.warn('⚠️ Identifiants Cloudinary non configurés (.env). Mode simulation actif.');
        }
    }

    isConfigured(): boolean {
        return this.configured;
    }

    private detectFileType(mimetype: string): FileTypeEnum {
        if (mimetype.startsWith('image/')) return FileTypeEnum.IMAGE;
        if (mimetype === 'application/pdf') return FileTypeEnum.PDF;
        if (
            mimetype.includes('word') ||
            mimetype.includes('document') ||
            mimetype.includes('text/') ||
            mimetype.includes('sheet') ||
            mimetype.includes('excel')
        ) {
            return FileTypeEnum.DOCUMENT;
        }
        if (mimetype.startsWith('video/')) return FileTypeEnum.VIDEO;
        return FileTypeEnum.OTHER;
    }

    async uploadFile(
        file: Express.Multer.File,
        folder = 'agriflow/general',
        ownerId?: string,
    ): Promise<Media> {
        if (!file || !file.buffer) {
            throw new BadRequestException('Fichier invalide ou vide');
        }

        const fileType = this.detectFileType(file.mimetype);

        if (!this.configured) {
            // Mode simulation si Cloudinary n'est pas configuré dans .env
            const simulatedPublicId = `${folder}/${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
            const simulatedUrl = `https://res.cloudinary.com/simulated-agriflow/image/upload/${simulatedPublicId}`;

            const media = new Media({
                publicId: simulatedPublicId,
                label: file.originalname,
                url: simulatedUrl,
                secureUrl: simulatedUrl,
                folder,
                format: file.originalname.split('.').pop() || 'bin',
                mimetype: file.mimetype,
                bytes: file.size,
                type: fileType,
                resourceType: 'image',
                ownerId,
            });

            return await this.mediaRepository.create(media);
        }

        // Upload réel vers Cloudinary
        const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error || !result) {
                        return reject(error || new Error('Erreur upload Cloudinary'));
                    }
                    resolve(result);
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });

        const media = new Media({
            publicId: uploadResult.public_id,
            label: file.originalname,
            url: uploadResult.url,
            secureUrl: uploadResult.secure_url,
            folder: uploadResult.folder || folder,
            format: uploadResult.format,
            mimetype: file.mimetype,
            width: uploadResult.width,
            height: uploadResult.height,
            bytes: uploadResult.bytes,
            type: fileType,
            resourceType: uploadResult.resource_type,
            ownerId,
        });

        return await this.mediaRepository.create(media);
    }

    async uploadFiles(
        files: Express.Multer.File[],
        folder = 'agriflow/general',
        ownerId?: string,
    ): Promise<Media[]> {
        const results: Media[] = [];
        for (const file of files) {
            const saved = await this.uploadFile(file, folder, ownerId);
            results.push(saved);
        }
        return results;
    }

    signUpload(dto: SignUploadDto) {
        if (!this.configured) {
            return {
                timestamp: Math.round(Date.now() / 1000),
                signature: 'simulated_signature_mode_dev',
                apiKey: 'simulated_api_key',
                cloudName: 'simulated-agriflow',
                folder: dto.folder || 'agriflow',
            };
        }

        const timestamp = Math.round(Date.now() / 1000);
        const folder = dto.folder || 'agriflow';
        const paramsToSign: Record<string, any> = {
            timestamp,
            folder,
        };

        if (dto.publicId) {
            paramsToSign.public_id = dto.publicId;
        }

        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET') || process.env.CLOUDINARY_API_SECRET || '';
        const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

        return {
            timestamp,
            signature,
            apiKey: this.configService.get<string>('CLOUDINARY_API_KEY') || process.env.CLOUDINARY_API_KEY,
            cloudName: this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || process.env.CLOUDINARY_CLOUD_NAME,
            folder,
        };
    }

    async confirmUpload(dto: ConfirmUploadDto, ownerId?: string): Promise<Media> {
        const media = new Media({
            publicId: dto.publicId,
            url: dto.url,
            secureUrl: dto.secureUrl ?? dto.url,
            folder: dto.folder,
            format: dto.format,
            width: dto.width,
            height: dto.height,
            bytes: dto.bytes ?? 0,
            label: dto.label,
            type: FileTypeEnum.IMAGE,
            ownerId,
        });

        return await this.mediaRepository.create(media);
    }

    async findFileById(id: string): Promise<Media> {
        const media = await this.mediaRepository.findById(id);
        if (!media) {
            throw new NotFoundException(`Fichier média [${id}] introuvable`);
        }
        return media;
    }

    async findAllFiles(): Promise<Media[]> {
        return await this.mediaRepository.find({
            where: { deleted: false },
            order: { createdAt: 'DESC' },
        });
    }

    async deleteFile(id: string): Promise<{ message: string }> {
        const media = await this.findFileById(id);

        if (this.configured && media.publicId) {
            try {
                await cloudinary.uploader.destroy(media.publicId);
            } catch (err) {
                this.logger.warn(`Impossible de supprimer le média distant Cloudinary [${media.publicId}]`);
            }
        }

        await this.mediaRepository.softDelete({ id } as any);
        return { message: 'Média supprimé avec succès' };
    }
}
