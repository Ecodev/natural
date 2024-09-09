import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

export type NaturalConfirmData = {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
};

@Component({
    templateUrl: './confirm.component.html',
    styleUrl: './confirm.component.scss',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
})
export class NaturalConfirmComponent {
    public readonly data = inject<NaturalConfirmData>(MAT_DIALOG_DATA);
}
