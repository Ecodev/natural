import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AnyService } from './any.service';

@Injectable({
    providedIn: 'root',
})
export class AnyResolver implements Resolve<any> {

    constructor(private anyService: AnyService) {
    }

    /**
     * Resolve taxonomy data for router and panels service
     */
    public resolve(route: ActivatedRouteSnapshot): Observable<any> {
        return of({model: this.anyService.getItem(true)});
    }

}
