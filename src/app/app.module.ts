import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {OtherComponent} from './other/other.component';
import {HomepageComponent} from './homepage/homepage.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';

@NgModule({
    declarations: [AppComponent, HomeComponent, OtherComponent, HomepageComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        FlexLayoutModule,
        MatExpansionModule,
        MatListModule,
        MatSidenavModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
