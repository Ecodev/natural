import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';

@Component({
    selector: 'app-modal-placeholder',
    imports: [MatDialogModule, MatButton],
    templateUrl: './modal-placeholder.component.html',
    styleUrl: './modal-placeholder.component.scss',
})
export class ModalPlaceholderComponent {}
