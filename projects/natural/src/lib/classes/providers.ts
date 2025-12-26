import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {localStorageProvider, sessionStorageProvider} from '../modules/common/services/memory-storage';

/**
 * Minimal, global providers for Natural to work
 */
export const naturalProviders: ApplicationConfig['providers'] = [
    importProvidersFrom([MatDialogModule, MatSnackBarModule]),
    sessionStorageProvider,
    localStorageProvider,
];
