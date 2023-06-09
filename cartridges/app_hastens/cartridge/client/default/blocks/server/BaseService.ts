import { fetch as fetchPolyfill } from 'whatwg-fetch';
import uniqueId from 'lodash/uniqueId';

interface ErrorHandler {
    id: string;
    func: (errorMessage?: string) => void;
}

interface SuccessContent {
    status: string;
    code: number;
    body: string;
}

interface ErrorContent {
    status: string;
    code: number;
    message: string;
}

export class BaseService {

    backendUrl: string;

    private errorHandlers: ErrorHandler[] = [];

    constructor(backendUrl: string) {
        this.backendUrl = backendUrl;
    }

    public registerErrorHandler(func: (errorMessage: string) => void): string {
        const id = uniqueId();
        this.errorHandlers.push({ id, func });
        return id;
    }

    public unregisterErrorHandler(id: string) {
        const index = this.errorHandlers.findIndex((errorHandler) => errorHandler.id === id);
        this.errorHandlers.splice(index, 1);
    }

    public get(uri: string): Promise<any> {
        const config = {
            method: 'GET',
        };
        return fetchPolyfill(this.backendUrl + uri, config).then(
            (response: Response) => this.handleFetchSuccess(response),
            () => this.handleFetchError(),
        );
    }

    public post(uri: string, data): Promise<any> {
        const config = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        };
        return fetchPolyfill(this.backendUrl + uri, config).then(
            (response: Response) => this.handleFetchSuccess(response),
            () => this.handleFetchError(),
        );
    }

    public getFile(uri: string): Promise<any> {
        const config = {
            method: 'GET',
        };
        return fetchPolyfill(uri, config).then((response: Response) => response.text());
    }

    private handleFetchSuccess(response: Response) {
        if (response.status === 500) {
            this.throwError('There was an error when contacting the server. Please try again later.');
        }
        if (!response.ok) {
            return response.json().then(
                (json: ErrorContent) => {
                    this.throwError(json.message);
                },
                () => {
                    this.throwError();
                },
            );
        }
        return response.json().then((json: SuccessContent) => json.body);
    }

    private handleFetchError() {
        this.throwError('Unable to contact the server. Check your internet connection or try again later.');
    }

    private throwError(errorMessage?: string): never {
        this.errorHandlers.forEach((errorHandler) => {
            errorHandler.func(errorMessage);
        });
        throw new Error();
    }

}
