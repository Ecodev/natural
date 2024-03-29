import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnInit} from '@angular/core';
import {ThemeService} from '../shared/services/theme.service';
import {NaturalSidenavContentComponent} from '../../../projects/natural/src/lib/modules/sidenav/sidenav-content/sidenav-content.component';
import {RouterLink, RouterOutlet} from '@angular/router';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {NaturalSidenavComponent} from '../../../projects/natural/src/lib/modules/sidenav/sidenav/sidenav.component';
import {NaturalSidenavContainerComponent} from '../../../projects/natural/src/lib/modules/sidenav/sidenav-container/sidenav-container.component';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FlexModule} from '@ngbracket/ngx-layout/flex';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    standalone: true,
    imports: [
        FlexModule,
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
    public constructor(
        public readonly themeService: ThemeService,
        @Inject(DOCUMENT) private readonly document: Document,
    ) {}

    public ngOnInit(): void {
        this.themeService.theme.subscribe(newTheme => {
            this.document.body.classList.remove('default');
            this.document.body.classList.remove('defaultDark');
            this.document.body.classList.add(newTheme);
        });
    }
}
