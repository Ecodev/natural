import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {IEnum, NaturalEnumService} from '@ecodev/natural';
import {Observable, of} from 'rxjs';
import {NaturalSelectEnumComponent} from '../../../projects/natural/src/lib/modules/select/select-enum/select-enum.component';
import {AnyEnumService} from '../../../projects/natural/src/lib/testing/any-enum.service';
import {AbstractSelect} from '../AbstractSelect';
import {DebugControlComponent} from '../debug-form.component';

@Component({
    selector: 'app-select',
    templateUrl: './select-enum.component.html',
    styleUrl: './select-enum.component.scss',
    providers: [
        {
            provide: NaturalEnumService,
            useClass: AnyEnumService,
        },
    ],
    imports: [
        MatButtonModule,
        NaturalSelectEnumComponent,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        DebugControlComponent,
    ],
})
export class SelectEnumComponent extends AbstractSelect {
    public readonly formControlMultiple = new FormControl();

    public optionDisabled(e: IEnum): boolean {
        return e.value === 'val2';
    }

    protected override getNextValue(): Observable<any> {
        return of('val' + Math.ceil(Math.random() * Math.floor(3)));
    }
}
