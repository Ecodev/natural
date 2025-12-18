import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {colorSchemeOptions, NaturalThemeService} from '../../services/theme.service';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';

@Component({
    selector: 'natural-compact-color-schemer',
    imports: [MatIconButton, MatTooltip, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger],
    templateUrl: './compact-color-schemer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NaturalCompactColorSchemerComponent {
    protected readonly themeService = inject(NaturalThemeService);
    protected readonly colorSchemeOptions = colorSchemeOptions;
    protected readonly current = computed(() =>
        colorSchemeOptions.find(choice => this.themeService.colorScheme() === choice.value),
    );
}
