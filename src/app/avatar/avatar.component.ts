import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {NaturalAvatarComponent} from '../../../projects/natural/src/lib/modules/avatar/component/avatar.component';

@Component({
    imports: [NaturalAvatarComponent, MatButtonModule],
    templateUrl: './avatar.component.html',
    styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
    public failedSources: number[] = [];
}
