import {
    NaturalHierarchicConfiguration,
    NaturalHierarchicSelectorComponent,
    OrganizedModelSelection,
} from '@ecodev/natural';
import {TestBed} from '@angular/core/testing';
import {ItemService} from '../../../testing/item.service';
import {MockApolloProvider} from '../../../testing/mock-apollo.provider';
import {ModelNode} from '../classes/model-node';

describe('NaturalHierarchicSelectorComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MockApolloProvider],
        });
    });

    it('isSelectableCallback is never called on the pre-selected item, but only on the items freshly fetched from network including all the extra fields they might have', async () => {
        const fixture = TestBed.createComponent(NaturalHierarchicSelectorComponent);

        const preSelection = {
            __typename: 'Item',
            id: '2',
            name: 'the original pre-selection',
        };

        let resolveAllCalled: () => void;
        const allCalled = new Promise<void>(resolve => (resolveAllCalled = resolve));
        let called = 0;

        fixture.componentRef.setInput('selected', {item: [preSelection]} as OrganizedModelSelection);
        fixture.componentRef.setInput('config', [
            {
                service: ItemService,
                selectableAtKey: 'item',
                filter: {
                    groups: [{conditions: [{id: {in: {values: ['1', '2', '3']}}}]}], // Predictable IDs
                },
                isSelectableCallback: item => {
                    called++;
                    expect(['1', '2', '3'].includes(item.id)).withContext('every item must be seen').toBeTrue();
                    expect(item.name)
                        .withContext('the original pre-selection must never be seen')
                        .not.toBe(preSelection.name);

                    if (called === 3) {
                        resolveAllCalled();
                    }

                    return true;
                },
            },
        ] as NaturalHierarchicConfiguration[]);

        // Run component logic
        fixture.componentRef.instance.ngOnInit();
        await allCalled;

        // The final selection is the item fetched from network, not the pre-selected
        const selected: ModelNode[] = (fixture.componentRef.instance as any).selection.selected;
        expect(selected.length).toBe(1);
        expect(selected[0].model.id).toEqual('2');
        expect(selected[0].model.name).toEqual('name-2');
    });
});
