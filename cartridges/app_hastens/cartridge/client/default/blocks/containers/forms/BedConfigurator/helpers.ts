import { __ } from '../../../../shared/helpers';

export const defaultValue = 'default_value';

export interface SummaryBody {
    value: string;
    image: string;
}


export function getPropertyTranslation(propertyCode: string): string {
    const prefixCode = 'bedconf.' + propertyCode;
    const translated = __(prefixCode);
    return translated !== prefixCode ? translated : propertyCode;
}

export function findDeep(data, code): SummaryBody {
    if (data) {
        for (const item of data) {
            if (item.code === code) {
                return {
                    value: item.displayName,
                    image: item.image,
                };
            } else if (item.controls) {
                const found = findDeep(item.controls, code);
                if (found) return found;
            } else if (item.data) {
                const found = findDeep(item.data.options, code);
                if (found) return found;
            }
        }
    }
}
