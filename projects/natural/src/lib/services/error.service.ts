import {DOCUMENT, inject, Service} from '@angular/core';
import {Router} from '@angular/router';
import {type Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {type GraphQLFormattedError} from 'graphql';

/**
 * Service for storing the last error and redirecting to error page conveniently
 */
@Service()
export class ErrorService {
    private readonly document = inject(DOCUMENT);
    private readonly router = inject(Router);

    private lastError: Error | GraphQLFormattedError | null = null;

    private lastErrorHref: string | null = null;

    /**
     * Redirect to error page and display given error
     */
    public redirectError(error: Error | GraphQLFormattedError): void {
        // Don't count error page as a location to have an error
        const errorLocation = this.document.defaultView?.window.location;
        if (errorLocation && errorLocation.pathname !== '/error') {
            this.lastErrorHref = errorLocation.href;
        }
        this.lastError = error;

        this.router.navigateByUrl('/error', {skipLocationChange: true});
    }

    public getLastError(): Error | GraphQLFormattedError | null {
        return this.lastError;
    }

    public getLastErrorHref(): string | null {
        return this.lastErrorHref;
    }

    /**
     * Redirect to error page if the observable fails
     */
    public redirectIfError<T>(observable: Observable<T>): Observable<T> {
        return observable.pipe(
            catchError(error => {
                this.redirectError(error);

                return throwError(() => error);
            }),
        );
    }

    public redirectIfDenied(observable: Observable<boolean>): Observable<boolean> {
        return observable.pipe(
            map(allowed => {
                if (!allowed) {
                    this.redirectError(new Error($localize`Accès refusé`));
                }

                return allowed;
            }),
        );
    }
}
