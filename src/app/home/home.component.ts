import {Component, inject} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatListItem, MatListItemIcon, MatNavList} from '@angular/material/list';
import {MatToolbar} from '@angular/material/toolbar';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NaturalColorSchemerComponent, NaturalThemeChangerComponent, NaturalThemeService} from '@ecodev/natural';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {NaturalSidenavContainerComponent} from '../../../projects/natural/src/lib/modules/sidenav/sidenav-container/sidenav-container.component';
import {NaturalSidenavContentComponent} from '../../../projects/natural/src/lib/modules/sidenav/sidenav-content/sidenav-content.component';
import {NaturalSidenavComponent} from '../../../projects/natural/src/lib/modules/sidenav/sidenav/sidenav.component';

@Component({
    selector: 'app-home',
    imports: [
        MatToolbar,
        MatButton,
        MatIconButton,
        MatIcon,
        NaturalIconDirective,
        NaturalSidenavContainerComponent,
        NaturalSidenavComponent,
        MatNavList,
        MatListItem,
        MatListItemIcon,
        RouterLink,
        NaturalSidenavContentComponent,
        RouterOutlet,
        RouterLinkActive,
        NaturalColorSchemerComponent,
        NaturalThemeChangerComponent,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent {
    public readonly themeService = inject(NaturalThemeService);
    public readonly router = inject(Router);

    protected isActive(url: string): boolean {
        return this.router.url === url;
    }
}
