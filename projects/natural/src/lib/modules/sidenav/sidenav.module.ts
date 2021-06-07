import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {NaturalSidenavContainerComponent} from './sidenav-container/sidenav-container.component';
import {NaturalSidenavComponent} from './sidenav/sidenav.component';
import {sessionStorageProvider} from '../common/services/memory-storage';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {RouterModule} from '@angular/router';
import {FlexLayoutModule} from '@angular/flex-layout';

@NgModule({
    declarations: [NaturalSidenavComponent, NaturalSidenavContainerComponent],
    imports: [
        CommonModule,
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        MatExpansionModule,
        MatListModule,
        RouterModule,
        FlexLayoutModule,
    ],
    exports: [NaturalSidenavComponent, NaturalSidenavContainerComponent],
    providers: [sessionStorageProvider],
})
export class NaturalSidenavModule {}
