import {
    Column,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { AgriculturalProduct } from './agricultural-product.entity';
import { CategoryTranslation } from './category-translation.entity';

@Entity('agricultural_categories')
export class AgriculturalCategory extends AbstractEntity<AgriculturalCategory> {
    @Column({ type: 'varchar', length: 80, unique: true })
    @Index({ unique: true })
    code: string; // cereals, legumes, fruits, vegetables, tubers, oilseeds, processed...

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    sortOrder: number;

    /**
     * Schéma JSON des attributs techniques requis pour les produits de cette catégorie
     * (humidité max, état de séchage, calibre, variété, etc.)
     */
    @Column({ type: 'jsonb', default: () => "'[]'" })
    attributesSchema: any[];

    @ManyToOne(() => AgriculturalCategory, (cat) => cat.children, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    parent?: AgriculturalCategory;

    @OneToMany(() => AgriculturalCategory, (cat) => cat.parent)
    children: AgriculturalCategory[];

    @OneToMany(() => CategoryTranslation, (trans) => trans.category, {
        cascade: true,
        eager: true,
    })
    translations: CategoryTranslation[];

    @OneToMany(() => AgriculturalProduct, (product) => product.category)
    products: AgriculturalProduct[];
}
