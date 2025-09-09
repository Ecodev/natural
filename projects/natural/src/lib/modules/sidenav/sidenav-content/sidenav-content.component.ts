import {Component} from '@angular/core';

@Component({
    selector: 'natural-sidenav-content',
    standalone: true,
    template: '<ng-content />',
    styleUrl: './sidenav-content.component.scss',
})
export class NaturalSidenavContentComponent {}
