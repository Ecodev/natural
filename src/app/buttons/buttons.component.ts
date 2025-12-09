import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButton, MatFabButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {NaturalIconDirective} from '@ecodev/natural';

@Component({
    selector: 'app-buttons',
    imports: [NaturalIconDirective, MatButton, MatMiniFabButton, MatFabButton, MatIconButton, MatIcon],
    templateUrl: './buttons.component.html',
    styleUrl: './buttons.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonsComponent {}
