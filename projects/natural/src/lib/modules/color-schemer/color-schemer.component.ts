import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {ColorScheme, NaturalThemeService} from '../../services/theme.service';
import {NaturalIconDirective} from '../icon/icon.directive';

@Component({
    selector: 'natural-color-schemer',
    imports: [MatIconButton, MatTooltip, NaturalIconDirective, FormsModule, MatIcon],
    templateUrl: './color-schemer.component.html',
    styleUrl: './color-schemer.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NaturalColorSchemerComponent {
    public readonly themeService = inject(NaturalThemeService);
    protected readonly ColorScheme = ColorScheme;
}
