import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {TestScheduler} from 'rxjs/testing';
import {Observable, of, tap, throwError} from 'rxjs';
import {NaturalDebounceService} from './debounce.service';
import {UntypedModelService} from '../types/types';

type SpyResult = {
    called: number;
    completed: number;
    errored: number;
    subscribed: number;
    unsubscribed: number;
};

type ObservableSpy<T> = {
    result: SpyResult;
    observable: Observable<T>;
};

function spyObservable<T>(observable: Observable<T>): ObservableSpy<T> {
    const result = {
        called: 0,
        completed: 0,
        errored: 0,
        subscribed: 0,
        unsubscribed: 0,
    };

    return {
        result: result,
        observable: observable.pipe(
            tap({
                next: () => result.called++,
                complete: () => result.completed++,
                error: () => result.errored++,
                subscribe: () => result.subscribed++,
                unsubscribe: () => result.unsubscribed++,
            }),
        ),
    };
}

describe('NaturalDebounceService', () => {
    let scheduler: TestScheduler;
    let service: NaturalDebounceService;
    let modelServiceA: jasmine.SpyObj<UntypedModelService>;
    let modelServiceB: jasmine.SpyObj<UntypedModelService>;
    let modelServiceError: jasmine.SpyObj<UntypedModelService>;

    beforeEach(() => {
        scheduler = new TestScheduler((actual, expected) => {
            expect(actual).toEqual(expected);
        });

        service = TestBed.inject(NaturalDebounceService);

        modelServiceA = jasmine.createSpyObj<UntypedModelService>('modelServiceA', ['updateNow']);
        modelServiceA.updateNow.and.callFake(() => of(1));

        modelServiceB = jasmine.createSpyObj<UntypedModelService>('modelServiceB', ['updateNow']);
        modelServiceA.updateNow.and.callFake(() => of(1));

        modelServiceError = jasmine.createSpyObj<UntypedModelService>('modelServiceError', ['updateNow']);
        modelServiceA.updateNow.and.callFake(() => throwError(() => 'fake error'));
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.count).toBe(0);
    });

    it('should flushOne non-existing then emit', () => {
        scheduler.run(({expectObservable}) => {
            const flushOne = service.flushOne(modelServiceA, 'non-existing');
            expectObservable(flushOne).toBe('(a|)', {a: undefined});
        });
    });

    it('should flushOne an error and then still emit and complete', fakeAsync(() => {
        service.debounce(modelServiceError, '1', {a: 1});

        const flushOne = spyObservable(service.flushOne(modelServiceError, '1'));
        flushOne.observable.subscribe();

        tick(1000);

        expect(flushOne.result).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(modelServiceError.updateNow).toHaveBeenCalledOnceWith({a: 1});
    }));

    it('should flushOne a successful update and emit and complete', fakeAsync(() => {
        service.debounce(modelServiceA, '1', {a: 1});

        const flushOne = spyObservable(service.flushOne(modelServiceA, '1'));
        flushOne.observable.subscribe();

        tick(1000);

        expect(flushOne.result).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(modelServiceA.updateNow).toHaveBeenCalledOnceWith({a: 1});
    }));

    it('should flush without any pending update then emit', () => {
        scheduler.run(({expectObservable}) => {
            const flush = service.flush();
            expectObservable(flush).toBe('(a|)', {a: undefined});
        });
    });

    it('should flush with 1 pending update then emit', fakeAsync(() => {
        service.debounce(modelServiceA, '1', {a: 1});
        expect(service.count).toBe(1);

        tick(1000); // half-way through debounce

        expect(modelServiceA.updateNow).not.toHaveBeenCalled();

        // debounce again the same key/id but different observable
        service.debounce(modelServiceA, '1', {a: 2});
        expect(service.count).toBe(1);

        tick(2000); // passed the first debounce, but observable still debounced

        expect(modelServiceA.updateNow)
            .withContext('should not be called at all because was debounced')
            .not.toHaveBeenCalled();

        const flush = spyObservable(service.flush());
        flush.observable.subscribe(result => {
            expect(result).toBeUndefined();
        });

        tick();

        expect(flush.result).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(service.count).toBe(0);
        expect(modelServiceA.updateNow).toHaveBeenCalledOnceWith({a: 2});
    }));

    it('should flush with multiple pending updates then emit', fakeAsync(() => {
        service.debounce(modelServiceA, '1', {a: 'foo'});
        service.debounce(modelServiceA, '2', {a: 'bar'});
        service.debounce(modelServiceB, '1', {b: 'foo'});
        service.debounce(modelServiceError, '1', {error: 'bar'});

        expect(service.count).toBe(4);

        // again
        service.debounce(modelServiceA, '1', {a: 'foo again'});

        expect(service.count).toBe(4);

        tick(1000); // half-way through debounce

        expect(modelServiceA.updateNow).not.toHaveBeenCalled();
        expect(modelServiceB.updateNow).not.toHaveBeenCalled();
        expect(modelServiceError.updateNow).not.toHaveBeenCalled();

        const flush = spyObservable(service.flush());
        flush.observable.subscribe(result => {
            expect(result).toBeUndefined();
        });

        tick();

        expect(flush.result).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(service.count).toBe(0);

        expect(modelServiceA.updateNow).toHaveBeenCalledTimes(2);
        expect(modelServiceA.updateNow).toHaveBeenCalledWith({a: 'foo again'});
        expect(modelServiceA.updateNow).toHaveBeenCalledWith({a: 'bar'});
        expect(modelServiceB.updateNow).toHaveBeenCalledOnceWith({b: 'foo'});
        expect(modelServiceError.updateNow).toHaveBeenCalledOnceWith({error: 'bar'});
    }));

    it('should cancel one pending update', fakeAsync(() => {
        service.debounce(modelServiceA, '1', {a: 1});
        expect(service.count).toBe(1);

        tick(1000); // half-way through debounce

        expect(modelServiceA.updateNow).not.toHaveBeenCalled();

        // debounce again the same key/id but different observable
        service.debounce(modelServiceA, '1', {a: 2});
        expect(service.count).toBe(1);

        tick(2000); // passed the first debounce, but observable still debounced

        expect(modelServiceA.updateNow).not.toHaveBeenCalled();

        service.cancelOne(modelServiceA, '1');

        tick(3000);

        expect(service.count).toBe(0);
        expect(modelServiceA.updateNow).not.toHaveBeenCalled();
    }));

    it('should cumulate all debounced fields over time', fakeAsync(() => {
        service.debounce(modelServiceA, '1', {a: 1});
        service.debounce(modelServiceA, '1', {a: 2, b: 1, c: 1});
        service.debounce(modelServiceA, '1', {a: 1}); // Can revert to original value
        service.debounce(modelServiceA, '1', {b: 4});

        service.flush().subscribe();

        expect(service.count).toBe(0);

        expect(modelServiceA.updateNow).toHaveBeenCalledOnceWith({a: 1, b: 4, c: 1});
    }));
});
