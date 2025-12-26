import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {NATURAL_THEMES_CONFIG, NaturalThemeService} from '../../services/theme.service';
import {NaturalIconDirective} from '../icon/icon.directive';

@Component({
    selector: 'natural-theme-changer',
    imports: [MatButton, MatMenuTrigger, MatMenu, MatMenuItem, MatIcon, NaturalIconDirective],
    templateUrl: './theme-changer.component.html',
    styleUrl: './theme-changer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NaturalThemeChangerComponent {
    protected readonly themeService = inject(NaturalThemeService);
    protected readonly allThemes = inject(NATURAL_THEMES_CONFIG);
}
