import { BaseService } from './BaseService';

export interface PositionData {
    longitude: number;
    latitude: number;
    countryCode: string;
}

export interface Country {
    code: string;
    name: string;
}

export interface Store {
    address: {
        country: {
            code: string;
            name: string;
        };
    };
    id: number;
    name: string;
}

export class LocationService {
    baseService: BaseService;

    constructor(baseService) {
        this.baseService = baseService;
    }

    public getPositionByIp(): Promise<PositionData> {
        return this.baseService.get('CoordinatesGetCoordinates');
    }

    public getCountries(): Promise<Country[]> {
        return this.baseService.get('CountriesGetAll');
    }

    public getStores(): Promise<Store[]> {
        return this.baseService.get('LocationGetAllStores');
    }

    public getCustomerDetails(country = 'NL', customerNumber: string) {
        let params = 'country=' + country;

        if (customerNumber) {
            params += '&customerNumber=' + customerNumber;
        }

        return this.baseService.get('CountriesDefaultCustomer?' + params);
    }
}
