import { BaseService } from './BaseService';

export interface NewsletterRequestData {
    email: string;
    newsletterType?: string;
    sleepCampaign?: boolean;
    videoSubscription?: boolean;
    customerNumber?: string;
}

export class NewsletterService {

    baseService: BaseService;

    constructor(baseService) {
        this.baseService = baseService;
    }

    public sendNewsletterRequest(data: NewsletterRequestData): Promise<any> {
        return this.baseService.post('NewsletterSubscribe', data);
    }


}
