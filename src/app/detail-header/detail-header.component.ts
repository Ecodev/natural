import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {Literal} from '@ecodev/natural';
import {NaturalDetailHeaderComponent} from '../../../projects/natural/src/lib/modules/detail-header/detail-header.component';

@Component({
    selector: 'app-detail-header',
    imports: [MatButtonModule, NaturalDetailHeaderComponent],
    templateUrl: './detail-header.component.html',
    styleUrl: './detail-header.component.scss',
})
export class DetailHeaderComponent {
    public model: Literal = {};
}
