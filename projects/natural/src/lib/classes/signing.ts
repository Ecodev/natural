import {HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {hmacSha256} from './crypto';
import {map, of, switchMap, throwError} from 'rxjs';

function getOperations(req: HttpRequest<unknown>): string {
    if (req.body instanceof FormData) {
        const operations = req.body.get('operations');
        if (typeof operations !== 'string') {
            throw new Error(
                'Cannot sign a GraphQL query that is using FormData but that is missing the key `operations`',
            );
        }
        return operations;
    } else {
        return JSON.stringify(req.body);
    }
}

/**
 * Sign all HTTP POST requests that are GraphQL queries against `/graphql` endpoint with a custom signature.
 *
 * The server will validate the signature before executing the GraphQL query.
 */
export function graphqlQuerySigner(key: string): HttpInterceptorFn {
    // Validates the configuration exactly 1 time (not for
    // every query), and if not reject **all** HTTP requests
    if (!key) {
        return () =>
            throwError(
                () =>
                    new Error(
                        'graphqlQuerySigner requires a non-empty key. Configure it in local.php under signedQueries.',
                    ),
            );
    }

    return (req, next) => {
        const mustSign = req.method === 'POST' && /\/graphql(\?|$)/.exec(req.url);
        if (!mustSign) {
            return next(req);
        }

        return of(req).pipe(
            map(req => {
                const timestamp = Math.round(Date.now() / 1000);
                const operations = getOperations(req);

                return {
                    operations: operations,
                    timestamp: timestamp,
                    payload: timestamp + operations,
                };
            }),
            switchMap(async data => {
                return {
                    ...data,
                    hash: await hmacSha256(key, data.payload),
                };
            }),
            switchMap(data => {
                const header = `v1.${data.timestamp}.${data.hash}`;
                const signedRequest = req.clone({
                    headers: req.headers.set('X-Signature', header),
                });

                return next(signedRequest);
            }),
        );
    };
}
