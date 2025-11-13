import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ifValid, NaturalErrorMessagePipe} from '@ecodev/natural';
import {MatButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';

export type LinkDialogData = {
    href: string;
    title?: string;
};

@Component({
    selector: 'natural-editor-link-dialog',
    imports: [
        FormsModule,
        MatButton,
        MatDialogModule,
        MatError,
        MatFormField,
        MatInput,
        MatLabel,
        NaturalErrorMessagePipe,
        ReactiveFormsModule,
    ],
    templateUrl: './link-dialog.component.html',
    styleUrl: './link-dialog.component.scss',
})
export class LinkDialogComponent {
    private dialogRef = inject<MatDialogRef<LinkDialogComponent, LinkDialogData>>(MatDialogRef);

    public readonly hrefControl = new FormControl('', {validators: Validators.required, nonNullable: true});
    public readonly titleControl = new FormControl('', {nonNullable: true});
    public readonly form = new FormGroup({
        href: this.hrefControl,
        title: this.titleControl,
    });

    public constructor() {
        const data = inject<LinkDialogData>(MAT_DIALOG_DATA);

        this.form.setValue({title: '', ...data});
    }

    public maybeConfirm(): void {
        ifValid(this.form).subscribe(() => this.confirm());
    }

    private confirm(): void {
        this.dialogRef.close(this.form.getRawValue());
    }
}
