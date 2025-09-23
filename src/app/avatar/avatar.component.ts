import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {NaturalAvatarComponent} from '../../../projects/natural/src/lib/modules/avatar/component/avatar.component';

@Component({
    imports: [NaturalAvatarComponent, MatButton],
    templateUrl: './avatar.component.html',
    styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
    public failedSources: number[] = [];
}
