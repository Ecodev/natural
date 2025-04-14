import {inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {GraphQLFormattedError} from 'graphql';
import {HttpInterceptorFn} from '@angular/common/http';
import {finalize} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';

type ProgressBar = {
    start: () => void;
    complete: () => void;
};

/**
 * Intercept HTTP request from Angular to show them as activity
 */
export const activityInterceptor: HttpInterceptorFn = (req, next) => {
    const networkActivityService = inject(NetworkActivityService);
    networkActivityService.increase();

    return next(req).pipe(finalize(() => networkActivityService.decrease()));
};

/**
 * Singleton to track pending XHR and XHR errors in the whole application.
 *
 * You must:
 *
 * - start the tracking by calling `setProgressRef()`
 * - provide the HTTP interceptor `activityInterceptor`
 *
 * The tracking will be entirely disabled for SSR.
 */
@Injectable({
    providedIn: 'root',
})
export class NetworkActivityService {
    private progress: ProgressBar | null = null;
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    /**
     * Count pending requests
     */
    private pending = 0;

    private readonly writableErrors = signal<GraphQLFormattedError[]>([]);

    /**
     * GraphQL errors that happened recently
     */
    public readonly errors = this.writableErrors.asReadonly();

    public setProgressRef(progressBar: ProgressBar): void {
        this.progress = progressBar;
    }

    /**
     * Notify an XHR started
     */
    public increase(): void {
        if (!this.isBrowser) {
            return;
        }

        if (this.pending === 0) {
            this.progress?.start();
        }

        this.pending++;
    }

    /**
     * Notify an XHR ended (even if unsuccessful)
     */
    public decrease(): void {
        if (!this.isBrowser) {
            return;
        }

        this.pending--;
        if (this.pending < 0) {
            this.pending = 0;
        }

        // Mark progress a completed, after waiting 20ms in case a refetchQueries would be used
        if (this.pending === 0) {
            setTimeout(() => {
                if (this.pending === 0) {
                    this.progress?.complete();
                }
            }, 20);
        }
    }

    /**
     * Add new GraphQL errors
     */
    public addErrors(errors: readonly GraphQLFormattedError[]): void {
        if (errors.length) {
            this.writableErrors.update(previous => [...previous, ...errors]);
        }
    }

    /**
     * Clear all GraphQL errors
     */
    public clearErrors(): void {
        this.writableErrors.set([]);
    }
}
