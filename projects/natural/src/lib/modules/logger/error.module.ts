import type { Provider, Type} from '@angular/core';
import {ErrorHandler} from '@angular/core';
import type {
    NaturalLoggerExtra} from './error-handler';
import {
    NaturalErrorHandler,
    NaturalLoggerConfigExtra,
    NaturalLoggerConfigUrl
} from './error-handler';

export function provideErrorHandler(url: string | null, extraService?: Type<NaturalLoggerExtra>): Provider[] {
    const providers: Provider[] = [
        {
            provide: ErrorHandler,
            useClass: NaturalErrorHandler,
        },
        {
            provide: NaturalLoggerConfigUrl,
            useValue: url,
        },
    ];

    if (extraService) {
        providers.push({
            provide: NaturalLoggerConfigExtra,
            useClass: extraService,
        });
    }

    return providers;
}
