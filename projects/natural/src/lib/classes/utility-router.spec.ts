import {currentComponentUrl} from './utility-router';
import {ActivatedRoute, type Params, provideRouter, RouterOutlet, type Routes} from '@angular/router';
import {TestBed} from '@angular/core/testing';
import {Component, inject, viewChild} from '@angular/core';
import {RouterTestingHarness} from '@angular/router/testing';

@Component({
    imports: [RouterOutlet],
    template: `<router-outlet />`,
})
class TestComponent {
    readonly #route = inject(ActivatedRoute);
    private readonly routerOutlet = viewChild.required(RouterOutlet);

    public primary(): TestComponent {
        return this.routerOutlet().component as TestComponent;
    }

    public url(): string {
        return currentComponentUrl(this.#route);
    }

    public params(): Params {
        return this.#route.snapshot.params;
    }
}

const routes: Routes = [
    {
        path: 'parent',
        component: TestComponent,
        children: [
            {
                path: 'list',
                component: TestComponent,
                children: [
                    {
                        path: 'child',
                        component: TestComponent,
                    },
                ],
            },
            {
                path: 'detail/:id',
                component: TestComponent,
                children: [
                    {
                        path: 'child',
                        component: TestComponent,
                    },
                ],
            },
        ],
    },
];

describe('currentComponentUrl', () => {
    it('should work for list component', async () => {
        TestBed.configureTestingModule({providers: [provideRouter(routes)]});
        const harness = await RouterTestingHarness.create();

        let parent: TestComponent;
        parent = await harness.navigateByUrl('/parent/list', TestComponent);
        expect(parent.params()).toEqual({});
        expect(parent.url()).toEqual('/parent');
        expect(parent.primary().params()).toEqual({});
        expect(parent.primary().url()).toEqual('/parent/list');

        parent = await harness.navigateByUrl('/parent/list;param1=value1', TestComponent);
        expect(parent.params()).toEqual({});
        expect(parent.url()).toEqual('/parent');
        expect(parent.primary().params()).toEqual({param1: 'value1'});
        expect(parent.primary().url()).toEqual('/parent/list');

        parent = await harness.navigateByUrl(
            '/parent;param1=value1/list;param2=value2/child;param3=value3',
            TestComponent,
        );
        expect(parent.params()).toEqual({param1: 'value1'});
        expect(parent.url()).toEqual('/parent');
        expect(parent.primary().params()).toEqual({param1: 'value1', param2: 'value2'});
        expect(parent.primary().url()).toEqual('/parent;param1=value1/list');
        expect(parent.primary().primary().params()).toEqual({param1: 'value1', param2: 'value2', param3: 'value3'});
        expect(parent.primary().primary().url()).toEqual('/parent;param1=value1/list;param2=value2/child');
    });

    it('should work for detail component', async () => {
        TestBed.configureTestingModule({providers: [provideRouter(routes)]});
        const harness = await RouterTestingHarness.create();

        let parent: TestComponent;
        parent = await harness.navigateByUrl('/parent/detail/123', TestComponent);
        expect(parent.url()).toEqual('/parent');
        expect(parent.primary().url()).toEqual('/parent/detail/123');

        parent = await harness.navigateByUrl('/parent/detail/123;param1=value1', TestComponent);
        expect(parent.url()).toEqual('/parent');
        expect(parent.primary().params()).toEqual({param1: 'value1', id: '123'});
        expect(parent.primary().url()).toEqual('/parent/detail/123');

        parent = await harness.navigateByUrl(
            '/parent;param1=value1/detail/123;param2=value2/child;param3=value3',
            TestComponent,
        );
        expect(parent.params()).toEqual({
            param1: 'value1',
        });
        expect(parent.url()).toEqual('/parent');

        expect(parent.primary().params()).toEqual({
            param1: 'value1',
            param2: 'value2',
            id: '123',
        });
        expect(parent.primary().url()).toEqual('/parent;param1=value1/detail/123');

        expect(parent.primary().primary().params()).toEqual({
            param1: 'value1',
            param2: 'value2',
            param3: 'value3',
            id: '123',
        });
        expect(parent.primary().primary().url()).toEqual('/parent;param1=value1/detail/123;param2=value2/child');
    });
});
