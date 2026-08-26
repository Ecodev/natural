import {ifValid} from '@ecodev/natural';
import {FormControl, Validators} from '@angular/forms';
import {TestScheduler} from 'rxjs/testing';

describe('ifValid', () => {
    let scheduler: TestScheduler;

    beforeEach(() => {
        scheduler = new TestScheduler((actual, expected) => {
            expect(actual).toEqual(expected);
        });
    });

    it('valid form should emit immediately', () => {
        scheduler.run(({expectObservable}) => {
            const control = new FormControl();
            expect(control.status).toBe('VALID');

            const actual = ifValid(control);
            expectObservable(actual).toBe('(a|)', {a: 'VALID'});
        });
    });

    it('invalid form should never emit', () => {
        scheduler.run(({expectObservable}) => {
            const control = new FormControl(null, Validators.required);
            expect(control.status).toBe('INVALID');

            const actual = ifValid(control);
            expectObservable(actual).toBe('|');
        });
    });

    it('valid form should emit after the async validation is completed', () => {
        scheduler.run(({expectObservable, cold}) => {
            const control = new FormControl<string | null>(null, null, () => {
                // Always valid after a while
                return cold('-(a|)', {a: null});
            });

            expect(control.status).toBe('PENDING');

            control.setValue('foo');
            expect(control.status).toBe('PENDING');

            const actual = ifValid(control);
            expectObservable(actual).toBe('-(a|)', {a: 'VALID'});
        });
    });

    it('invalid form should never emit, even after the async validation is completed', () => {
        scheduler.run(({expectObservable, cold}) => {
            const control = new FormControl<string | null>(null, null, c => {
                // Simulate error after a while if there is any value
                if (c.value) {
                    return cold('-(a|)', {a: {myError: 'some message'}});
                } else {
                    return cold('-(a|)', {a: null});
                }
            });

            expect(control.status).toBe('PENDING');

            control.setValue('foo');
            expect(control.status).toBe('PENDING');

            const actual = ifValid(control);
            expectObservable(actual).toBe('-|', {a: null});
        });
    });
});
