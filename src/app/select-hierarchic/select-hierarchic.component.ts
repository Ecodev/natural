import {JsonPipe} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatHint, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {hierarchicConfig, nodeConfig} from '@ecodev/natural';
import {NaturalSelectHierarchicComponent} from '../../../projects/natural/src/lib/modules/select/select-hierarchic/select-hierarchic.component';
import {ItemService} from '../../../projects/natural/src/lib/testing/item.service';
import {AbstractSelect} from '../AbstractSelect';
import {DebugControlComponent} from '../debug-form.component';
import {FileService} from '../file/file.service';

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
    public readonly itemNode = nodeConfig({
        service: ItemService,
        root: true,
        selectableAtKey: 'any',
    });

    public readonly fileNode = nodeConfig({
        service: FileService,
        selectableAtKey: 'any',
    });

    public hierarchicConfig = hierarchicConfig(
        [this.itemNode],
        [
            {
                parent: this.itemNode,
                child: this.itemNode,
                field: 'parent',
            },
        ],
    );

    public readonly itemForRootNode = nodeConfig({
        service: ItemService,
        root: {
            filter: {
                conditions: [
                    // ...
                ],
            },
        },
        selectableAtKey: 'any',
    });

    public readonly itemForChildNode = nodeConfig({
        service: ItemService,
        selectableAtKey: 'any',
    });

    public hierarchicConfig2 = hierarchicConfig(
        [this.itemForRootNode, this.itemForChildNode],
        [
            {
                parent: this.itemForRootNode,
                child: this.itemForChildNode,
                field: 'parent',
            },
            {
                parent: this.itemForChildNode,
                child: this.itemForChildNode,
                field: 'parent',
            },
        ],
    );
}
