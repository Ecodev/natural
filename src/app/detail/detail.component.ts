import {JsonPipe} from '@angular/common';
import {Component, inject, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {RouterLink, RouterOutlet} from '@angular/router';
import {collectErrors, NaturalAbstractDetail, NaturalSeoResolveData} from '@ecodev/natural';
import {NaturalLinkableTabDirective} from '../../../projects/natural/src/lib/modules/common/directives/linkable-tab.directive';
import {NaturalDetailHeaderComponent} from '../../../projects/natural/src/lib/modules/detail-header/detail-header.component';
import {NaturalFixedButtonDetailComponent} from '../../../projects/natural/src/lib/modules/fixed-button-detail/fixed-button-detail.component';
import {Item, ItemInput, ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-detail',
    imports: [
        NaturalDetailHeaderComponent,
        MatButton,
        RouterLink,
        MatTab,
        MatTabGroup,
        NaturalLinkableTabDirective,
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        JsonPipe,
        NaturalFixedButtonDetailComponent,
        RouterOutlet,
    ],
    templateUrl: './detail.component.html',
    styleUrl: './detail.component.scss',
})
export class DetailComponent extends NaturalAbstractDetail<ItemService, NaturalSeoResolveData> implements OnInit {
    public readonly collectErrors = collectErrors;

    public constructor() {
        const service = inject(ItemService);

        super('detail', service);

        if (this.isUpdatePage()) {
            this.doSomethingWithFetchedModel(this.data.model);
        } else {
            this.doSomethingWithDefaultValues(this.data.model);
        }
    }

    private doSomethingWithFetchedModel(model: Item): string {
        return model.id;
    }

    private doSomethingWithDefaultValues(model: ItemInput): boolean {
        return 'id' in model;
    }

    public setIdToTestDeleteButton(): void {
        this.data.model = {...this.data.model, id: '123'};
    }
}
