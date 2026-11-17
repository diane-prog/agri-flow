import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class ErrorHandlingService {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) readonly logger: Logger) {}

    returnErrorOnNotFound(loggerMessage: string, errorMessage: string): never {
        this.logger.error(loggerMessage);
        throw new NotFoundException(errorMessage);
    }

    returnErrorOnBadRequest(
        loggerMessage: string,
        errorMessage: string,
    ): never {
        this.logger.error(loggerMessage);
        throw new BadRequestException(errorMessage);
    }

    returnErrorTooManyRequests(
        loggerMessage: string,
        errorMessage: string,
    ): never {
        this.logger.error(loggerMessage);
        throw new HttpException(errorMessage, HttpStatus.TOO_MANY_REQUESTS);
    }

    returnErrorOnInternalServerError(
        loggerMessage: string,
        errorMessage: string,
    ): never {
        this.logger.error(loggerMessage);
        throw new InternalServerErrorException(errorMessage);
    }

    returnErrorOnForbidden(loggerMessage: string, errorMessage: string): never {
        this.logger.error(loggerMessage);
        throw new ForbiddenException(errorMessage);
    }

    returnErrorOnConflict(loggerMessage: string, errorMessage: string): never {
        this.logger.error(loggerMessage);
        throw new ConflictException(errorMessage);
    }
}
