import { Check, Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../libs/database/abstract.entity';
import { HarvestForecastStatusEnum } from '../../../common/enum';
import { AgriculturalProduct } from '../../catalogue/entities/agricultural-product.entity';
import { MeasurementUnit } from '../../catalogue/entities/measurement-unit.entity';
import { Farm } from './farm.entity';

@Entity('harvest_forecasts')
@Check('"cultivatedAreaHectares" > 0')
@Check('"estimatedQuantity" > 0')
export class HarvestForecast extends AbstractEntity<HarvestForecast> {
    @ManyToOne(() => Farm, (farm) => farm.harvestForecasts, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @Index()
    farm: Farm;

    @ManyToOne(() => AgriculturalProduct, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    @Index()
    product: AgriculturalProduct;

    @ManyToOne(() => MeasurementUnit, { nullable: false, eager: true, onDelete: 'RESTRICT' })
    unit: MeasurementUnit;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    cultivatedAreaHectares: number;

    @Column({ type: 'numeric', precision: 20, scale: 4 })
    estimatedQuantity: number;

    @Column({ type: 'timestamptz' })
    @Index()
    expectedHarvestDate: Date;

    @Column({ type: 'timestamptz', nullable: true })
    plantingDate?: Date;

    @Column({
        type: 'varchar',
        length: 30,
        default: HarvestForecastStatusEnum.PLANNED,
    })
    @Index()
    status: HarvestForecastStatusEnum;

    @Column({ type: 'text', nullable: true })
    notes?: string;
}
