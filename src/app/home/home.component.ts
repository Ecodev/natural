import {Component, DOCUMENT, effect, inject} from '@angular/core';
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
import {allThemes, ThemeService} from '../shared/services/theme.service';

@Component({
    selector: 'app-home',
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
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent {
    public readonly themeService = inject(ThemeService);
    private readonly document = inject(DOCUMENT);

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
}
