import {Service} from '@angular/core';
import {NaturalAbstractModelService} from '../services/abstract-model.service';
import {
    createPost,
    deletePosts,
    type Post,
    type PostInput,
    postQuery,
    postsQuery,
    updatePost,
} from './mock-apollo.provider';
import {type Literal, type PaginatedData, type QueryVariables} from '@ecodev/natural';

@Service()
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
