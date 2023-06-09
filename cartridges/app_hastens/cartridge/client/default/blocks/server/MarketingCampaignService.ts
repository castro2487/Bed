import { BaseService } from './BaseService';

export interface PositionFormData {
    method: string | null;
    longitude: number | null;
    latitude: number | null;
}

export interface FormData {
    country: string;
    location?: string;
    firstname: string;
    lastname: string;
    email: string;
    mobileNumber?: string;
    recaptcha: string;
    newsLetter: boolean;
    formId: string;
    telephone: string;
    phonePrefix: string;
    position: PositionFormData;
}

export class MarketingCampaignService {

    baseService: BaseService;

    constructor(baseService) {
        this.baseService = baseService;
    }

    public bookBedTest(formData: FormData): Promise<any> {
        return this.baseService.post('MeetingBook', formData);
    }

}
