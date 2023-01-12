import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {NaturalModule} from '@ecodev/natural';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {MaterialModule} from '../../material.module';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {NaturalEditorModule} from '@ecodev/natural-editor';
import {ApolloModule} from 'apollo-angular';

export const testImports: Required<NgModule>['imports'] = [
    FormsModule,
    HttpClientModule,
    MaterialModule,
    MatSnackBarModule,
    NaturalModule,
    NaturalEditorModule,
    NoopAnimationsModule,
    ReactiveFormsModule,
    RouterTestingModule,
    ApolloModule,
];
