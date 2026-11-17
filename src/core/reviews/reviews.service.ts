import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { OrderStatusEnum } from '../../common/enum';
import { OrdersRepository } from '../orders/repositories/orders.repository';
import { UsersRepository } from '../users/repositories/users.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';
import { ReviewsRepository } from './repositories/reviews.repository';

@Injectable()
export class ReviewsService {
    constructor(
        private readonly reviewsRepo: ReviewsRepository,
        private readonly ordersRepo: OrdersRepository,
        private readonly usersRepo: UsersRepository,
    ) {}

    /**
     * Publie une évaluation bilatérale post-commande terminée.
     */
    async create(reviewerId: string, dto: CreateReviewDto): Promise<Review> {
        const order = await this.ordersRepo.findById(dto.orderId, ['buyerUser', 'sellerUser']);
        if (!order) {
            throw new NotFoundException(`Commande ${dto.orderId} introuvable`);
        }

        // Règle PRD : Une évaluation n'est éligible que si la commande est COMPLETED
        if (order.status !== OrderStatusEnum.COMPLETED) {
            throw new BadRequestException(
                'Seules les commandes finalisées et livrées avec succès peuvent être évaluées.',
            );
        }

        let targetUser: any;
        if (order.buyerUser?.id === reviewerId) {
            targetUser = order.sellerUser; // L'acheteur évalue le vendeur
        } else if (order.sellerUser?.id === reviewerId) {
            targetUser = order.buyerUser; // Le vendeur évalue l'acheteur
        } else {
            throw new ForbiddenException(
                'Vous ne pouvez pas évaluer une transaction à laquelle vous n\'avez pas participé.',
            );
        }

        const reviewer = await this.usersRepo.findById(reviewerId);

        // Vérifier si l'évaluation a déjà été soumise par cette personne pour cette commande
        const existing = await this.reviewsRepo.findOne({
            where: {
                order: { id: dto.orderId } as any,
                reviewer: { id: reviewerId } as any,
                deleted: false,
            },
        });
        if (existing) {
            throw new ConflictException('Vous avez déjà évalué cette commande');
        }

        const review = new Review({
            order,
            reviewer: reviewer!,
            targetUser,
            rating: dto.rating,
            comment: dto.comment,
            criteria: dto.criteria ?? {},
            isPublic: true,
        });

        return await this.reviewsRepo.create(review);
    }

    /**
     * Calcule la note moyenne et liste les avis d'un acteur.
     */
    async getUserReviews(userId: string) {
        const reviews = await this.reviewsRepo.find({
            where: { targetUser: { id: userId } as any, isPublic: true, deleted: false },
            relations: ['reviewer'],
            order: { createdAt: 'DESC' },
        });

        const total = reviews.length;
        const average =
            total > 0
                ? Number(
                      (
                          reviews.reduce((acc, r) => acc + Number(r.rating), 0) /
                          total
                      ).toFixed(1),
                  )
                : 0;

        return {
            averageRating: average,
            totalReviews: total,
            reviews,
        };
    }
}
