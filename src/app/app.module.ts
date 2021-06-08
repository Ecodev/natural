import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MenuComponent} from './menu.component';
import {HomepageComponent} from './homepage.component';
import {OtherComponent} from './other.component';

@NgModule({
    declarations: [AppComponent, MenuComponent, OtherComponent, HomepageComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        FlexLayoutModule,
        MatExpansionModule,
        MatSidenavModule,
        MatButtonModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
