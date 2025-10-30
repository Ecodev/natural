import {Component, DOCUMENT, effect, inject} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatListItem, MatListItemIcon, MatNavList} from '@angular/material/list';
import {MatToolbar} from '@angular/material/toolbar';
import {MatTooltip} from '@angular/material/tooltip';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {NaturalSidenavContainerComponent} from '../../../projects/natural/src/lib/modules/sidenav/sidenav-container/sidenav-container.component';
import {NaturalSidenavContentComponent} from '../../../projects/natural/src/lib/modules/sidenav/sidenav-content/sidenav-content.component';
import {NaturalSidenavComponent} from '../../../projects/natural/src/lib/modules/sidenav/sidenav/sidenav.component';
import {allThemes, ColorScheme, ThemeService} from '../shared/services/theme.service';

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
        MatTooltip,
        RouterLinkActive,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent {
    public readonly themeService = inject(ThemeService);
    public readonly router = inject(Router);
    private readonly document = inject(DOCUMENT);
    protected readonly ColorScheme = ColorScheme;

    public constructor() {
        effect(() => {
            // Remove old theme class
            allThemes.forEach(theme => {
                this.document.body.classList.remove(theme);
            });

            // set new theme class
            const newTheme = this.themeService.theme();
            this.document.body.classList.add(newTheme);
        });
    }

    protected isActive(url: string): boolean {
        console.log(this.router.url, url);
        return this.router.url === url;
    }
}
