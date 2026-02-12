import {graphqlQuerySigner} from './signing';
import {HttpHandlerFn, HttpRequest, HttpResponse} from '@angular/common/http';
import {of} from 'rxjs';

const graphqlQuery = {
    operationName: 'CurrentUser',
    variables: {},
    query: 'query CurrentUser { viewer { id }}',
};

const batchedGraphqlQuery = [
    graphqlQuery,
    {
        operationName: 'Configuration',
        variables: {key: 'announcement-active'},
        query: 'query Configuration($key: String!) {\n  configuration(key: $key)\n}',
    },
];

const key = 'my-secret-1';

function createHandlerSpy(): jasmine.Spy<HttpHandlerFn> {
    const handler = jasmine.createSpy<HttpHandlerFn>('HttpHandlerFn');
    handler.and.callFake(() => of(new HttpResponse()));
    return handler;
}

function expectSigned(request: HttpRequest<unknown>, expected: string, done: DoneFn): void {
    const signer = graphqlQuerySigner(key);
    const handler = createHandlerSpy();

    signer(request, handler).subscribe(() => {
        expect(handler).toHaveBeenCalledTimes(1);
        const sentRequest = handler.calls.first().args[0];
        expect(sentRequest.headers.get('X-Signature')).toBe(expected);
        done();
    });
}

function expectNotSigned(request: HttpRequest<unknown>, done: DoneFn): void {
    const signer = graphqlQuerySigner(key);
    const handler = createHandlerSpy();

    signer(request, handler).subscribe(() => {
        expect(handler).toHaveBeenCalledOnceWith(request);
        expect(request.headers.has('X-Signature')).toBeFalse();
        done();
    });
}

function expectError(request: HttpRequest<unknown>, expected: string, done: DoneFn, theKey: string = key): void {
    const signer = graphqlQuerySigner(theKey);
    const handler = createHandlerSpy();

    signer(request, handler).subscribe({
        error: error => {
            expect(handler).not.toHaveBeenCalled();
            expect(request.headers.has('X-Signature')).toBeFalse();
            expect(error).toBeInstanceOf(Error);
            expect('message' in error).toBeTrue();
            expect(error.message).toBe(expected);
            done();
        },
    });
}

describe('graphqlQuerySigner', () => {
    beforeEach(() => {
        jasmine.clock().mockDate(new Date('2026-02-11T18:05:10.000Z'));
    });

    it('sign a normal query', done => {
        const request = new HttpRequest('POST', '/graphql', graphqlQuery);

        expectSigned(request, 'v1.1770833110.899f1ec4384cc3cae362163d835265d74c5a25f609d67ca66bc88101a757256d', done);
    });

    it('sign a batched query', done => {
        const request = new HttpRequest('POST', '/graphql', batchedGraphqlQuery);

        expectSigned(request, 'v1.1770833110.7bb7fc480233e83f36e5178dee272ed7d2865b050d57de32ca6205cb469f4331', done);
    });

    it('sign an upload query', done => {
        const createImage =
            '{"operationName":"CreateImage","variables":{"input":{"file":null}},"query":"mutation CreateImage($input: ImageInput!) { createImage(input: $input) { id }}"}';

        const data = new FormData();
        data.set('operations', createImage);
        data.set('map', '{"1":["variables.input.file"]}');
        data.set('1', new File([], 'image.jpg'));

        const request = new HttpRequest('POST', '/graphql', data);

        expectSigned(request, 'v1.1770833110.cce47630a70e7920d8287b204c0c49828bb393e38bd9b691d7e883dfb58d4a37', done);
    });

    it('sign an upload query without `operations` will throw', done => {
        const data = new FormData();
        const request = new HttpRequest('POST', '/graphql', data);

        expectError(
            request,
            'Cannot sign a GraphQL query that is using FormData but that is missing the key `operations`',
            done,
        );
    });

    it('do not sign other URL', done => {
        const request = new HttpRequest('POST', '/api', graphqlQuery);

        expectNotSigned(request, done);
    });

    it('do not sign other methods', done => {
        const request = new HttpRequest('GET', '/graphql', graphqlQuery);

        expectNotSigned(request, done);
    });

    it('if mis-configured, will always error, even if query should not be signed', done => {
        const request = new HttpRequest('POST', '/graphql', graphqlQuery);

        expectError(
            request,
            'graphqlQuerySigner requires a non-empty key. Configure it in local.php under signedQueries.',
            done,
            '',
        );
    });
});
