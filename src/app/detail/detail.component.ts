import {Component, Injector, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {collectErrors, NaturalAbstractDetail} from '@ecodev/natural';
import {AnyService} from '../../../projects/natural/src/lib/testing/any.service';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
})
export class DetailComponent extends NaturalAbstractDetail<AnyService> implements OnInit {
    public collectErrors = collectErrors;

    constructor(service: AnyService, injector: Injector, public route: ActivatedRoute) {
        super('detail', service, injector);
    }

    public multipleSubscriptionCreate(): void {
        const obs = this.create();
        if (obs) {
            obs.subscribe(res => console.log('sub 1', res));
            obs.subscribe(res => console.log('sub 2', res));
            obs.subscribe(res => console.log('sub 3', res));
        }
    }
}
