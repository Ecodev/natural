import {Component, input} from '@angular/core';
import {MatButton, MatFabButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {NaturalFixedButtonComponent, NaturalIconDirective} from '@ecodev/natural';

@Component({
    selector: 'app-buttons-set',
    imports: [
        MatButton,
        MatFabButton,
        MatIcon,
        MatIconButton,
        MatMiniFabButton,
        MatTooltip,
        NaturalFixedButtonComponent,
        NaturalIconDirective,
    ],
    templateUrl: './buttons-set.component.html',
    styleUrl: './buttons-set.component.scss',
})
export class ButtonsSetComponent {
    public readonly disabled = input(false);
}
