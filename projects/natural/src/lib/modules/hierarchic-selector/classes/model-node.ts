import {BehaviorSubject} from 'rxjs';
import {NaturalHierarchicConfiguration} from './hierarchic-configuration';
import {NameOrFullName} from '../../../types/types';

export type HierarchicModel = {id: string; __typename: string} & NameOrFullName;

export class HierarchicModelNode {
    public childrenChange: BehaviorSubject<HierarchicModelNode[]> = new BehaviorSubject<HierarchicModelNode[]>([]);

    constructor(public readonly model: HierarchicModel, public readonly config: NaturalHierarchicConfiguration) {}

    get children(): HierarchicModelNode[] {
        return this.childrenChange.value;
    }
}
