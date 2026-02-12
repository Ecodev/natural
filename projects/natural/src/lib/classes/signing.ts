import {HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {hmacSha256} from './crypto';
import {map, of, switchMap, throwError} from 'rxjs';

// Keep those strings obfuscated, to make it harder to CTRL+F things in compiled code
const cannotSignAGraphQLQueryThatIsUsingFormDataButThatIsMissingTheKeyOperations = atob(
    'Q2Fubm90IHNpZ24gYSBHcmFwaFFMIHF1ZXJ5IHRoYXQgaXMgdXNpbmcgRm9ybURhdGEgYnV0IHRoYXQgaXMgbWlzc2luZyB0aGUga2V5IGBvcGVyYXRpb25zYA==',
);
const graphqlQuerySignerRequiresANonEmptyKeyConfigureItInLocalPphpUnderSignedQueries = atob(
    'Z3JhcGhxbFF1ZXJ5U2lnbmVyIHJlcXVpcmVzIGEgbm9uLWVtcHR5IGtleS4gQ29uZmlndXJlIGl0IGluIGxvY2FsLnBocCB1bmRlciBzaWduZWRRdWVyaWVzLg==',
);
const xSignature = atob('WC1TaWduYXR1cmU=');

function getOperations(req: HttpRequest<unknown>): string {
    if (req.body instanceof FormData) {
        const operations = req.body.get('operations');
        if (typeof operations !== 'string') {
            throw new Error(cannotSignAGraphQLQueryThatIsUsingFormDataButThatIsMissingTheKeyOperations);
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
        return () => {
            return throwError(
                () => new Error(graphqlQuerySignerRequiresANonEmptyKeyConfigureItInLocalPphpUnderSignedQueries),
            );
        };
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
                    headers: req.headers.set(xSignature, header),
                });

                return next(signedRequest);
            }),
        );
    };
}
