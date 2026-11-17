import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { MediaController } from './media.controller';
import { MediaRepository } from './repositories/media.repository';
import { MediaService } from './media.service';

@Module({
    imports: [TypeOrmModule.forFeature([Media])],
    controllers: [MediaController],
    providers: [MediaService, MediaRepository],
    exports: [MediaService, MediaRepository],
})
export class MediaModule {}
