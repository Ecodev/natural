import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'ellipsis',
    standalone: true,
})
export class NaturalEllipsisPipe implements PipeTransform {
    public transform(value: string, limit: number): string {
        return value.substring(0, limit - 1) + (value.length > limit ? '…' : '');
    }
}
