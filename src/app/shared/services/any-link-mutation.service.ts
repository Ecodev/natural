import {Injectable} from '@angular/core';
import {type ApolloLink} from '@apollo/client';
import {debug, type LinkableObject} from '@ecodev/natural';
import {delay, type Observable, of} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AnyLinkMutationService {
    public link(obj1: LinkableObject): Observable<ApolloLink.Result<{id: string}>> {
        return of({data: obj1}).pipe(debug('Mock NaturalLinkMutationService.link()'), delay(500));
    }

    public linkMany(obj1: LinkableObject): Observable<ApolloLink.Result<{id: string}>[]> {
        return of([{data: obj1}]).pipe(debug('Mock NaturalLinkMutationService.linkMany()'), delay(500));
    }

    public unlink(obj1: LinkableObject): Observable<ApolloLink.Result<{id: string}>> {
        return of({data: obj1}).pipe(debug('Mock NaturalLinkMutationService.unlink()'), delay(500));
    }
}
