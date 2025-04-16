import {BehaviorSubject} from 'rxjs';
import {NaturalHierarchicConfiguration} from './hierarchic-configuration';
import {NameOrFullName} from '../../../types/types';

export type HierarchicModel = {__typename: string} & NameOrFullName;

export class HierarchicModelNode {
    public readonly childrenChange = new BehaviorSubject<HierarchicModelNode[]>([]);

    public constructor(
        public readonly model: HierarchicModel,
        public readonly config: NaturalHierarchicConfiguration,
    ) {}

    public get children(): HierarchicModelNode[] {
        return this.childrenChange.value;
    }
}
