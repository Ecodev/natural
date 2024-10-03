import {DOCUMENT} from '@angular/common';
import {Component, OnInit, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {NaturalSidenavContainerComponent} from '../../../projects/natural/src/lib/modules/sidenav/sidenav-container/sidenav-container.component';
import {NaturalSidenavContentComponent} from '../../../projects/natural/src/lib/modules/sidenav/sidenav-content/sidenav-content.component';
import {NaturalSidenavComponent} from '../../../projects/natural/src/lib/modules/sidenav/sidenav/sidenav.component';
import {ThemeService} from '../shared/services/theme.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    standalone: true,
    imports: [
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        NaturalIconDirective,
        NaturalSidenavContainerComponent,
        NaturalSidenavComponent,
        MatExpansionModule,
        MatListModule,
        RouterLink,
        NaturalSidenavContentComponent,
        RouterOutlet,
    ],
})
export class HomeComponent implements OnInit {
    public readonly themeService = inject(ThemeService);
    private readonly document = inject(DOCUMENT);

    public ngOnInit(): void {
        this.themeService.theme.subscribe(newTheme => {
            this.document.body.classList.remove('default');
            this.document.body.classList.remove('defaultDark');
            this.document.body.classList.add(newTheme);
        });
    }
}
