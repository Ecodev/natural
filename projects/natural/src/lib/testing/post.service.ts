import {Injectable} from '@angular/core';
import {NaturalAbstractModelService} from '../services/abstract-model.service';
import type { Post, PostInput} from './mock-apollo.provider';
import {createPost, deletePosts, postQuery, postsQuery, updatePost} from './mock-apollo.provider';
import type {Literal, PaginatedData, QueryVariables} from '@ecodev/natural';

@Injectable({
    providedIn: 'root',
})
export class PostService extends NaturalAbstractModelService<
    Post,
    {id: string},
    PaginatedData<Post>,
    QueryVariables,
    Post | null,
    {input: PostInput},
    Post,
    {id: string; input: Literal},
    boolean,
    {ids: string[]}
> {
    public constructor() {
        super('post', postQuery, postsQuery, createPost, updatePost, deletePosts);
    }

    public override getDefaultForServer(): PostInput {
        return {
            slug: '',
            blog: '',
        };
    }
}
