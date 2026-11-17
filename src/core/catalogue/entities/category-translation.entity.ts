import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { AgriculturalCategory } from './agricultural-category.entity';

@Entity('category_translations')
@Unique(['category', 'locale'])
export class CategoryTranslation extends AbstractEntity<CategoryTranslation> {
    @ManyToOne(() => AgriculturalCategory, (cat) => cat.translations, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    category: AgriculturalCategory;

    @Column({ type: 'varchar', length: 10 })
    @Index()
    locale: string; // 'fr', 'fon', 'yo', 'en'

    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;
}
