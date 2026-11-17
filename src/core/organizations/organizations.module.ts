import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../admin/entities/audit-log.entity';
import { AgriculturalProduct } from '../catalogue/entities/agricultural-product.entity';
import { MeasurementUnit } from '../catalogue/entities/measurement-unit.entity';
import { Location } from '../locations/entities/location.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { Farm } from './entities/farm.entity';
import { HarvestForecast } from './entities/harvest-forecast.entity';
import { OrganizationInvitation } from './entities/organization-invitation.entity';
import { OrganizationMember } from './entities/organization-member.entity';
import { Organization } from './entities/organization.entity';
import { FarmsController } from './farms.controller';
import { OrganizationsController } from './organizations.controller';
import { FarmsService } from './services/farms.service';
import { OrganizationsService } from './services/organizations.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Organization,
            OrganizationMember,
            OrganizationInvitation,
            Farm,
            HarvestForecast,
            Location,
            UserRole,
            AuditLog,
            AgriculturalProduct,
            MeasurementUnit,
        ]),
    ],
    controllers: [OrganizationsController, FarmsController],
    providers: [OrganizationsService, FarmsService],
    exports: [OrganizationsService, FarmsService],
})
export class OrganizationsModule {}
