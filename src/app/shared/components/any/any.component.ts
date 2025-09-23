import {JsonPipe} from '@angular/common';
import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {RouterLink} from '@angular/router';
import {NaturalAbstractPanel} from '@ecodev/natural';
import {NaturalLinkableTabDirective} from '../../../../../projects/natural/src/lib/modules/common/directives/linkable-tab.directive';

@Component({
    selector: 'app-any',
    imports: [MatButton, RouterLink, MatTab, MatTabGroup, NaturalLinkableTabDirective, JsonPipe],
    templateUrl: './any.component.html',
    styleUrl: './any.component.scss',
})
export class AnyComponent extends NaturalAbstractPanel {
    public constructor() {
        super();
    }
}
