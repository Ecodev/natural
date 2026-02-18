import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {ButtonsSetComponent} from '../shared/buttons/buttons-set.component';

@Component({
    selector: 'app-buttons',
    imports: [FormsModule, MatSlideToggle, ButtonsSetComponent],
    templateUrl: './buttons.component.html',
    styleUrl: './buttons.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonsComponent {
    public disabled = false;
}
