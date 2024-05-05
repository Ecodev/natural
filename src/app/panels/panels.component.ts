import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink, RouterOutlet} from '@angular/router';

@Component({
    selector: 'app-panels',
    templateUrl: './panels.component.html',
    styleUrl: './panels.component.scss',
    standalone: true,
    imports: [MatButtonModule, RouterLink, RouterOutlet],
})
export class PanelsComponent {}
