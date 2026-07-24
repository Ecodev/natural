import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {type NaturalLoggerExtra, type NaturalLoggerType} from '@ecodev/natural';
import {type Observable, of} from 'rxjs';

@Injectable({providedIn: 'root'})
export class DemoLoggerExtra implements NaturalLoggerExtra {
    private readonly snackBar = inject(MatSnackBar);

    public getExtras(): Observable<Partial<NaturalLoggerType>> {
        this.snackBar.open('An error happened', 'Yes', {
            duration: 3000,
            panelClass: ['snackbar-error'],
            verticalPosition: 'top',
            horizontalPosition: 'end',
        });

        return of({
            extraAddedKey: 'extraAddedValue',
        });
    }
}
