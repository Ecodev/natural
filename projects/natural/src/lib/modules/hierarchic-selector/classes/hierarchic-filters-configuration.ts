import {type Literal} from '../../../types/types';
import {type NaturalHierarchicConfiguration} from './hierarchic-configuration';

export type HierarchicFilterConfiguration<T = Literal> = {
    service: NaturalHierarchicConfiguration['service'];
    filter: T;
};

export type HierarchicFiltersConfiguration<T = Literal> = HierarchicFilterConfiguration<T>[];
