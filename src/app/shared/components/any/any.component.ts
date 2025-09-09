import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatTabsModule} from '@angular/material/tabs';
import {RouterLink} from '@angular/router';
import {NaturalAbstractPanel} from '@ecodev/natural';
import {NaturalLinkableTabDirective} from '../../../../../projects/natural/src/lib/modules/common/directives/linkable-tab.directive';

@Component({
    selector: 'app-any',
    imports: [MatButtonModule, RouterLink, MatTabsModule, NaturalLinkableTabDirective, CommonModule],
    templateUrl: './any.component.html',
    styleUrl: './any.component.scss',
})
export class AnyComponent extends NaturalAbstractPanel {
    public constructor() {
        super();
    }
}
