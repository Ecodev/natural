import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {NaturalSidenavContainerComponent} from './sidenav-container/sidenav-container.component';
import {NaturalSidenavComponent} from './sidenav/sidenav.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {RouterModule} from '@angular/router';
import {FlexLayoutModule} from '@angular/flex-layout';

@NgModule({
    declarations: [NaturalSidenavComponent, NaturalSidenavContainerComponent],
    imports: [CommonModule, FlexLayoutModule, MatExpansionModule, MatListModule, MatSidenavModule, RouterModule],
    exports: [NaturalSidenavComponent, NaturalSidenavContainerComponent],
})
export class NaturalSidenavModule {}
