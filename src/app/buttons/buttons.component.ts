import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton, MatFabButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatTooltip} from '@angular/material/tooltip';
import {NaturalFixedButtonComponent, NaturalIconDirective} from '@ecodev/natural';

@Component({
    selector: 'app-buttons',
    imports: [
        NaturalIconDirective,
        MatButton,
        MatMiniFabButton,
        MatFabButton,
        MatIconButton,
        MatIcon,
        NaturalFixedButtonComponent,
        FormsModule,
        MatSlideToggle,
        MatTooltip,
    ],
    templateUrl: './buttons.component.html',
    styleUrl: './buttons.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonsComponent {
    public disabled = false;
}
