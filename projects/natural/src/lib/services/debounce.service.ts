import {
    catchError,
    debounceTime,
    EMPTY,
    forkJoin,
    map,
    mergeMap,
    Observable,
    of,
    raceWith,
    ReplaySubject,
    shareReplay,
    Subject,
    take,
} from 'rxjs';
import {Injectable} from '@angular/core';
import {UntypedModelService} from '../types/types';

type Debounced<T extends UntypedModelService> = {
    object: Parameters<T['updateNow']>[0];
    modelService: T;
    debouncer: Subject<void>;
    canceller: Subject<void>;
    flusher: Subject<void>;
    result: ReturnType<T['updateNow']>;
};

/**
 * Debounce subscriptions to update mutations, with the possibility to cancel one, flush one, or flush all of them.
 *
 * `modelService` is also used to separate objects by their types. So User with ID 1 is not confused with Product with ID 1.
 *
 * `id` must be the ID of the object that will be updated.
 */
@Injectable({
    providedIn: 'root',
})
export class NaturalDebounceService {
    /**
     * Stores the debounced update function
     */
    private readonly allDebouncedUpdateCache = new Map<
        UntypedModelService,
        Map<string, Debounced<UntypedModelService>>
    >();

    /**
     * Debounce the `modelService.updateNow()` mutation for a short time. If called multiple times with the same
     * modelService and id, it will postpone the subscription to the mutation.
     *
     * All input variables for the same object (same service and ID) will be cumulated over time. So it is possible
     * to update `field1`, then `field2`, and they will be batched into a single XHR including `field1` and `field2`.
     *
     * But it will always keep the same debouncing timeline.
     */
    public debounce<T extends UntypedModelService>(
        modelService: UntypedModelService,
        id: string,
        object: Parameters<T['updateNow']>[0],
    ): ReturnType<T['updateNow']> {
        const debouncedUpdateCache = this.getMap(modelService);
        let debounced = debouncedUpdateCache.get(id) as Debounced<T> | undefined;

        if (debounced) {
            debounced.object = {
                ...debounced.object,
                ...object,
            };
        } else {
            const debouncer = new ReplaySubject<void>(1);
            let wasCancelled = false;
            const canceller = new Subject<void>();
            canceller.subscribe(() => {
                wasCancelled = true;
                debouncer.complete();
                canceller.complete();
                this.delete(modelService, id);
            });

            const flusher = new Subject<void>();

            debounced = {
                object,
                debouncer,
                canceller,
                flusher,
                modelService: modelService as T,
                result: debouncer.pipe(
                    debounceTime(2000), // Wait 2 seconds...
                    raceWith(flusher), // ...unless flusher is triggered
                    take(1),
                    mergeMap(() => {
                        this.delete(modelService, id);

                        if (wasCancelled || !debounced) {
                            return EMPTY;
                        }

                        return modelService.updateNow(debounced.object);
                    }),
                    shareReplay(), // All attempts to update will share the exact same single result from API
                ) as ReturnType<T['updateNow']>,
            };

            debouncedUpdateCache.set(id, debounced);
        }

        // Notify our debounced update each time we ask to update
        debounced.debouncer.next();

        // Return and observable that is updated when mutation is done
        return debounced.result;
    }

    public cancelOne(modelService: UntypedModelService, id: string): void {
        const debounced = this.allDebouncedUpdateCache.get(modelService)?.get(id);
        debounced?.canceller.next();
    }

    /**
     * Immediately execute the pending update, if any.
     *
     * It should typically be called before resolving the object, to mutate it before re-fetching it from server.
     *
     * The returned observable will complete when the update completes, even if it errors.
     */
    public flushOne(modelService: UntypedModelService, id: string): Observable<void> {
        const debounced = this.allDebouncedUpdateCache.get(modelService)?.get(id);

        return this.internalFlush(debounced ? [debounced] : []);
    }

    /**
     * Immediately execute all pending updates.
     *
     * It should typically be called before login out.
     *
     * The returned observable will complete when all updates complete, even if some of them error.
     */
    public flush(): Observable<void> {
        const all: Debounced<UntypedModelService>[] = [];
        this.allDebouncedUpdateCache.forEach(map => map.forEach(debounced => all.push(debounced)));

        return this.internalFlush(all);
    }

    private internalFlush(debounceds: Debounced<UntypedModelService>[]): Observable<void> {
        const all: Observable<unknown>[] = [];
        const allFlusher: Subject<void>[] = [];

        debounceds.forEach(debounced => {
            all.push(debounced.result.pipe(catchError(() => of(undefined))));
            allFlusher.push(debounced.flusher);
        });

        if (!all.length) {
            all.push(of(undefined));
        }

        return new Observable(subscriber => {
            const subscription = forkJoin(all)
                .pipe(map(() => undefined))
                .subscribe(subscriber);

            // Flush only after subscription process is finished
            allFlusher.forEach(flusher => flusher.next());

            return subscription;
        });
    }

    /**
     * Count of pending updates
     */
    public get count(): number {
        let count = 0;
        this.allDebouncedUpdateCache.forEach(map => (count += map.size));

        return count;
    }

    private getMap<T extends UntypedModelService>(modelService: T): Map<string, Debounced<T>> {
        let debouncedUpdateCache = this.allDebouncedUpdateCache.get(modelService);
        if (!debouncedUpdateCache) {
            debouncedUpdateCache = new Map<string, Debounced<UntypedModelService>>();
            this.allDebouncedUpdateCache.set(modelService, debouncedUpdateCache);
        }

        return debouncedUpdateCache as Map<string, Debounced<T>>;
    }

    private delete(modelService: UntypedModelService, id: string): void {
        const map = this.allDebouncedUpdateCache.get(modelService);
        if (!map) {
            return;
        }

        map.delete(id);

        if (!map.size) {
            this.allDebouncedUpdateCache.delete(modelService);
        }
    }
}
