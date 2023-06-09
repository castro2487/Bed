import { BaseService } from './BaseService';

export interface AvailableTimeSlotsResponse {
    dates: TimeSlot[];
    startDate: string;
    endDate: string;
    partnerSlug: string;
}

export interface TimeSlot {
    date: string;
    from: string;
    to: string;
}

export interface PrivateSessionRequestData {
    date: string;
    from: string;
    to: string;
    firstName: string;
    lastName: string;
    email: string;
    phonePrefix: string;
    phone: string;
    partnerSlug: string;
    preferredLanguage: string;
    recaptcha: string;
}

export default class PrivateSessionService {

    baseService: BaseService;

    constructor(baseService) {
        this.baseService = baseService;
    }

    public getAvailableTimeSlots(partnerSlug: string): Promise<AvailableTimeSlotsResponse> {
        return this.baseService.get(`MeetingPsTimeSlots?partnerSlug=${partnerSlug}`);
    }

    public requestPrivateSession(data: PrivateSessionRequestData): Promise<void> {
        return this.baseService.post('MeetingPsBook', data);
    }

}
