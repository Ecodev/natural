import {JsonPipe} from '@angular/common';
import {Component, inject, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatIcon} from '@angular/material/icon';
import {MatPaginator} from '@angular/material/paginator';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {
    MatCell,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {AvailableColumn, NaturalAbstractNavigableList, Sorting, SortingOrder, TypedMatCellDef} from '@ecodev/natural';
import {NaturalColumnsPickerComponent} from '../../../projects/natural/src/lib/modules/columns-picker/columns-picker.component';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {NaturalSearchComponent} from '../../../projects/natural/src/lib/modules/search/search/search.component';
import {NaturalTableButtonComponent} from '../../../projects/natural/src/lib/modules/table-button/table-button.component';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-navigable-list',
    imports: [
        JsonPipe,
        MatButton,
        RouterLink,
        MatIcon,
        NaturalIconDirective,
        NaturalSearchComponent,
        NaturalColumnsPickerComponent,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        TypedMatCellDef,
        MatRowDef,
        MatHeaderCell,
        MatCell,
        MatHeaderRow,
        MatRow,
        MatSort,
        MatSortHeader,
        MatCheckbox,
        NaturalTableButtonComponent,
        MatTooltip,
        MatProgressSpinner,
        MatPaginator,
    ],
    templateUrl: './navigable-list.component.html',
    styleUrl: './navigable-list.component.scss',
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
