import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import { SignUploadDto } from './dto/sign-upload.dto';
import { Media } from './entities/media.entity';
import { MediaService } from './media.service';

@ApiTags('Media & Cloudinary (Photos & Documents)')
@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) {}

    @Public()
    @Post('sign')
    @ApiOperation({ summary: 'Générer une signature pour upload direct vers Cloudinary (Front-to-Cloud)' })
    @ApiResponse({ status: 200, description: 'Signature Cloudinary générée' })
    sign(@Body() dto: SignUploadDto) {
        return this.mediaService.signUpload(dto);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard)
    @Post('confirm')
    @ApiOperation({ summary: 'Enregistrer les métadonnées après un upload direct' })
    @ApiResponse({ status: 201, description: 'Métadonnées enregistrées' })
    confirm(
        @Body() dto: ConfirmUploadDto,
        @CurrentUser('id') userId?: string,
    ): Promise<Media> {
        return this.mediaService.confirmUpload(dto, userId);
    }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Lister tous les médias enregistrés' })
    findAll(): Promise<Media[]> {
        return this.mediaService.findAllFiles();
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Consulter un média par son identifiant' })
    findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Media> {
        return this.mediaService.findFileById(id);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
        }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary', description: 'Fichier image ou document' },
            },
            required: ['file'],
        },
    })
    @ApiOperation({ summary: 'Uploader une photo / document vers Cloudinary via l\'API' })
    @ApiResponse({ status: 201, description: 'Fichier uploadé et URL Cloudinary retournée' })
    upload(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser('id') userId?: string,
    ): Promise<Media> {
        if (!file) {
            throw new BadRequestException('Fichier requis');
        }

        return this.mediaService.uploadFile(file, 'agriflow/uploads', userId);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard)
    @Post('upload-multiple')
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            limits: { fileSize: 25 * 1024 * 1024 },
        }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description: 'Liste de fichiers (jusqu’à 10 photos)',
                },
            },
            required: ['files'],
        },
    })
    @ApiOperation({ summary: 'Uploader plusieurs photos d’annonces en une seule requête' })
    @ApiResponse({ status: 201, description: 'Fichiers uploadés avec succès' })
    uploadMany(
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser('id') userId?: string,
    ): Promise<Media[]> {
        if (!files || files.length === 0) {
            throw new BadRequestException('Au moins un fichier est requis');
        }

        return this.mediaService.uploadFiles(files, 'agriflow/listings', userId);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer un média de Cloudinary et de la base de données' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.mediaService.deleteFile(id);
    }
}
