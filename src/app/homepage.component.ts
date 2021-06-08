import {Component} from '@angular/core';

@Component({
    template: `
        <h1>Homepage</h1>
        <a mat-raised-button>Incorrectly remove margin</a>
        <a mat-raised-button disableRipple>No ripple is fine</a>
    `,
})
export class HomepageComponent {}
