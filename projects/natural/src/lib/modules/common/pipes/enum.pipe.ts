import {Pipe, PipeTransform, inject} from '@angular/core';
import {NaturalEnumService} from '../../../services/enum.service';
import {Observable} from 'rxjs';

/**
 * A pipe to output an enum user-friendly name, instead of its value.
 *
 * Usage would be: {{ element.priority | enum: 'Priority' | async }}
 */
@Pipe({
    name: 'enum',
    standalone: true,
})
export class NaturalEnumPipe implements PipeTransform {
    private readonly enumService = inject(NaturalEnumService);

    public transform(value: any, enumName: string): Observable<string> {
        return this.enumService.getValueName(value, enumName);
    }
}
