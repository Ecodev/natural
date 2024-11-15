import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ifValid} from '@ecodev/natural';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

export type ClassDialogData = {
    /**
     * CSS class names
     *
     * Eg:
     *
     * - `""`
     * - `"my-class my-other-class"`
     */
    class: string;
};

@Component({
    templateUrl: './class-dialog.component.html',
    styleUrl: './class-dialog.component.scss',
    standalone: true,
    imports: [MatDialogModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class ClassDialogComponent {
    private dialogRef = inject<MatDialogRef<ClassDialogComponent, ClassDialogData>>(MatDialogRef);

    public readonly classControl = new FormControl('', {
        validators: Validators.pattern(/(^\s*(-?[_a-zA-Z]+[_a-zA-Z0-9-]*\s*)+)/),
        nonNullable: true,
    });
    public readonly form = new FormGroup({
        class: this.classControl,
    });

    public constructor() {
        const data = inject<ClassDialogData>(MAT_DIALOG_DATA);

        this.form.setValue(data);
    }

    public maybeConfirm(): void {
        ifValid(this.form).subscribe(() => this.confirm());
    }

    private confirm(): void {
        this.dialogRef.close(this.form.getRawValue());
    }
}
