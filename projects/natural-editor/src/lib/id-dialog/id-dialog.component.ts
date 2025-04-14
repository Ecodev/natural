import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ifValid} from '@ecodev/natural';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

export type IdDialogData = {
    /**
     * ID name
     *
     * Eg:
     *
     * - `""`
     * - `"my-id"`
     */
    id: string;
};

@Component({
    selector: 'natural-editor-id-dialog',
    templateUrl: './id-dialog.component.html',
    styleUrl: './id-dialog.component.scss',
    imports: [MatDialogModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class IdDialogComponent {
    private dialogRef = inject<MatDialogRef<IdDialogComponent, IdDialogData>>(MatDialogRef);

    public readonly idControl = new FormControl('', {
        validators: Validators.pattern(/(^(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)+)/),
        nonNullable: true,
    });
    public readonly form = new FormGroup({
        id: this.idControl,
    });

    public constructor() {
        const data = inject<IdDialogData>(MAT_DIALOG_DATA);

        this.form.setValue(data);
    }

    public maybeConfirm(): void {
        ifValid(this.form).subscribe(() => this.confirm());
    }

    private confirm(): void {
        this.dialogRef.close(this.form.getRawValue());
    }
}
