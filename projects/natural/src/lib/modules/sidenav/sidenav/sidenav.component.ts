import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'natural-sidenav',
    template: '<ng-content />',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class NaturalSidenavComponent {}
