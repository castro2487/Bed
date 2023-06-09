import cloneDeep from 'lodash/cloneDeep';

import { Rule } from '../../../server/BedOrderService';
import { defaultValue } from './helpers';

export const TYPE_LOGICAL = 'logical';
export const TYPE_COMPARATOR = 'comparator';

class RuleEvaluatorService {

    public evaluate(rules: Rule[], params: any) {
        const rule = {
            type: TYPE_LOGICAL,
            operator: '&&',
            rules,
        } as Rule;
        return this.evaluateLogical(rule, params);
    }

    private evaluateRule(rule: Rule, params: any) {
        switch (rule.type) {
            case TYPE_LOGICAL:
                return this.evaluateLogical(rule, params);
            case TYPE_COMPARATOR:
                return this.evaluateComparator(rule, params);
            default:
                throw new Error('Invalid type');
        }
    }

    private evaluateLogical(rule: Rule, params: any) {
        if (rule.operator === '&&') {
            for (const subRule of rule.rules) {
                if (this.evaluateRule(subRule, params) === false) {
                    return false;
                }
            }

            return true;
        }

        if (rule.operator === '||') {
            for (const subRule of rule.rules) {
                if (this.evaluateRule(subRule, params) === true) {
                    return true;
                }
            }

            return false;
        }

        throw new Error('Invalid operator');
    }

    private evaluateComparator(rule: Rule, params: any) {
        if (!rule.property) {
            throw new Error('No property defined');
        }
        let value = params.hasOwnProperty(rule.property) ? cloneDeep(params[rule.property]) : undefined;
        if (value === defaultValue) {
            value = '';
        }

        switch (rule.operator) {
            case '==':
                return value === rule.value;
            case '!=':
                return value !== rule.value;
            case '>=':
                return parseFloat(value) >= parseFloat(rule.value);
            case '>':
                return parseFloat(value) > parseFloat(rule.value);
            case '<=':
                return parseFloat(value) <= parseFloat(rule.value);
            case '<':
                return parseFloat(value) < parseFloat(rule.value);
            default:
                throw new Error('Invalid operator');
        }
    }

}

export const ruleEvaluatorService = new RuleEvaluatorService();
