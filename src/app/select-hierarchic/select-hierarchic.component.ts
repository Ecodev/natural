import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {NaturalHierarchicConfiguration} from '@ecodev/natural';
import {NaturalSelectHierarchicComponent} from '../../../projects/natural/src/lib/modules/select/select-hierarchic/select-hierarchic.component';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';
import {AbstractSelect} from '../AbstractSelect';

@Component({
    templateUrl: './select-hierarchic.component.html',
    styleUrl: './select-hierarchic.component.scss',
    standalone: true,
    imports: [
        MatButtonModule,
        NaturalSelectHierarchicComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        CommonModule,
    ],
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
