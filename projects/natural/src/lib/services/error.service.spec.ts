import {TestBed} from '@angular/core/testing';
import {ErrorService} from './error.service';
import {provideRouter, Router} from '@angular/router';
import {NaturalAvatarComponent} from '@ecodev/natural';
import {of, throwError} from 'rxjs';

describe('ErrorService', () => {
    let service: ErrorService;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([
                    {
                        path: 'error',
                        component: NaturalAvatarComponent, // Fake component
                    },
                ]),
            ],
        });

        service = TestBed.inject(ErrorService);
        router = TestBed.inject(Router);
        spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('redirectError', () => {
        it('should navigate to the error page and store the error', () => {
            const error = new Error('test error');
            service.redirectError(error);

            expect(service.getLastError()).toBe(error);
            expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/error', {skipLocationChange: true});
        });

        it('should store the current href when not on the error page', () => {
            service.redirectError(new Error('test error'));

            expect(service.getLastErrorHref()).not.toBeNull();
        });
    });

    describe('redirectIfError', () => {
        it('should redirect and rethrow when the observable errors', () => {
            const error = new Error('test error');
            let thrownError: unknown;

            service.redirectIfError(throwError(() => error)).subscribe({
                error: e => (thrownError = e),
            });

            expect(thrownError).toBe(error);
            expect(service.getLastError()).toBe(error);
            expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/error', {skipLocationChange: true});
        });

        it('should pass through values when the observable succeeds', done => {
            service.redirectIfError(of(42)).subscribe({
                next: value => {
                    expect(value).toBe(42);
                    done();
                },
                error: done.fail,
            });
        });
    });

    describe('redirectIfDenied', () => {
        it('should redirect when the observable emits false', done => {
            let emittedValue: boolean | undefined;

            service.redirectIfDenied(of(false)).subscribe({
                next: value => (emittedValue = value),
                error: done.fail,
            });

            expect(emittedValue).toBeFalse();
            expect(service.getLastError()).toBeTruthy();
            expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/error', {skipLocationChange: true});

            done();
        });

        it('should pass through when the observable emits true', done => {
            let emittedValue: boolean | undefined;

            service.redirectIfDenied(of(true)).subscribe({
                next: value => (emittedValue = value),
                error: done.fail,
            });

            expect(emittedValue).toBeTrue();
            expect(service.getLastError()).toBeNull();
            expect(router.navigateByUrl).not.toHaveBeenCalled();

            done();
        });
    });
});
