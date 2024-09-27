import {cancellableTimeout} from './rxjs';
import {ReplaySubject, Subject} from 'rxjs';
import {fakeAsync, tick} from '@angular/core/testing';
import {DestroyRef} from '@angular/core';

class TestDestroyRef extends DestroyRef {
    private callback: (() => void) | null = null;

    public override onDestroy(callback: () => void): () => void {
        this.callback = callback;
        return () => undefined;
    }

    public destroy(): void {
        this.callback?.();
        this.callback = null;
    }
}

describe('cancellableTimeout', () => {
    const observer = {
        next: () => {
            count++;
        },
        complete: () => {
            completed = true;
        },
    };
    let count = 0;
    let completed = false;

    beforeEach(() => {
        count = 0;
        completed = false;
    });

    it('run the callback exactly once', fakeAsync(() => {
        const canceller = new Subject<void>();
        const timeout = cancellableTimeout(canceller);

        expect(count).withContext('nothing happened yet').toBe(0);
        expect(completed).toBe(false);

        tick();
        expect(count).withContext('still nothing happened because no subscriber').toBe(0);
        expect(completed).toBe(false);

        timeout.subscribe(observer);
        expect(count).withContext('still nothing happened because time did not pass').toBe(0);
        expect(completed).toBe(false);

        tick();
        expect(count).withContext('callback called exactly once').toBe(1);
        expect(completed).toBe(true);

        canceller.next();
        tick();
        expect(count).withContext('already completed, nothing change').toBe(1);
        expect(completed).toBe(true);
    }));

    it('never run the callback if cancelled', fakeAsync(() => {
        const canceller = new ReplaySubject<void>();
        const timeout = cancellableTimeout(canceller);
        canceller.next();

        expect(count).withContext('nothing happened yet').toBe(0);
        expect(completed).toBe(false);

        tick();
        expect(count).withContext('still nothing happened because no subscriber').toBe(0);
        expect(completed).toBe(false);

        timeout.subscribe(observer);
        expect(count).withContext('still nothing happened because cancelled').toBe(0);
        expect(completed).toBe(true);

        tick();
        expect(count).withContext('already completed, nothing change').toBe(0);
        expect(completed).toBe(true);
    }));

    it('run the callback exactly once with DestroyRef', fakeAsync(() => {
        const canceller = new TestDestroyRef();
        const timeout = cancellableTimeout(canceller);

        expect(count).withContext('nothing happened yet').toBe(0);
        expect(completed).toBe(false);

        tick();
        expect(count).withContext('still nothing happened because no subscriber').toBe(0);
        expect(completed).toBe(false);

        timeout.subscribe(observer);
        expect(count).withContext('still nothing happened because time did not pass').toBe(0);
        expect(completed).toBe(false);

        tick();
        expect(count).withContext('callback called exactly once').toBe(1);
        expect(completed).toBe(true);

        canceller.destroy();
        tick();
        expect(count).withContext('already completed, nothing change').toBe(1);
        expect(completed).toBe(true);
    }));

    it('never run the callback if cancelled with DestroyRef', fakeAsync(() => {
        const canceller = new TestDestroyRef();
        const timeout = cancellableTimeout(canceller);

        expect(count).withContext('nothing happened yet').toBe(0);
        expect(completed).toBe(false);

        tick();
        expect(count).withContext('still nothing happened because no subscriber').toBe(0);
        expect(completed).toBe(false);

        timeout.subscribe(observer);
        canceller.destroy();
        expect(count).withContext('still nothing happened because cancelled').toBe(0);
        expect(completed).toBe(true);

        tick();
        expect(count).withContext('already completed, nothing change').toBe(0);
        expect(completed).toBe(true);
    }));
});
