import {TestBed} from '@angular/core/testing';
import {MockApolloProvider} from '../testing/mock-apollo.provider';
import {Item, ItemInput, ItemService} from '../testing/item.service';
import {Literal, NaturalAbstractDetail, NaturalAlertService} from '@ecodev/natural';
import {Component, Injectable} from '@angular/core';
import {Data, provideRouter, Router} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {BehaviorSubject, of} from 'rxjs';
import {provideNoopAnimations} from '@angular/platform-browser/animations';

@Component({
    standalone: true,
    template: ` <div i18n>Test simple component</div>`,
})
class TestSimpleComponent extends NaturalAbstractDetail<ItemService> {
    public constructor(service: ItemService) {
        super('item', service);
    }
}

@Component({
    standalone: true,
    template: ` <div i18n>Test list component</div>`,
})
class TestListComponent {}

@Injectable({
    providedIn: 'root',
})
class WithExtraFormField extends ItemService {
    protected override getFormExtraFieldDefaultValues(): Literal {
        return {extraField: 'my default value'};
    }
}

describe('NaturalAbstractDetail', () => {
    let detail: TestSimpleComponent;
    let service: ItemService;
    let harness: RouterTestingHarness;
    let router: Router;
    const model = {id: '123', name: 'foo'} as Item;
    const serverResponse = {id: '123', name: 'from server'} as Item;

    async function configure(data: Data | undefined, a: typeof ItemService = ItemService): Promise<void> {
        await TestBed.configureTestingModule({
            providers: [
                MockApolloProvider,
                provideRouter([
                    {
                        path: 'item',
                        component: TestListComponent,
                    },
                    {
                        path: 'item/:itemId',
                        component: TestSimpleComponent,
                        data: data,
                    },
                ]),
                provideNoopAnimations(),
                TestSimpleComponent,
                {
                    provide: ItemService,
                    useClass: a,
                },
            ],
        }).compileComponents();

        harness = await RouterTestingHarness.create();
        detail = await harness.navigateByUrl('/item/123', TestSimpleComponent);
        service = TestBed.inject(ItemService);
        router = TestBed.inject(Router);
    }

    it('should be created', async () => {
        await configure({});
        expect(detail).toBeTruthy();
    });

    it('should show FAB only on first tab', async () => {
        await configure({model: of(model)});
        detail.ngOnInit();
        await harness.fixture.whenStable();

        expect(detail.showFabButton).toBeTrue();

        detail.changeTab(2);
        expect(detail.showFabButton).toBeFalse();

        detail.changeTab(0);
        expect(detail.showFabButton).toBeTrue();
    });

    it('should populate this.data', async () => {
        await configure({
            model: of(model),
        });
        detail.ngOnInit();
        await harness.fixture.whenStable();

        expect(detail.data).toEqual({model: model});
    });

    it('should receive updated of model this.data', async () => {
        const model$ = new BehaviorSubject(model);
        await configure({model: model$});
        detail.ngOnInit();
        await harness.fixture.whenStable();

        expect(detail.data.model.name).toEqual('foo');
        expect(detail.form.controls.name.value).toEqual('foo');

        const model2 = {id: '123', name: 'updated name'} as Item;
        model$.next(model2);

        expect(detail.data.model.name).toEqual('updated name');
        expect(detail.form.controls.name.value)
            .withContext('form must not be reinitialized whenever model is mutated')
            .toEqual('foo');
    });

    it('should populate this.data, also with other keys', async () => {
        await configure({
            model: of(model),
            bar: 'baz',
        });
        detail.ngOnInit();
        await harness.fixture.whenStable();

        expect(detail.data).toEqual({model: model, bar: 'baz'} as any);
    });

    it('should populate this.form controls with default values and values from model', async () => {
        await configure({
            model: of(model),
        });
        detail.ngOnInit();
        await harness.fixture.whenStable();

        expect(detail.form.value).toEqual({
            name: 'foo',
            description: '',
            children: [],
            parent: null,
        });
    });

    it('should submit nothing', async () => {
        await configure({
            model: of(model),
        });
        detail.ngOnInit();
        await harness.fixture.whenStable();

        const spy = spyOn(service, 'update').and.callFake(() => of(serverResponse));
        detail.update();
        expect(spy).toHaveBeenCalledOnceWith({id: '123'});
    });

    it('should submit nothing now', async () => {
        await configure({
            model: of(model),
        });
        detail.ngOnInit();
        await harness.fixture.whenStable();

        const spy = spyOn(service, 'updateNow').and.callFake(() => of(serverResponse));
        const postUpdateSpy = spyOn(detail, 'postUpdate' as any).and.callThrough();

        detail.update(true);
        expect(spy).toHaveBeenCalledOnceWith({id: '123'});
        expect(postUpdateSpy).withContext('called even if submitted no field').toHaveBeenCalledOnceWith(serverResponse);
    });

    it('should submit all fields', async () => {
        await configure({
            model: of(model),
        });
        detail.ngOnInit();
        await harness.fixture.whenStable();

        const spy = spyOn(service, 'update').and.callFake(() => of(serverResponse));
        detail.update(false, true);
        expect(spy).toHaveBeenCalledOnceWith({
            id: '123',
            name: 'foo',
            description: '',
            children: [],
            parent: null,
        });
    });

    it('should submit all fields now', async () => {
        await configure({
            model: of(model),
        });
        detail.ngOnInit();
        await harness.fixture.whenStable();

        const spy = spyOn(service, 'updateNow').and.callFake(() => of(serverResponse));
        detail.update(true, true);
        expect(spy).toHaveBeenCalledOnceWith({
            id: '123',
            name: 'foo',
            description: '',
            children: [],
            parent: null,
        });
    });

    it('should submit only changed fields', async () => {
        await configure({model: of(model)});
        detail.ngOnInit();
        await harness.fixture.whenStable();
        detail.form.controls.description.setValue('new description');

        const spy = spyOn(service, 'update').and.callFake(() => of(serverResponse));
        detail.update();
        expect(spy).toHaveBeenCalledOnceWith({id: '123', description: 'new description'});
    });

    it('should always submit all fields for creation', async () => {
        await configure({model: of(model)});
        detail.ngOnInit();
        await harness.fixture.whenStable();

        const spy = spyOn(service, 'create').and.callFake(() => of(serverResponse));
        const postCreateSpy = spyOn(detail, 'postCreate' as any).and.callThrough();

        detail.create();

        await harness.fixture.whenStable();
        expect(spy).toHaveBeenCalledOnceWith({
            id: '123', // This is an extra property that shouldn't really be there, but it's ok to have it because it has no effect
            name: 'foo',
            description: '',
            children: [],
            parent: null,
        } as ItemInput);
        expect(postCreateSpy).toHaveBeenCalledOnceWith(serverResponse);
        expect(router.url).toBe('/item/123');
    });

    it('should delete and redirect to listing', async () => {
        await configure({model: of(model)});
        detail.ngOnInit();
        await harness.fixture.whenStable();

        const deleteSpy = spyOn(service, 'delete').and.callFake(() => of(true));
        const preDeleteSpy = spyOn(detail, 'preDelete' as any).and.callThrough();
        const confirmSpy = spyOn(TestBed.inject(NaturalAlertService), 'confirm').and.callFake(() => of(true));

        detail.delete();

        await harness.fixture.whenStable();
        expect(deleteSpy).toHaveBeenCalledOnceWith([model]);
        expect(preDeleteSpy).toHaveBeenCalledOnceWith(model);
        expect(confirmSpy).toHaveBeenCalledTimes(1);
        expect(router.url).toBe('/item');
    });

    it('should delete and redirect to specific route', async () => {
        await configure({model: of(model)});
        detail.ngOnInit();
        await harness.fixture.whenStable();

        const deleteSpy = spyOn(service, 'delete').and.callFake(() => of(true));
        const confirmSpy = spyOn(TestBed.inject(NaturalAlertService), 'confirm').and.callFake(() => of(true));

        detail.delete(['/item/456']);

        await harness.fixture.whenStable();
        expect(deleteSpy).toHaveBeenCalledOnceWith([model]);
        expect(confirmSpy).toHaveBeenCalledTimes(1);
        expect(router.url).toBe('/item/456');
    });

    it('should delete with custom confirmer', async () => {
        await configure({model: of(model)});
        detail.ngOnInit();
        await harness.fixture.whenStable();

        const deleteSpy = spyOn(service, 'delete').and.callFake(() => of(true));
        const defaultConfirmSpy = spyOn(TestBed.inject(NaturalAlertService), 'confirm');

        detail.delete(undefined, of(true));

        await harness.fixture.whenStable();
        expect(deleteSpy).toHaveBeenCalledOnceWith([model]);
        expect(defaultConfirmSpy).not.toHaveBeenCalled();
        expect(router.url).toBe('/item');
    });

    it('should delete with custom confirmer, rejecting', async () => {
        await configure({model: of(model)});
        detail.ngOnInit();
        await harness.fixture.whenStable();

        const deleteSpy = spyOn(service, 'delete').and.callFake(() => of(true));
        const defaultConfirmSpy = spyOn(TestBed.inject(NaturalAlertService), 'confirm');

        detail.delete(undefined, of(false));

        await harness.fixture.whenStable();
        expect(deleteSpy).not.toHaveBeenCalled();
        expect(defaultConfirmSpy).not.toHaveBeenCalled();
        expect(router.url).toBe('/item/123');
    });

    it('should populate this.form with default value from extra fields too, and submit if changed', async () => {
        await configure({model: of(model)}, WithExtraFormField);
        detail.ngOnInit();
        await harness.fixture.whenStable();

        expect(detail.form.value).toEqual({
            name: 'foo',
            description: '',
            children: [],
            parent: null,
            extraField: 'my default value',
        });

        detail.form.controls.extraField.setValue('new value');
        const spy = spyOn(service, 'update').and.callFake(() => of(serverResponse));
        detail.update();
        expect(spy).toHaveBeenCalledOnceWith({id: '123', extraField: 'new value'} as any);
    });
});
