import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {NaturalSelectComponent} from '../../../projects/natural/src/lib/modules/select/select/select.component';
import {AbstractSelect} from '../AbstractSelect';
import {DebugControlComponent} from '../debug-form.component';

@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    styleUrl: './select.component.scss',
    standalone: true,
    imports: [
        MatButtonModule,
        NaturalSelectComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        NaturalIconDirective,
        CommonModule,
        DebugControlComponent,
    ],
})
export class SelectComponent extends AbstractSelect {}
