import {ApolloLink, DocumentNode} from '@apollo/client/core';
import {formatIsoDateTime, isFile} from './utility';
import {HttpBatchLink, HttpLink, Options} from 'apollo-angular/http';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import extractFiles from 'extract-files/extractFiles.mjs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import isExtractableFile from 'extract-files/isExtractableFile.mjs';
import {Kind, OperationTypeNode} from 'graphql/language';

/**
 * Detect if the given variables have a file to be uploaded or not, and
 * also convert date to be serialized with their timezone.
 */
export function hasFilesAndProcessDate(variables: unknown): boolean {
    let fileFound = false;
    if (!variables || typeof variables !== 'object') {
        return false;
    }

    Object.values(variables).forEach(value => {
        if (value instanceof Date) {
            // Replace native toJSON() function by our own implementation
            value.toJSON = () => formatIsoDateTime(value);
        }

        if (isFile(value)) {
            fileFound = true;
        }

        if (hasFilesAndProcessDate(value)) {
            fileFound = true;
        }
    });

    return fileFound;
}

/**
 * Whether the given GraphQL document contains at least one mutation
 */
export function isMutation(query: DocumentNode): boolean {
    return query.definitions.some(
        definition =>
            definition.kind === Kind.OPERATION_DEFINITION && definition.operation === OperationTypeNode.MUTATION,
    );
}

export const naturalExtractFiles: NonNullable<Options['extractFiles']> = body => extractFiles(body, isExtractableFile);

/**
 * Create an Apollo link that supports batched queries and file uploads.
 *
 * File uploads and mutations are never batched.
 */
export function createHttpLink(httpLink: HttpLink, httpBatchLink: HttpBatchLink, options: Options): ApolloLink {
    // If the query has no file, batch it, otherwise upload only that query
    return ApolloLink.split(
        operation => hasFilesAndProcessDate(operation.variables) || isMutation(operation.query),
        httpLink.create({
            ...options,
            useMultipart: true,
            extractFiles: naturalExtractFiles,
        }),
        httpBatchLink.create(options),
    );
}
