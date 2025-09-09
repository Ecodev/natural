import {Component, Input} from '@angular/core';
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
    @Input({required: true}) public icon!: string;
    @Input() public link: RouterLink['routerLink'] | null = null;
    @Input() public color: ThemePalette = 'accent';
    @Input() public disabled = false;
}
