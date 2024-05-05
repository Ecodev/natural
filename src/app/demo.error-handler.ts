import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NaturalLoggerExtra, NaturalLoggerType} from '@ecodev/natural';
import {Observable, of} from 'rxjs';

@Injectable({providedIn: 'root'})
export class DemoLoggerExtra implements NaturalLoggerExtra {
    public constructor(private readonly snackBar: MatSnackBar) {}

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
