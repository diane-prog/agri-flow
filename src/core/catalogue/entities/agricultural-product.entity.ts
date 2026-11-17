import {
    Column,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { AgriculturalCategory } from './agricultural-category.entity';
import { MeasurementUnit } from './measurement-unit.entity';
import { ProductTranslation } from './product-translation.entity';

@Entity('agricultural_products')
export class AgriculturalProduct extends AbstractEntity<AgriculturalProduct> {
    @Column({ type: 'varchar', length: 80, unique: true })
    @Index({ unique: true })
    code: string; // maize_white, maize_yellow, soybean, rice_paddy, pineapple_sugarloaf...

    @ManyToOne(() => AgriculturalCategory, (cat) => cat.products, {
        nullable: false,
        onDelete: 'CASCADE',
        eager: true,
    })
    category: AgriculturalCategory;

    @ManyToOne(() => MeasurementUnit, {
        nullable: true,
        onDelete: 'SET NULL',
        eager: true,
    })
    defaultUnit?: MeasurementUnit;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @OneToMany(() => ProductTranslation, (trans) => trans.product, {
        cascade: true,
        eager: true,
    })
    translations: ProductTranslation[];
}
