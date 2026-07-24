import {createErrorHandler} from './create-error-handler';
import {type ErrorLink} from '@apollo/client/link/error';
import {type FormattedExecutionResult, GraphQLError, type GraphQLFormattedError} from 'graphql';
import {type ErrorService, type NaturalAlertService, type NetworkActivityService} from '@ecodev/natural';
import {CombinedGraphQLErrors, ServerError} from '@apollo/client';

function combinedGraphQLErrors(errors: readonly GraphQLFormattedError[]): CombinedGraphQLErrors {
    return new CombinedGraphQLErrors(
        {
            data: undefined,
            extensions: undefined,
        } as Partial<FormattedExecutionResult>,
        errors,
    );
}

function errorResponse(error: ErrorLink.ErrorHandlerOptions['error']): ErrorLink.ErrorHandlerOptions {
    return {
        error,
        forward: undefined as any,
        operation: undefined as any,
    };
}

const graphQLQueryError = combinedGraphQLErrors([new GraphQLError('Cannot query field ...')]);

const objectNotFoundError = combinedGraphQLErrors([
    new GraphQLError('Entity not found for class `Application\\Model\\User` and ID `123123`.', {
        extensions: {
            objectNotFound: true,
        },
    }),
]);

const invalidTokenError = combinedGraphQLErrors([
    new GraphQLError('Le lien que vous avez suivi ...', {
        extensions: {
            showSnack: true,
        },
    }),
]);

const invalidEmailError = combinedGraphQLErrors([
    new GraphQLError('Variable "$input" got invalid value "asd@asd_asd.com" ...', {
        extensions: {
            showSnack: true,
        },
    }),
]);

const networkError = new Error('Http failure response for /graphql: 0 Unknown Error');

// As returned by `\Ecodev\Felix\FatalErrorHandler`
const networkErrorPhpMaxExecutionTime = serverError(500, 'Maximum execution time of 30 seconds exceeded');

function serverError(status: number, message: string): ServerError {
    return new ServerError('fake error for testing', {
        response: {status: status} as Response,
        bodyText: message
            ? JSON.stringify({
                  message,
              })
            : '',
    });
}
// As returned by `\GraphQL\Upload\UploadMiddleware`
const networkErrorPhpPostMaxSize = serverError(
    413,
    'The server `post_max_size` is configured to accept 5 MiB, but received 99 MiB"',
);

const networkErrorGeneric500 = serverError(500, '');

const internalServerError = combinedGraphQLErrors([
    {
        message: 'Internal server error',
        locations: [
            {
                line: 2,
                column: 3,
            },
        ],
        path: ['tableCharts'],
        // The typing says `extensions` must always exist. However, it is incorrect, because in
        // real life runtime it is sometimes missing. This might be something wrong in `@apollo/client`,
        // but I could not find the root cause.
    } as unknown as GraphQLError,
]);

describe('createErrorHandler', () => {
    let errorHandler: ErrorLink.ErrorHandler;
    let networkActivityServiceSpy: jasmine.SpyObj<NetworkActivityService>;
    let errorServiceSpy: jasmine.SpyObj<ErrorService>;
    let alertServiceSpy: jasmine.SpyObj<NaturalAlertService>;

    beforeEach(() => {
        networkActivityServiceSpy = jasmine.createSpyObj<NetworkActivityService>('NetworkActivityService', [
            'addErrors',
        ]);
        errorServiceSpy = jasmine.createSpyObj<ErrorService>('ErrorService', ['redirectError']);
        alertServiceSpy = jasmine.createSpyObj<NaturalAlertService>('NaturalAlertService', ['error']);

        errorHandler = createErrorHandler(networkActivityServiceSpy, errorServiceSpy, alertServiceSpy);
    });

    it('graphql query error are redirected to full page', () => {
        errorHandler(errorResponse(graphQLQueryError));

        expect(networkActivityServiceSpy.addErrors).toHaveBeenCalledOnceWith(graphQLQueryError.errors);
        expect(errorServiceSpy.redirectError).toHaveBeenCalledOnceWith(graphQLQueryError.errors[0]);
        expect(alertServiceSpy.error).not.toHaveBeenCalled();
    });

    it('object not found are redirected to full page', () => {
        errorHandler(errorResponse(objectNotFoundError));

        expect(networkActivityServiceSpy.addErrors).toHaveBeenCalledOnceWith(objectNotFoundError.errors);
        expect(errorServiceSpy.redirectError).toHaveBeenCalledOnceWith(objectNotFoundError.errors[0]);
        expect(alertServiceSpy.error).not.toHaveBeenCalled();
    });

    it('invalid token error show snack bar', () => {
        errorHandler(errorResponse(invalidTokenError));

        expect(networkActivityServiceSpy.addErrors).toHaveBeenCalledOnceWith(invalidTokenError.errors);
        expect(errorServiceSpy.redirectError).not.toHaveBeenCalled();
        expect(alertServiceSpy.error).toHaveBeenCalledOnceWith('Le lien que vous avez suivi ...', 5000);
    });

    it('invalid email error show snack bar', () => {
        errorHandler(errorResponse(invalidEmailError));

        expect(networkActivityServiceSpy.addErrors).toHaveBeenCalledOnceWith(invalidEmailError.errors);
        expect(errorServiceSpy.redirectError).not.toHaveBeenCalled();
        expect(alertServiceSpy.error).toHaveBeenCalledOnceWith(
            'Variable "$input" got invalid value "asd@asd_asd.com" ...',
            5000,
        );
    });

    it('network error show snack bar', () => {
        errorHandler(errorResponse(networkError));

        expect(networkActivityServiceSpy.addErrors).not.toHaveBeenCalled();
        expect(errorServiceSpy.redirectError).not.toHaveBeenCalled();
        expect(alertServiceSpy.error).toHaveBeenCalledOnceWith('Une erreur est survenue sur le réseau');
    });

    it('internal server error are redirected to full page', () => {
        errorHandler(errorResponse(internalServerError));

        expect(networkActivityServiceSpy.addErrors).toHaveBeenCalledOnceWith(internalServerError.errors);
        expect(errorServiceSpy.redirectError).toHaveBeenCalledOnceWith(internalServerError.errors[0]);
        expect(alertServiceSpy.error).not.toHaveBeenCalled();
    });

    it('network error for PHP `max_execution_time` show snack bar', () => {
        errorHandler(errorResponse(networkErrorPhpMaxExecutionTime));

        expect(networkActivityServiceSpy.addErrors.calls.allArgs()).toEqual([
            [
                [
                    {
                        message: 'Maximum execution time of 30 seconds exceeded',
                        extensions: {showSnack: true},
                    },
                ],
            ],
        ]);
        expect(errorServiceSpy.redirectError).not.toHaveBeenCalled();
        expect(alertServiceSpy.error).toHaveBeenCalledOnceWith('Maximum execution time of 30 seconds exceeded', 5000);
    });

    it('network error for PHP `post_max_size` show snack bar', () => {
        errorHandler(errorResponse(networkErrorPhpPostMaxSize));

        expect(networkActivityServiceSpy.addErrors.calls.allArgs()).toEqual([
            [
                [
                    {
                        message: 'The server `post_max_size` is configured to accept 5 MiB, but received 99 MiB"',
                        extensions: {showSnack: true},
                    },
                ],
            ],
        ]);
        expect(errorServiceSpy.redirectError).not.toHaveBeenCalled();
        expect(alertServiceSpy.error).toHaveBeenCalledOnceWith(
            'The server `post_max_size` is configured to accept 5 MiB, but received 99 MiB"',
            5000,
        );
    });

    it('network error with a 500 code, similar to `max_execution_time`, show snack bar', () => {
        errorHandler(errorResponse(networkErrorGeneric500));

        expect(networkActivityServiceSpy.addErrors).not.toHaveBeenCalled();
        expect(errorServiceSpy.redirectError).not.toHaveBeenCalled();
        expect(alertServiceSpy.error).toHaveBeenCalledOnceWith('Une erreur est survenue sur le réseau');
    });
});
