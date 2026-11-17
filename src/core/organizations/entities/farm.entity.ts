import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { Location } from '../../locations/entities/location.entity';
import { User } from '../../users/entities/user.entity';
import { Organization } from './organization.entity';
import { HarvestForecast } from './harvest-forecast.entity';

@Entity('farms')
export class Farm extends AbstractEntity<Farm> {
    @Column({ type: 'varchar', length: 150 })
    @Index()
    name: string;

    @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @Index()
    ownerUser: User;

    @ManyToOne(() => Organization, (org) => org.farms, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @Index()
    organization?: Organization;

    @ManyToOne(() => Location, { nullable: true, eager: true, onDelete: 'SET NULL' })
    location?: Location;

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    totalAreaHectares: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    soilType?: string; // Limoneux, Argileux, Sablo-limoneux, etc.

    @Column({ type: 'varchar', length: 100, nullable: true })
    waterSource?: string; // Forage, Rivière, Bas-fond, Pluvial

    @Column({ type: 'jsonb', default: () => "'[]'" })
    primaryCommodities: string[]; // ['maize_white', 'pineapple_sugarloaf', 'soya_grain']

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @OneToMany(() => HarvestForecast, (forecast) => forecast.farm)
    harvestForecasts: HarvestForecast[];
}
