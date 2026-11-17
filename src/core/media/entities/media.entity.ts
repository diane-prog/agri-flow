import { Column, Entity, Index } from 'typeorm';
import { FileTypeEnum } from '../../../common/enum';
import { AbstractEntity } from '../../../libs/database/abstract.entity';

@Entity('media')
export class Media extends AbstractEntity<Media> {
    @Column({ nullable: false })
    @Index()
    publicId: string;

    @Column({ nullable: true })
    label?: string;

    @Column({ type: 'text', nullable: false })
    url: string;

    @Column({ type: 'text', nullable: true })
    secureUrl?: string;

    @Column({ nullable: true })
    folder?: string;

    @Column({ nullable: true })
    format?: string;

    @Column({ nullable: true })
    mimetype?: string;

    @Column({ type: 'int', nullable: true })
    width?: number;

    @Column({ type: 'int', nullable: true })
    height?: number;

    @Column({ type: 'int', default: 0 })
    bytes: number;

    @Column({
        type: 'varchar',
        length: 30,
        default: FileTypeEnum.IMAGE,
    })
    type: FileTypeEnum;

    @Column({ nullable: true })
    resourceType?: string;

    @Column({ nullable: true })
    @Index()
    ownerId?: string;

    @Column({ default: false })
    isTemporary: boolean;
}
