import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

export type NaturalConfirmData = {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
};

@Component({
    imports: [MatDialogModule, MatButton],
    templateUrl: './confirm.component.html',
    styleUrl: './confirm.component.scss',
})
export class NaturalConfirmComponent {
    public readonly data = inject<NaturalConfirmData>(MAT_DIALOG_DATA);
}
