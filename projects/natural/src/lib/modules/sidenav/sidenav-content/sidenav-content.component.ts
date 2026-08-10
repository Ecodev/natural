import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'natural-sidenav-content',
    template: '<ng-content />',
    styleUrl: './sidenav-content.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class NaturalSidenavContentComponent {}
