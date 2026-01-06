import {JsonPipe} from '@angular/common';
import {Component, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconButton} from '@angular/material/button';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {
    MatCell,
    MatColumnDef,
    MatFooterCell,
    MatFooterCellDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
} from '@angular/material/table';
import {NaturalAbstractEditableList, NaturalErrorMessagePipe, TypedMatCellDef} from '@ecodev/natural';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-editable-list',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatTable,
        MatHeaderCellDef,
        MatHeaderRowDef,
        MatColumnDef,
        TypedMatCellDef,
        MatRowDef,
        MatFooterCellDef,
        MatHeaderCell,
        MatCell,
        MatFooterCell,
        MatHeaderRow,
        MatRow,
        MatFormField,
        MatLabel,
        MatError,
        NaturalErrorMessagePipe,
        MatInput,
        JsonPipe,
        MatIconButton,
        MatIcon,
        NaturalIconDirective,
    ],
    templateUrl: './editable-list.component.html',
    styleUrl: './editable-list.component.scss',
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
