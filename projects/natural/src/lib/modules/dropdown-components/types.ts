import {FilterGroupConditionField} from '../search/classes/graphql-doctrine.types';

type PossibleNullableOperatorKeys = 'any' | 'none';

type PossibleNullableOperator = {
    key: PossibleNullableOperatorKeys;
    label: string;
};

const possibleNullableOperators: readonly PossibleNullableOperator[] = [
    {
        key: 'any',
        label: $localize`avec`,
    },
    {
        key: 'none',
        label: $localize`sans`,
    },
] as const;

export type PossibleComparableOperatorKeys =
    | keyof Pick<FilterGroupConditionField, 'less' | 'lessOrEqual' | 'equal' | 'greaterOrEqual' | 'greater'>
    | PossibleNullableOperatorKeys;

export type PossibleComparableOperator = {
    key: PossibleComparableOperatorKeys;
    label: string;
};

export const possibleComparableOperators: readonly PossibleComparableOperator[] = [
    {
        key: 'less',
        label: '<',
    },
    {
        key: 'lessOrEqual',
        label: '≤',
    },
    {
        key: 'equal',
        label: '=',
    },
    {
        key: 'greaterOrEqual',
        label: '≥',
    },
    {
        key: 'greater',
        label: '>',
    },
] as const;

export const possibleNullComparableOperators: readonly PossibleComparableOperator[] = [
    ...possibleComparableOperators,
    ...possibleNullableOperators,
] as const;

export type PossibleDiscreteOperatorKeys = 'is' | 'isnot' | PossibleNullableOperatorKeys;

export type PossibleDiscreteOperator = {
    key: PossibleDiscreteOperatorKeys;
    label: string;
};

export const possibleDiscreteOperators: readonly PossibleDiscreteOperator[] = [
    {
        key: 'is',
        label: $localize`est`,
    },
    {
        key: 'isnot',
        label: $localize`n'est pas`,
    },
    ...possibleNullableOperators,
] as const;
