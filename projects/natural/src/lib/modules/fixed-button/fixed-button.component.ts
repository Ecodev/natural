import {Component, input} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {RouterLink} from '@angular/router';
import {NaturalIconDirective} from '../icon/icon.directive';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@Component({
    selector: 'natural-fixed-button',
    imports: [MatButtonModule, RouterLink, MatIconModule, NaturalIconDirective],
    templateUrl: './fixed-button.component.html',
    styleUrl: './fixed-button.component.scss',
})
export class NaturalFixedButtonComponent {
    public readonly icon = input.required<string>();
    public readonly link = input<RouterLink['routerLink'] | null>(null);
    public readonly color = input<ThemePalette>('accent');
    public readonly disabled = input(false);
}
