import {map, MonoTypeOperatorFunction, Observable, take, takeUntil, tap, timer} from 'rxjs';
import {DestroyRef} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Behave like setTimeout(), but with a mandatory cancel mechanism.
 *
 * This is typically useful to replace setTimeout() in components where the callback
 * would crash if executed after the component destruction. That can easily happen
 * when the user navigates quickly between pages.
 *
 * Typical usage in a component would be:
 *
 * ```ts
 * cancellableTimeout(inject(DestroyRef)).subscribe(myCallback);
 * ```
 *
 * or
 *
 * ```ts
 * cancellableTimeout(this.ngUnsubscribe).subscribe(myCallback);
 * ```
 *
 * Instead of the more error-prone:
 *
 * ```ts
 * public foo(): void {
 *     this.timeout = setTimeout(myCallBack);
 * }
 *
 * public ngOnDestroy(): void {
 *     if (this.timeout) {
 *         clearTimeout(this.timeout);
 *         this.timeout = null;
 *      }
 * }
 * ```
 */
export function cancellableTimeout(canceller: Observable<unknown> | DestroyRef, milliSeconds = 0): Observable<void> {
    return timer(milliSeconds).pipe(
        take(1),
        canceller instanceof DestroyRef ? takeUntilDestroyed(canceller) : takeUntil(canceller),
        map(() => undefined),
    );
}

/**
 * For debugging purpose only, will dump in console everything that happen to
 * the observable
 */
export function debug<T>(debugName: string): MonoTypeOperatorFunction<T> {
    return tap<T>({
        subscribe: () => console.log('SUBSCRIBE', debugName),
        unsubscribe: () => console.log('UNSUBSCRIBE', debugName),
        next: value => console.log('NEXT', debugName, value),
        error: error => console.log('ERROR', debugName, error),
        complete: () => console.log('COMPLETE', debugName),
    });
}
