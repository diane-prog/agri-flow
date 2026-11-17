export enum UserRoleEnum {
    PUBLIC = 'PUBLIC',
    USER = 'USER',
    PRODUCER = 'PRODUCER',
    BUYER = 'BUYER',
    TRANSPORTER = 'TRANSPORTER',
    ORGANIZATION_OWNER = 'ORGANIZATION_OWNER',
    ORGANIZATION_MANAGER = 'ORGANIZATION_MANAGER',
    ORGANIZATION_MEMBER = 'ORGANIZATION_MEMBER',
    PLATFORM_AGENT = 'PLATFORM_AGENT',
    MODERATOR = 'MODERATOR',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum VerificationLevelEnum {
    LEVEL_0 = 0, // Unverified
    LEVEL_1 = 1, // Identity verified
    LEVEL_2 = 2, // Certified professional actor
}

export enum TransactionModeEnum {
    DIRECT = 'DIRECT',
    ASSISTED = 'ASSISTED',
}

export enum ListingStatusEnum {
    DRAFT = 'DRAFT',
    PENDING_REVIEW = 'PENDING_REVIEW',
    ACTIVE = 'ACTIVE',
    RESERVED = 'RESERVED',
    PAUSED = 'PAUSED',
    SOLD_OUT = 'SOLD_OUT',
    EXPIRED = 'EXPIRED',
    REJECTED = 'REJECTED',
    ARCHIVED = 'ARCHIVED',
}

export enum PurchaseRequestStatusEnum {
    DRAFT = 'DRAFT',
    OPEN = 'OPEN',
    PARTIALLY_FULFILLED = 'PARTIALLY_FULFILLED',
    FULFILLED = 'FULFILLED',
    CLOSED = 'CLOSED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
}

export enum OfferStatusEnum {
    PENDING = 'PENDING',
    COUNTERED = 'COUNTERED',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN',
    EXPIRED = 'EXPIRED',
}

export enum OrderStatusEnum {
    PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',
    DISPATCHED = 'DISPATCHED',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    DISPUTED = 'DISPUTED',
}

export enum DeliveryStatusEnum {
    PENDING = 'PENDING',
    PICKED_UP = 'PICKED_UP',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    ACCEPTED = 'ACCEPTED',
    DISPUTED = 'DISPUTED',
}

export enum OrganizationTypeEnum {
    COOPERATIVE = 'COOPERATIVE',
    AGRIBUSINESS = 'AGRIBUSINESS',
    AGRO_PROCESSOR = 'AGRO_PROCESSOR',
    COMMERCIAL_COMPANY = 'COMMERCIAL_COMPANY',
    PROFESSIONAL_ASSOCIATION = 'PROFESSIONAL_ASSOCIATION',
    TRANSPORTER_ORG = 'TRANSPORTER_ORG',
}

export enum OrganizationRoleEnum {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    MEMBER = 'MEMBER',
}

export enum OrganizationVerificationStatusEnum {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
}

export enum InvitationStatusEnum {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
}

export enum HarvestForecastStatusEnum {
    PLANNED = 'PLANNED',
    GROWING = 'GROWING',
    HARVESTED = 'HARVESTED',
    CANCELLED = 'CANCELLED',
}

export enum FileTypeEnum {
    IMAGE = 'IMAGE',
    DOCUMENT = 'DOCUMENT',
    PDF = 'PDF',
    VIDEO = 'VIDEO',
    OTHER = 'OTHER',
}
