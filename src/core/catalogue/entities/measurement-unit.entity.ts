import { Column, Entity, Index } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';

@Entity('measurement_units')
export class MeasurementUnit extends AbstractEntity<MeasurementUnit> {
    @Column({ type: 'varchar', length: 30, unique: true })
    @Index({ unique: true })
    code: string; // kg, tonne, sac_50kg, sac_100kg, bassine, etc.

    @Column({ type: 'varchar', length: 80 })
    name: string; // Kilogramme, Tonne, Sac de 50 kg...

    @Column({ type: 'varchar', length: 30, default: 'WEIGHT' })
    dimension: string; // WEIGHT, VOLUME, UNIT

    @Column({ type: 'numeric', precision: 24, scale: 10, default: 1 })
    baseFactor: number; // Ex: 1 for kg, 1000 for tonne, 50 for sac_50kg
}
