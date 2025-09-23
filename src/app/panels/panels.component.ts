import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {RouterLink, RouterOutlet} from '@angular/router';

@Component({
    selector: 'app-panels',
    imports: [MatButton, RouterLink, RouterOutlet],
    templateUrl: './panels.component.html',
    styleUrl: './panels.component.scss',
})
export class PanelsComponent {}
