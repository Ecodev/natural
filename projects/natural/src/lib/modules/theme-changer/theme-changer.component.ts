import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {NATURAL_THEMES_CONFIG, NaturalThemeService} from '../../services/theme.service';
import {NaturalIconDirective} from '../icon/icon.directive';

@Component({
    selector: 'natural-theme-changer',
    imports: [
        CommonModule,
        FormsModule,
        MatButton,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatIcon,
        NaturalIconDirective,
    ],
    templateUrl: './theme-changer.component.html',
    styleUrl: './theme-changer.component.scss',
})
export class NaturalThemeChangerComponent {
    protected readonly themeService = inject(NaturalThemeService);
    protected readonly allThemes = inject(NATURAL_THEMES_CONFIG);
}
