import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink, RouterOutlet} from '@angular/router';

@Component({
    selector: 'app-panels',
    imports: [MatButtonModule, RouterLink, RouterOutlet],
    templateUrl: './panels.component.html',
    styleUrl: './panels.component.scss',
})
export class PanelsComponent {}
