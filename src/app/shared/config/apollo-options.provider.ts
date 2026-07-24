import {type ApolloClient, ApolloLink, InMemoryCache} from '@apollo/client';

export const apolloDefaultOptions: ApolloClient.Options['defaultOptions'] = {
    query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'none',
    },
    watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'none',
        returnPartialData: false,
        notifyOnNetworkStatusChange: false,
    },
    mutate: {
        errorPolicy: 'none',
    },
};

export function apolloOptionsFactory(): ApolloClient.Options {
    return {
        link: ApolloLink.empty(),
        cache: new InMemoryCache(),
        defaultOptions: apolloDefaultOptions,
    };
}
