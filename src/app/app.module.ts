import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {MaterialModule} from './material.module';
import {OtherComponent} from './other/other.component';
import {HttpClientModule} from '@angular/common/http';
import {HomepageComponent} from './homepage/homepage.component';

@NgModule({
    declarations: [AppComponent, HomeComponent, OtherComponent, HomepageComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        MaterialModule,
        HttpClientModule,
        FlexLayoutModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
