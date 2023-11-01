import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {TestScheduler} from 'rxjs/testing';
import {Observable, of, tap, throwError} from 'rxjs';
import {NaturalDebounceService} from './debounce.service';

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

const emptyResult: Readonly<SpyResult> = {
    called: 0,
    completed: 0,
    errored: 0,
    subscribed: 0,
    unsubscribed: 0,
} as const;

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
    const modelServiceA = 'A' as any;
    const modelServiceB = 'B' as any;

    beforeEach(() => {
        scheduler = new TestScheduler((actual, expected) => {
            expect(actual).toEqual(expected);
        });

        service = TestBed.inject(NaturalDebounceService);
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
        const error = spyObservable(throwError(() => 'fake extra error'));

        service.debounce(modelServiceA, '1', error.observable);

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

        expect(error.result).toEqual({
            called: 0,
            completed: 0,
            errored: 1,
            subscribed: 1,
            unsubscribed: 0,
        });
    }));

    it('should flushOne a successfull update and emit and complete', fakeAsync(() => {
        const a1 = spyObservable(of(1));
        service.debounce(modelServiceA, '1', a1.observable);

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

        expect(a1.result).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });
    }));

    it('should flush without any pending update then emit', () => {
        scheduler.run(({expectObservable}) => {
            const flush = service.flush();
            expectObservable(flush).toBe('(a|)', {a: undefined});
        });
    });

    it('should flush with 1 pending update then emit', fakeAsync(() => {
        const a1 = spyObservable(of(1));
        const a1Bis = spyObservable(of(1));
        service.debounce(modelServiceA, '1', a1.observable);
        expect(service.count).toBe(1);

        tick(1000); // half-way through debounce

        expect(a1.result).toEqual(emptyResult);

        // debounce again the same key/id but different observable
        service.debounce(modelServiceA, '1', a1Bis.observable);
        expect(service.count).toBe(1);

        tick(2000); // passed the first debounce, but observable still debounced

        expect(a1.result).toEqual(emptyResult);

        const flush = spyObservable(service.flush());
        flush.observable.subscribe(result => {
            expect(result).toBeUndefined();
        });

        tick();

        expect(a1.result).withContext('should not be called at all because was debounced').toEqual(emptyResult);

        expect(a1Bis.result).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(flush.result).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(service.count).toBe(0);
    }));

    it('should flush with multiple pending updates then emit', fakeAsync(() => {
        const a1 = spyObservable(of(1));
        const a2 = spyObservable(of(2));
        const b1 = spyObservable(of(1));
        const error = spyObservable(throwError(() => 'fake extra error'));

        service.debounce(modelServiceA, '1', a1.observable);
        service.debounce(modelServiceA, '2', a2.observable);
        service.debounce(modelServiceB, '1', b1.observable);
        service.debounce(modelServiceB, '2', error.observable);

        expect(service.count).toBe(4);

        // again
        service.debounce(modelServiceA, '1', a1.observable);

        expect(service.count).toBe(4);

        tick(1000); // half-way through debounce

        expect(a1.result).toEqual(emptyResult);
        expect(a2.result).toEqual(emptyResult);
        expect(b1.result).toEqual(emptyResult);
        expect(error.result).toEqual(emptyResult);

        const flush = spyObservable(service.flush());
        flush.observable.subscribe(result => {
            expect(result).toBeUndefined();
        });

        tick();

        expect(a1.result).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(a2.result).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(b1.result).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(error.result).toEqual({
            called: 0,
            completed: 0,
            errored: 1,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(flush.result).toEqual({
            called: 1,
            completed: 1,
            errored: 0,
            subscribed: 1,
            unsubscribed: 0,
        });

        expect(service.count).toBe(0);
    }));

    it('should cancel one pending update', fakeAsync(() => {
        const a1 = spyObservable(of(1));
        const a1Bis = spyObservable(of(1));
        service.debounce(modelServiceA, '1', a1.observable);
        expect(service.count).toBe(1);

        tick(1000); // half-way through debounce

        expect(a1.result).toEqual(emptyResult);
        expect(a1Bis.result).toEqual(emptyResult);

        // debounce again the same key/id but different observable
        service.debounce(modelServiceA, '1', a1Bis.observable);
        expect(service.count).toBe(1);

        tick(2000); // passed the first debounce, but observable still debounced

        expect(a1.result).toEqual(emptyResult);
        expect(a1Bis.result).toEqual(emptyResult);

        service.cancelOne(modelServiceA, '1');

        tick(3000);

        expect(a1.result).toEqual(emptyResult);
        expect(a1Bis.result).toEqual(emptyResult);

        expect(service.count).toBe(0);
    }));
});
