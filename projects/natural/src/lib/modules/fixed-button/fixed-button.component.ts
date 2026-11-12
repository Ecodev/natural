import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {type NaturalPalette} from '../../types/types';
import {NaturalIconDirective} from '../icon/icon.directive';
import {MatIcon} from '@angular/material/icon';
import {MatFabButton} from '@angular/material/button';

@Component({
    selector: 'natural-fixed-button',
    imports: [MatFabButton, RouterLink, MatIcon, NaturalIconDirective],
    templateUrl: './fixed-button.component.html',
    styleUrl: './fixed-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.nat-fixed-fab]': 'true',
    },
})
export class NaturalFixedButtonComponent {
    public readonly icon = input<string>();
    public readonly label = input<string>();
    public readonly navigate = input<RouterLink['routerLink']>(null);
    public readonly queryParams = input<RouterLink['queryParams']>(null);
    public readonly color = input<NaturalPalette>('tertiary');
    public readonly disabled = input(false);
}
