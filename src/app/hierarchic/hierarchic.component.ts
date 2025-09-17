import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {
    HierarchicDialogConfig,
    HierarchicDialogResult,
    NaturalHierarchicConfiguration,
    NaturalHierarchicSelectorDialogService,
    NaturalSearchFacets,
    NaturalSearchSelections,
    OrganizedModelSelection,
    TypeNumberComponent,
} from '@ecodev/natural';
import {NaturalHierarchicSelectorComponent} from '../../../projects/natural/src/lib/modules/hierarchic-selector/hierarchic-selector/hierarchic-selector.component';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-hierarchic',
    imports: [NaturalHierarchicSelectorComponent, MatButtonModule],
    templateUrl: './hierarchic.component.html',
    styleUrl: './hierarchic.component.scss',
})
export class HierarchicComponent {
    private itemService = inject(ItemService);
    private readonly hierarchicDialogService = inject(NaturalHierarchicSelectorDialogService);

    public searchFacets: NaturalSearchFacets = [
        {
            display: 'Number less than 100',
            field: 'number',
            component: TypeNumberComponent,
            configuration: {
                max: 100,
            },
        },
        {
            display: 'With archives',
            field: 'archived',
            condition: {equal: {value: true}},
        },
    ];

    public searchSelections: NaturalSearchSelections = [
        [
            {
                field: 'number',
                condition: {equal: {value: 50}},
            },
        ],
    ];

    public selected: OrganizedModelSelection = {
        any: [
            this.itemService.getItem(false, 0, '1'),
            this.itemService.getItem(false, 0, '4'),
            this.itemService.getItem(false, 0, '16'),
        ],
    };

    public config: NaturalHierarchicConfiguration[] = [
        {
            service: ItemService,
            parentsRelationNames: ['parent'],
            childrenRelationNames: ['parent'],
            selectableAtKey: 'any',
            icon: 'deployed_code',
        },
    ];

    public log(...args: any[]): void {
        console.log(args);
    }

    public select(): void {
        const hierarchicConfig: HierarchicDialogConfig = {
            hierarchicConfig: this.config,
            hierarchicSelection: this.selected,
            searchFacets: this.searchFacets,
            searchSelections: this.searchSelections,
            allowSelectAll: true,
        };

        this.hierarchicDialogService
            .open(hierarchicConfig)
            .afterClosed()
            .subscribe((result?: HierarchicDialogResult) => {
                console.log('dialog usage', result);
                this.selected = result?.hierarchicSelection ?? {};
            });
    }
}
