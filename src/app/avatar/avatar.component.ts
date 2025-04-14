import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {NaturalAvatarComponent} from '../../../projects/natural/src/lib/modules/avatar/component/avatar.component';

@Component({
    templateUrl: './avatar.component.html',
    styleUrl: './avatar.component.scss',
    imports: [NaturalAvatarComponent, MatButtonModule],
})
export class AvatarComponent {
    public failedSources: number[] = [];
}
