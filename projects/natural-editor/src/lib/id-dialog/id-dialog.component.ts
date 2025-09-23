import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ifValid} from '@ecodev/natural';
import {MatButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';

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
    imports: [MatDialogModule, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatError, MatInput, MatButton],
    templateUrl: './id-dialog.component.html',
    styleUrl: './id-dialog.component.scss',
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
