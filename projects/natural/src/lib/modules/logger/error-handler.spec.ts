import {TestBed} from '@angular/core/testing';
import {Literal, NaturalErrorHandler, NaturalLoggerExtra, NaturalLoggerType} from '@ecodev/natural';
import {HttpClientTestingModule, HttpTestingController, RequestMatch} from '@angular/common/http/testing';
import {Observable, of, throwError} from 'rxjs';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {NaturalModule} from '../../natural.module';

const expectedRequest: RequestMatch = {
    url: 'http://example.com',
    method: 'POST',
};

class Extra implements NaturalLoggerExtra {
    public getExtras(error: unknown): Observable<Partial<NaturalLoggerType>> {
        return of({href: 'overridden href', more: 'custom'}, {href: 'second'});
    }
}

class ExtraError implements NaturalLoggerExtra {
    public getExtras(error: unknown): Observable<Partial<NaturalLoggerType>> {
        return throwError(() => 'fake extra error');
    }
}

describe('NaturalErrorHandler', () => {
    let service: NaturalErrorHandler;
    let httpTestingController: HttpTestingController;

    afterEach(() => {
        httpTestingController.verify();
    });

    describe('with empty configuration', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [NaturalModule, HttpClientTestingModule],
            });

            httpTestingController = TestBed.inject(HttpTestingController);
            service = TestBed.inject(NaturalErrorHandler);
            spyOn(console, 'error');
        });

        it('should be created', () => {
            expect(service).toBeTruthy();
        });

        it('should support string by only dumping to console', () => {
            service.handleError('my error message');
            expect(console.error).toHaveBeenCalledOnceWith('my error message');

            httpTestingController.expectNone(expectedRequest);
        });

        it('should support error with stacktrace by only dumping to console', () => {
            const error = new Error('my real error message');
            service.handleError(error);
            expect(console.error).toHaveBeenCalledOnceWith(error);

            httpTestingController.expectNone(expectedRequest);
        });
    });

    describe('with minimal configuration', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [NaturalModule.forRoot({errorHandler: {url: 'http://example.com'}}), HttpClientTestingModule],
            });

            httpTestingController = TestBed.inject(HttpTestingController);
            service = TestBed.inject(NaturalErrorHandler);
            spyOn(console, 'error');
        });

        it('should be created', () => {
            expect(service).toBeTruthy();
        });

        it('should support string', () => {
            service.handleError('my error message');
            expect(console.error).toHaveBeenCalledOnceWith('my error message');

            const req = httpTestingController.expectOne(expectedRequest);
            const body: Literal = req.request.body;

            expect(Object.keys(body)).toEqual(['message', 'href', 'host', 'path', 'agent', 'level']);
            expect(body.level).toBe('error');
            expect(body.message).toBe('my error message');
        });

        it('should support error with stacktrace', () => {
            const error = new Error('my real error message');
            service.handleError(error);
            expect(console.error).toHaveBeenCalledOnceWith(error);

            const req = httpTestingController.expectOne(expectedRequest);
            const body: Literal = req.request.body;

            expect(Object.keys(body)).toEqual(['message', 'href', 'host', 'path', 'agent', 'level', 'stacktrace']);
            expect(body.level).toBe('error');
            expect(body.message).toBe('my real error message');
        });
    });

    describe('with maximal configuration', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    NaturalModule.forRoot({
                        errorHandler: {
                            url: 'http://example.com',
                            extraService: Extra,
                        },
                    }),
                    HttpClientTestingModule,
                ],
            });

            httpTestingController = TestBed.inject(HttpTestingController);
            service = TestBed.inject(NaturalErrorHandler);
            spyOn(console, 'error');
        });

        it('should be created', () => {
            expect(service).toBeTruthy();
        });

        it('should support string', () => {
            service.handleError('my error message');
            expect(console.error).toHaveBeenCalledOnceWith('my error message');

            const req = httpTestingController.expectOne(expectedRequest);
            const body: Literal = req.request.body;

            expect(Object.keys(body)).toEqual(['message', 'href', 'host', 'path', 'agent', 'level', 'more']);
            expect(body.level).toBe('error');
            expect(body.message).toBe('my error message');
            expect(body.href).toBe('overridden href');
            expect(body.more).toBe('custom');
        });

        it('should support error with stacktrace', () => {
            const error = new Error('my real error message');
            service.handleError(error);
            expect(console.error).toHaveBeenCalledOnceWith(error);

            const req = httpTestingController.expectOne(expectedRequest);
            const body: Literal = req.request.body;

            expect(Object.keys(body)).toEqual([
                'message',
                'href',
                'host',
                'path',
                'agent',
                'level',
                'stacktrace',
                'more',
            ]);
            expect(body.level).toBe('error');
            expect(body.message).toBe('my real error message');
            expect(body.href).toBe('overridden href');
            expect(body.more).toBe('custom');
        });
    });

    describe('with extra producer error configuration', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    NaturalModule.forRoot({
                        errorHandler: {
                            url: 'http://example.com',
                            extraService: ExtraError,
                        },
                    }),
                    HttpClientTestingModule,
                ],
            });

            httpTestingController = TestBed.inject(HttpTestingController);
            service = TestBed.inject(NaturalErrorHandler);
            spyOn(console, 'error');
        });

        it('should log error with getExtras', () => {
            service.handleError('my error message');
            expect(console.error).toHaveBeenCalledOnceWith('my error message');

            const req = httpTestingController.expectOne(expectedRequest);
            const body: Literal = req.request.body;

            expect(Object.keys(body)).toEqual([
                'message',
                'href',
                'host',
                'path',
                'agent',
                'level',
                'getExtrasErrorMessage',
            ]);
            expect(body.level).toBe('error');
            expect(body.message).toBe('my error message');
            expect(body.getExtrasErrorMessage).toBe('fake extra error');
        });
    });
});

describe('NaturalErrorHandler bis', () => {
    let service: NaturalErrorHandler;
    let httpClientSpy: jasmine.Spy<HttpClient['post']>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NaturalModule.forRoot({errorHandler: {url: 'http://example.com'}}), HttpClientModule],
        });

        const httpClient = TestBed.inject(HttpClient);
        service = TestBed.inject(NaturalErrorHandler);
        httpClientSpy = spyOn(httpClient, 'post').and.callFake(() => throwError(() => 'fake HTTP error'));
        spyOn(console, 'error');
    });

    it('should silence HTTP errors if our log server is down', () => {
        service.handleError('my error message');
        expect(console.error).toHaveBeenCalledOnceWith('my error message');
        expect(httpClientSpy).toHaveBeenCalledTimes(1);
    });
});
