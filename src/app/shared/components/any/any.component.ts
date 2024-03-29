import {Component} from '@angular/core';
import {NaturalAbstractPanel} from '@ecodev/natural';
import {CommonModule} from '@angular/common';
import {NaturalLinkableTabDirective} from '../../../../../projects/natural/src/lib/modules/common/directives/linkable-tab.directive';
import {MatTabsModule} from '@angular/material/tabs';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-any',
    templateUrl: './any.component.html',
    styleUrl: './any.component.scss',
    standalone: true,
    imports: [FlexModule, MatButtonModule, RouterLink, MatTabsModule, NaturalLinkableTabDirective, CommonModule],
})
export class AnyComponent extends NaturalAbstractPanel {
    public constructor() {
        super();
    }
}
