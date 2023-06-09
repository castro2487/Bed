import { BaseService } from './BaseService';

interface MarketingConsentResponse {
    isValid: boolean;
    isMarketingConsentGiven: boolean;
}

export interface CatalogRequestData {
    firstname: string;
    lastname: string;
    email: string;
    phonePrefix: string;
    phone: string;
    recaptcha: string;
    street: string;
    apartmentNumber: string;
    region: string;
    city: string;
    zipCode: string;
    country: string;
    consent?: boolean;
    location?: number;
    formId: string;
    position: any;
    partnerPageSlug?: string;
    origin?: string;
    originUrl?: string;
    locationId?: number;
    catalogLanguage: string;
}

export class CatalogService {

    baseService: BaseService;

    constructor(baseService) {
        this.baseService = baseService;
    }

    public checkEmailMarketingConsent(email): Promise<MarketingConsentResponse> {
        return this.baseService.post('ContactEmailConsent', email);
    }

    public sendCatalogRequest(data: CatalogRequestData): Promise<any> {
        return this.baseService.post('CatalogSubscribe', data);
    }

    public getCatalogLanguages() {
        return [
            { value: 'en', label: 'English UK' },
            { value: 'us', label: 'English USA' },
            { value: 'se', label: 'Swedish' },
            { value: 'dk', label: 'Danish' },
            { value: 'zh', label: 'Chinese' },
            { value: 'es', label: 'Spanish' },
            { value: 'it', label: 'Italian' },
            { value: 'de', label: 'German' },
            { value: 'nl', label: 'Dutch' },
            { value: 'fr', label: 'French' },
        ];
    }

}
