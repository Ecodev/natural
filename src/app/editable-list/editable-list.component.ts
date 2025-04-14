import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {NaturalAbstractEditableList} from '@ecodev/natural';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-editable-list',
    templateUrl: './editable-list.component.html',
    styleUrl: './editable-list.component.scss',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        CommonModule,
        MatButtonModule,
        MatIconModule,
        NaturalIconDirective,
    ],
})
export class EditableListComponent extends NaturalAbstractEditableList<ItemService> {
    public columns = ['name', 'description'];

    public constructor() {
        const service = inject(ItemService);

        super(service);

        this.service
            .getAll(this.variablesManager)
            .pipe(takeUntilDestroyed())
            .subscribe(results => {
                this.setItems(results.items);
                this.addEmpty();
            });
    }
}
