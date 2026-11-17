import { Column, Entity, Index } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';

@Entity('locations')
export class Location extends AbstractEntity<Location> {
    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'varchar', length: 3, default: 'BJ' })
    country: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    @Index()
    department?: string; // Borgou, Zou, Ouémé, Atlantique, Alibori, etc.

    @Column({ type: 'varchar', length: 100, nullable: true })
    @Index()
    commune?: string; // Bohicon, Parakou, Cotonou, Djougou, etc.

    @Column({ type: 'varchar', length: 100, nullable: true })
    arrondissement?: string;

    @Column({ type: 'text', nullable: true })
    address?: string;

    @Column({ type: 'numeric', precision: 10, scale: 8, nullable: true })
    latitude?: number;

    @Column({ type: 'numeric', precision: 11, scale: 8, nullable: true })
    longitude?: number;

    // GeoJSON Point coordinates { type: 'Point', coordinates: [lng, lat] }
    @Column({
        type: 'jsonb',
        nullable: true,
    })
    coordinates?: { type: string; coordinates: [number, number] } | any;
}
