import { BaseService } from './BaseService';

export interface PartnerSignUpData {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    country: string;
    description: string;
    marketingConsent: boolean;
    recaptcha: string;
}

export class PartnerService {

    baseService: BaseService;

    constructor(baseService) {
        this.baseService = baseService;
    }

    public submitApplication(data: PartnerSignUpData): Promise<any> {
        return this.baseService.post('SalesforceNbdLead', data);
    }


}
