import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {NaturalAbstractModelService} from '../services/abstract-model.service';
import {FetchResult} from '@apollo/client/core';
import {createPost, Post, PostInput} from './mock-apollo.provider';

/**
 * A service that returns `null` on creation, for testing purpose
 */
@Injectable({
    providedIn: 'root',
})
export class NullService extends NaturalAbstractModelService<
    never,
    never,
    never,
    never,
    Post | null,
    {input: PostInput},
    never,
    never,
    never,
    never
> {
    constructor(apollo: Apollo) {
        super(apollo, 'user', null, null, createPost, null, null);
    }

    protected getDefaultForServer(): PostInput {
        return {
            slug: '',
            blog: '',
        };
    }

    protected mapCreation(result: FetchResult): Post | null {
        return null;
    }
}
