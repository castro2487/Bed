import { BaseService } from './BaseService';

export interface CollaborationRequestData {
    address: string;
    agreeToEmails: boolean;
    city: string;
    commercialClients: boolean;
    company: string;
    companynr: string;
    country: string;
    email: string;
    firstname: string;
    lastname: string;
    location: number;
    mobile: string;
    privateClients: boolean;
    recaptcha: string;
    telephone: string;
    website: string;
    zipcode: string;
}

export class CollaborationService {

    baseService: BaseService;

    constructor(baseService) {
        this.baseService = baseService;
    }

    public sendCollaborationRequest(data: CollaborationRequestData): Promise<any> {
        return this.baseService.post('CollaborationsPost', data);
    }

    public restoreCampaignRequest(data): Promise<any> {
        return this.baseService.post('CollaborationsRestoreCampaign', data);
    }

}
