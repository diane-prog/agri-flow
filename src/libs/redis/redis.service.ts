import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly client: Redis | null = null;
    private readonly logger = new Logger(RedisService.name);
    private readonly enabled: boolean;

    constructor(private readonly configService: ConfigService) {
        this.enabled = this.configService.get<boolean>('redis.enabled', false);

        if (this.enabled) {
            const url = this.configService.get<string>('redis.url');
            this.client = new Redis(url, {
                lazyConnect: true,
                maxRetriesPerRequest: 3,
            });

            this.client.on('connect', () => {
                this.logger.log('Connected to Redis server');
            });

            this.client.on('error', (err) => {
                this.logger.error(`Redis connection error: ${err.message}`);
            });
        } else {
            this.logger.log('Redis is disabled in current configuration');
        }
    }

    getClient(): Redis | null {
        return this.client;
    }

    isEnabled(): boolean {
        return this.enabled && this.client !== null;
    }

    async get(key: string): Promise<string | null> {
        if (!this.isEnabled()) return null;
        return this.client.get(key);
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (!this.isEnabled()) return;
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        if (!this.isEnabled()) return;
        await this.client.del(key);
    }

    async onModuleDestroy(): Promise<void> {
        if (this.client) {
            await this.client.quit();
        }
    }
}
