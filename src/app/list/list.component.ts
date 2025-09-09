import {CommonModule} from '@angular/common';
import {Component, inject, OnInit} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {AvailableColumn, Button, NaturalAbstractList, Sorting, SortingOrder} from '@ecodev/natural';
import {NaturalColumnsPickerComponent} from '../../../projects/natural/src/lib/modules/columns-picker/columns-picker.component';
import {NaturalSearchComponent} from '../../../projects/natural/src/lib/modules/search/search/search.component';
import {NaturalTableButtonComponent} from '../../../projects/natural/src/lib/modules/table-button/table-button.component';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-list',
    imports: [
        CommonModule,
        NaturalColumnsPickerComponent,
        NaturalSearchComponent,
        MatTableModule,
        MatSortModule,
        MatCheckboxModule,
        NaturalTableButtonComponent,
        MatProgressSpinnerModule,
        MatPaginatorModule,
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
})
export class ListComponent extends NaturalAbstractList<ItemService> implements OnInit {
    public override readonly pageSizeOptions = [1, 2, 3, 4, 5];
    public override availableColumns: AvailableColumn[] = [
        {
            id: 'select',
            label: 'select',
        },
        {
            id: 'id',
            label: 'id',
            checked: false,
        },
        {
            id: 'name',
            label: 'name',
        },
        {
            id: 'description',
            label: 'description',
        },
        {
            id: 'hidden',
            label: 'hidden in menu',
            hidden: true,
        },
    ];

    public readonly buttons: Button[] = [
        {
            label: 'Button with nothing',
            icon: 'favorite',
        },
        {
            label: 'Button with callback',
            icon: 'forest',
            click: console.log,
        },
        {
            label: 'Button with href',
            icon: 'diamond',
            href: '/',
        },
        {
            label: 'Button with check',
            icon: 'check',
            checked: false,
            click: (button: Button): void => {
                button.checked = !button.checked;
            },
        },
        {
            label: 'Button with sub-buttons',
            icon: 'bolt',
            buttons: [
                {
                    label: 'My sub-button 1',
                    click: console.log,
                },
                {
                    label: 'My sub-button 2',
                    click: console.log,
                },
            ],
        },
    ];

    protected override defaultPagination = {
        offset: null,
        pageIndex: 0,
        pageSize: 5,
    };

    protected override defaultSorting: Sorting[] = [{field: 'name', order: SortingOrder.DESC}];

    public constructor() {
        const service = inject(ItemService);

        super(service);
    }
}
