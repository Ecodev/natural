import {Type} from '@angular/core';
import {NaturalLoggerExtra} from './error-handler';

export type NaturalErrorHandlerConfig = {
    url: string | null;
    extraService?: Type<NaturalLoggerExtra>;
};
