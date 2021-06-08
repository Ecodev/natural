import {Component} from '@angular/core';

@Component({
    template: `
        <mat-sidenav-container fxFlex>
            <mat-sidenav mode="side" [opened]="true">
                <ul>
                    <li><a routerLink="/">Home</a></li>
                    <li><a routerLink="/other">Other page</a></li>
                </ul>
            </mat-sidenav>

            <mat-sidenav-content>
                <router-outlet></router-outlet>
            </mat-sidenav-content>
        </mat-sidenav-container>
    `,
})
export class MenuComponent {}
