import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews & Ratings')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Public()
    @Get('user/:userId')
    @ApiOperation({ summary: 'Consulter la réputation, note moyenne et avis d’un acteur' })
    @ApiResponse({ status: 200, description: 'Statistiques et liste des avis' })
    async getUserReviews(@Param('userId') userId: string) {
        return await this.reviewsService.getUserReviews(userId);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Évaluer son partenaire commercial après une commande terminée' })
    @ApiResponse({ status: 201, description: 'Évaluation enregistrée' })
    async create(
        @CurrentUser('id') reviewerId: string,
        @Body() dto: CreateReviewDto,
    ): Promise<Review> {
        return await this.reviewsService.create(reviewerId, dto);
    }
}
