import {CommonModule} from '@angular/common';
import {Component, inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {AvailableColumn, NaturalAbstractNavigableList, Sorting, SortingOrder} from '@ecodev/natural';
import {NaturalColumnsPickerComponent} from '../../../projects/natural/src/lib/modules/columns-picker/columns-picker.component';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {NaturalSearchComponent} from '../../../projects/natural/src/lib/modules/search/search/search.component';
import {NaturalTableButtonComponent} from '../../../projects/natural/src/lib/modules/table-button/table-button.component';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-navigable-list',
    templateUrl: './navigable-list.component.html',
    styleUrl: './navigable-list.component.scss',
    imports: [
        CommonModule,
        MatButtonModule,
        RouterLink,
        MatIconModule,
        NaturalIconDirective,
        NaturalSearchComponent,
        NaturalColumnsPickerComponent,
        MatTableModule,
        MatSortModule,
        MatCheckboxModule,
        NaturalTableButtonComponent,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
    ],
})
export class NavigableListComponent extends NaturalAbstractNavigableList<ItemService> implements OnInit {
    protected override defaultPagination = {
        offset: null,
        pageIndex: 0,
        pageSize: 5,
    };
    public override availableColumns: AvailableColumn[] = [
        {
            id: 'select',
            label: 'select',
        },
        {
            id: 'navigation',
            label: 'navigation',
        },
        {
            id: 'name',
            label: 'name',
        },
        {
            id: 'description',
            label: 'description',
        },
    ];
    protected override defaultSorting: Sorting[] = [{field: 'name', order: SortingOrder.DESC}];

    public constructor() {
        const service = inject(ItemService);

        super(service);
    }
}
