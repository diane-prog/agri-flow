import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { Location } from './entities/location.entity';
import { LocationsRepository } from './repositories/locations.repository';

@Injectable()
export class LocationsService implements OnApplicationBootstrap {
    private readonly logger = new Logger(LocationsService.name);

    constructor(private readonly locationsRepository: LocationsRepository) {}

    async onApplicationBootstrap() {
        await this.seedDefaultLocations();
    }

    async create(dto: CreateLocationDto): Promise<Location> {
        const location = new Location({
            name: dto.name,
            country: dto.country ?? 'BJ',
            department: dto.department,
            commune: dto.commune,
            arrondissement: dto.arrondissement,
            address: dto.address,
            latitude: dto.latitude,
            longitude: dto.longitude,
        });

        if (dto.latitude && dto.longitude) {
            location.coordinates = {
                type: 'Point',
                coordinates: [dto.longitude, dto.latitude],
            };
        }

        return await this.locationsRepository.create(location);
    }

    async findAll(department?: string, search?: string): Promise<Location[]> {
        const query = this.locationsRepository
            .getRepository()
            .createQueryBuilder('location')
            .where('location.deleted = :deleted', { deleted: false });

        if (department) {
            query.andWhere('LOWER(location.department) = LOWER(:department)', {
                department,
            });
        }

        if (search) {
            query.andWhere(
                '(LOWER(location.name) LIKE LOWER(:search) OR LOWER(location.commune) LIKE LOWER(:search))',
                { search: `%${search}%` },
            );
        }

        return await query.orderBy('location.name', 'ASC').getMany();
    }

    async findById(id: string): Promise<Location | null> {
        return await this.locationsRepository.findById(id);
    }

    async getRegions(): Promise<string[]> {
        return ['Sud', 'Centre', 'Nord'];
    }

    async getDepartments(): Promise<string[]> {
        return [
            'Alibori',
            'Atacora',
            'Atlantique',
            'Borgou',
            'Collines',
            'Couffo',
            'Donga',
            'Littoral',
            'Mono',
            'Ouémé',
            'Plateau',
            'Zou',
        ];
    }

    async getCommunes(department?: string): Promise<{ department: string; commune: string }[]> {
        const query = this.locationsRepository
            .getRepository()
            .createQueryBuilder('location')
            .where('location.deleted = false');

        if (department) {
            query.andWhere('LOWER(location.department) = LOWER(:department)', { department });
        }

        const locations = await query.getMany();
        const seen = new Set<string>();
        const list: { department: string; commune: string }[] = [];

        for (const loc of locations) {
            if (loc.commune) {
                const key = `${loc.department}_${loc.commune}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    list.push({ department: loc.department, commune: loc.commune });
                }
            }
        }

        return list;
    }

    /**
     * Seeds initial major agricultural and commercial hubs in Benin.
     */
    private async seedDefaultLocations() {
        try {
            const count = await this.locationsRepository.count();
            if (count > 0) return;

            const beninHubs = [
                {
                    name: 'Marché de Gros de Bohicon',
                    department: 'Zou',
                    commune: 'Bohicon',
                    latitude: 7.1783,
                    longitude: 2.0667,
                    address: 'Carrefour Zakpo, Bohicon',
                },
                {
                    name: 'Marché Arzéké de Parakou',
                    department: 'Borgou',
                    commune: 'Parakou',
                    latitude: 9.3372,
                    longitude: 2.6303,
                    address: 'Centre commercial Parakou',
                },
                {
                    name: 'Marché International de Malanville',
                    department: 'Alibori',
                    commune: 'Malanville',
                    latitude: 11.8686,
                    longitude: 3.3831,
                    address: 'Frontière Niger-Bénin, Malanville',
                },
                {
                    name: 'Marché International Dantokpa',
                    department: 'Littoral',
                    commune: 'Cotonou',
                    latitude: 6.3654,
                    longitude: 2.4286,
                    address: 'Bordure lagune, Cotonou',
                },
                {
                    name: 'Bassin Agricole de Glazoué (Riz & Maïs)',
                    department: 'Collines',
                    commune: 'Glazoué',
                    latitude: 7.9744,
                    longitude: 2.2417,
                    address: 'Centre collecte Glazoué',
                },
                {
                    name: 'Bassin Agricole d\'Allada (Ananas)',
                    department: 'Atlantique',
                    commune: 'Allada',
                    latitude: 6.6653,
                    longitude: 2.1514,
                    address: 'Zone de production Allada',
                },
                {
                    name: 'Marché Central de Djougou',
                    department: 'Donga',
                    commune: 'Djougou',
                    latitude: 9.7085,
                    longitude: 1.6660,
                    address: 'Grand marché Djougou',
                },
            ];

            for (const hub of beninHubs) {
                await this.create(hub);
            }

            this.logger.log('✅ Hubs agricoles et marchés du Bénin initialisés avec succès.');
        } catch (error) {
            this.logger.warn(`Locations seed skipped: ${error.message}`);
        }
    }
}
