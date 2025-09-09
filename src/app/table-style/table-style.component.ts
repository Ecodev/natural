import {Component} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatSort, MatSortHeader} from '@angular/material/sort';

type Item = {
    name: string;
    value: number;
};

@Component({
    selector: 'app-table-list',
    imports: [MatTableModule, MatSortHeader, MatSort],
    templateUrl: './table-style.component.html',
    styleUrl: './table-style.component.scss',
})
export class TableStyleComponent {
    public readonly columns = ['name', 'value', 'sortable_value'];
    public readonly dataSource: Item[] = [
        {name: 'row 1', value: 1.2},
        {name: 'row 2', value: 12345.6789},
    ];

    public readonly classes1 = ['natural-align-center', 'natural-align-right'];

    public readonly classes2 = [
        'natural-1em-column',
        'natural-2em-column',
        'natural-3em-column',
        'natural-4em-column',
        'natural-5em-column',
        'natural-6em-column',
        'natural-7em-column',
    ];
}
