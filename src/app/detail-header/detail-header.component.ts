import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {Literal} from '@ecodev/natural';
import {NaturalDetailHeaderComponent} from '../../../projects/natural/src/lib/modules/detail-header/detail-header.component';

@Component({
    selector: 'app-detail-header',
    imports: [MatButton, NaturalDetailHeaderComponent],
    templateUrl: './detail-header.component.html',
    styleUrl: './detail-header.component.scss',
})
export class DetailHeaderComponent {
    public model: Literal = {};
}
