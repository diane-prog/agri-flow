import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { AgriculturalProduct } from './agricultural-product.entity';

@Entity('product_translations')
@Unique(['product', 'locale'])
export class ProductTranslation extends AbstractEntity<ProductTranslation> {
    @ManyToOne(() => AgriculturalProduct, (prod) => prod.translations, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    product: AgriculturalProduct;

    @Column({ type: 'varchar', length: 10 })
    @Index()
    locale: string; // 'fr', 'fon', 'yo', 'en'

    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;
}
