import {Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NaturalPalette} from '../../types/types';

import {NaturalIconDirective} from '../icon/icon.directive';
import {MatIcon} from '@angular/material/icon';
import {MatFabButton} from '@angular/material/button';

@Component({
    selector: 'natural-fixed-button',
    imports: [MatFabButton, RouterLink, MatIcon, NaturalIconDirective],
    templateUrl: './fixed-button.component.html',
    styleUrl: './fixed-button.component.scss',
})
export class NaturalFixedButtonComponent {
    public readonly icon = input.required<string>();
    public readonly link = input<RouterLink['routerLink'] | null>(null);
    public readonly color = input<NaturalPalette>('tertiary');
    public readonly disabled = input(false);
}
