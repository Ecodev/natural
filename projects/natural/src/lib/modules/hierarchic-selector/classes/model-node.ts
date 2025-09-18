import {BehaviorSubject, Observable} from 'rxjs';
import {NaturalHierarchicConfiguration} from './hierarchic-configuration';
import {NameOrFullName} from '../../../types/types';

export type HierarchicModel = {__typename: string} & NameOrFullName;

/**
 * Wrapper for the original model from the DB with specific metadata for tree
 */
export class ModelNode {
    public readonly childrenChange = new BehaviorSubject<ModelNode[]>([]);

    public isLoading = false;
    public isExpandable = false;
    public isSelectable = false;

    public constructor(
        public readonly model: HierarchicModel,
        public readonly config: NaturalHierarchicConfiguration,
    ) {}

    public get children(): Observable<ModelNode[]> {
        return this.childrenChange.asObservable();
    }

    public get hasChildren(): boolean {
        return this.childrenChange.value?.length > 0;
    }
}
