import {Component} from '@angular/core';

@Component({
    template: `
        <mat-sidenav-container fxFlex>
            <mat-sidenav mode="side" [opened]="true">
                <mat-nav-list>
                    <a mat-list-item routerLink="/">Home</a>
                    <a mat-list-item routerLink="/other">Other page</a>
                </mat-nav-list>
            </mat-sidenav>

            <mat-sidenav-content>
                <router-outlet></router-outlet>
            </mat-sidenav-content>
        </mat-sidenav-container> `,
})
export class MenuComponent {
}
