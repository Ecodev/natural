import {CombinedGraphQLErrors, ErrorLike, ServerError} from '@apollo/client';
import {ErrorLink} from '@apollo/client/link/error';
import type {ErrorService} from '../services/error.service';
import type {NetworkActivityService} from './network-activity.service';
import type {NaturalAlertService} from '../modules/alert/alert.service';
import {FormattedExecutionResult} from 'graphql';

/**
 * Create an Apollo link to show alert in case of error, and message if network is down
 */
export function createErrorLink(
    networkActivityService: NetworkActivityService,
    errorService: ErrorService,
    alertService: NaturalAlertService,
): ErrorLink {
    return new ErrorLink(createErrorHandler(networkActivityService, errorService, alertService));
}

export function createErrorHandler(
    networkActivityService: NetworkActivityService,
    errorService: ErrorService,
    alertService: NaturalAlertService,
): ErrorLink.ErrorHandler {
    return options => {
        const error = serverErrorToUserFriendlyError(options.error);

        // Show GraphQL responses with errors to end-users
        if (CombinedGraphQLErrors.is(error)) {
            error.errors.forEach(error => {
                if ('extensions' in error && error.extensions?.showSnack) {
                    // Show whatever server prepared for end-user, with a bit more time to read
                    alertService.error(error.message, 5000);
                } else {
                    // Show full page error if graphql error (such as API incompatibilities)
                    errorService.redirectError(error);
                }
            });

            networkActivityService.addErrors(error.errors);
        } else {
            alertService.error($localize`Une erreur est survenue sur le réseau`);
        }
    };
}

/**
 *  Maybe transform the server error into a user visible, user friendly, error, but only if it is:
 *
 *  - an 413 error from `graphql-upload` about `post_max_size`
 *  - a 500 error about max_execution_time
 */
function serverErrorToUserFriendlyError(error: ErrorLike): ErrorLike | CombinedGraphQLErrors {
    if (!ServerError.is(error) || ![413, 500].includes(error.statusCode)) {
        return error;
    }

    let json: unknown;
    try {
        json = JSON.parse(error.bodyText) as unknown;
    } catch (e) {
        return error;
    }

    // If we are sure it's a JSON error in our custom format of `{message: "my error message"}`
    if (
        json &&
        typeof json === 'object' &&
        'message' in json &&
        Object.keys(json).length === 1 &&
        typeof json.message === 'string'
    ) {
        return new CombinedGraphQLErrors(
            {
                data: undefined,
                extensions: undefined,
            } as Partial<FormattedExecutionResult>,
            [
                {
                    message: json.message,
                    extensions: {showSnack: true},
                },
            ],
        );
    }

    return error;
}
