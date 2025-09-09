import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';

@Component({
    selector: 'app-modal-placeholder',
    imports: [MatDialogModule, MatButtonModule],
    templateUrl: './modal-placeholder.component.html',
    styleUrl: './modal-placeholder.component.scss',
})
export class ModalPlaceholderComponent {}
