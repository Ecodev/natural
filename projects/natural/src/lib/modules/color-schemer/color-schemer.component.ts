import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {colorSchemeOptions, NaturalThemeService} from '../../services/theme.service';

@Component({
    selector: 'natural-color-schemer',
    imports: [MatIconButton, MatTooltip, MatIcon],
    templateUrl: './color-schemer.component.html',
    styleUrl: './color-schemer.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NaturalColorSchemerComponent {
    protected readonly themeService = inject(NaturalThemeService);
    protected readonly colorSchemeOptions = colorSchemeOptions;
}
