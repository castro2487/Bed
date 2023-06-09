import { BaseService } from './BaseService';

export interface Bed {
    code: string;
    displayName: string;
    images: {
        icon: string;
        large: string;
    };
    tabs: BedTab[];
}

export interface BedTab {
    displayName: string;
    controls: TabControl[];
    isDisabled: boolean;
}

export interface TabControl {
    displayName: string;
    code: string;
    description: string;
    dataType: 'choice' | 'list' | 'text' | 'size';
    rules: Rule[];
    minWidth?: number;
    maxWidth?: number;
    minLength?: number;
    maxLength?: number;
    data?: {
        options: DataOption[] | { [nation: string]: SizeDataOption[] };
    };
}

export interface DataOption {
    code: string;
    displayName: string;
    displayCode?: string;
    rules: Rule[];
    image: string;
    disabled?: boolean;
}

export interface SizeDataOption {
    width: number;
    length: number;
    displayName: string;
}

export interface Rule {
    operator: string;
    property: string;
    rules: Rule[];
    type: string;
    value: string;
}

export interface Contact {
    city: string;
    email: string;
    phone: string;
    street: string;
    region: string;
    zipCode: string;
    country: string;
    lastname: string;
    firstname: string;
    apartmentNumber: string;
    selectedCountry: string;
}

export interface PriceRequestData {
    bed: {
        type: string;
        width: number;
        length: number;
        color: string;
        split_base: string;
        nameplate: string;
        left_nameplate: string;
        right_nameplate: string;
        split_mattress: string;
        firmness: string;
        split_top_mattress: string;
        top_mattress_type: string;
        legs: string;
        middle_leg_link: string;
    };
    customerNumber: string;
}

export interface BedPrice {
    currency: string;
    recFullPrice: string;
    totalLegsWorth: string;
}

interface LocationData {
    latitude: string;
    longitude: string;
    countryCode: string;
}

export class BedOrderService {

    baseService: BaseService;

    constructor(baseService) {
        this.baseService = baseService;
    }

    public getBeds(): Promise<Bed[]> {
        return this.baseService.get('EndConsumerBedsList');
    }

    public getBedsPrice(data: PriceRequestData): Promise<BedPrice> {
        return this.baseService.post('EndConsumerQuoteBedPrice', data);
    }

    public postQuote(data): Promise<any> {
        return this.baseService.post('EndConsumerQuoteSave', data);
    }

    public locationRequest(): Promise<LocationData> {
        return this.baseService.get('CoordinatesGetCoordinates');
    }

}
