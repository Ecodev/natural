import {Component} from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <div class="app-component" fxFlexFill fxLayout="column">
            <router-outlet></router-outlet>
        </div>
    `,
})
export class AppComponent {}
