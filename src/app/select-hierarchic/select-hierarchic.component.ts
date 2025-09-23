import {JsonPipe} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatLabel, MatHint} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NaturalHierarchicConfiguration} from '@ecodev/natural';
import {NaturalSelectHierarchicComponent} from '../../../projects/natural/src/lib/modules/select/select-hierarchic/select-hierarchic.component';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';
import {AbstractSelect} from '../AbstractSelect';
import {DebugControlComponent} from '../debug-form.component';

@Component({
    imports: [
        MatButton,
        NaturalSelectHierarchicComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatHint,
        MatInput,
        JsonPipe,
        DebugControlComponent,
    ],
    templateUrl: './select-hierarchic.component.html',
    styleUrl: './select-hierarchic.component.scss',
})
export class SelectHierarchicComponent extends AbstractSelect {
    public hierarchicConfig: NaturalHierarchicConfiguration[] = [
        {
            service: ItemService,
            parentsRelationNames: ['parent'],
            childrenRelationNames: ['parent'],
            selectableAtKey: 'any',
        },
    ];
}
