import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {RouterLink, RouterOutlet} from '@angular/router';
import {collectErrors, NaturalAbstractDetail, NaturalSeoResolveData} from '@ecodev/natural';
import {NaturalLinkableTabDirective} from '../../../projects/natural/src/lib/modules/common/directives/linkable-tab.directive';
import {NaturalDetailHeaderComponent} from '../../../projects/natural/src/lib/modules/detail-header/detail-header.component';
import {NaturalFixedButtonDetailComponent} from '../../../projects/natural/src/lib/modules/fixed-button-detail/fixed-button-detail.component';
import {Item, ItemInput, ItemService} from '../../../projects/natural/src/lib/testing/item.service';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrl: './detail.component.scss',
    standalone: true,
    imports: [
        NaturalDetailHeaderComponent,
        MatButtonModule,
        RouterLink,
        MatTabsModule,
        NaturalLinkableTabDirective,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        CommonModule,
        NaturalFixedButtonDetailComponent,
        RouterOutlet,
    ],
})
export class DetailComponent extends NaturalAbstractDetail<ItemService, NaturalSeoResolveData> implements OnInit {
    public readonly collectErrors = collectErrors;

    public constructor(service: ItemService) {
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
