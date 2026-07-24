import type { PipeTransform} from '@angular/core';
import {Pipe} from '@angular/core';

@Pipe({
    name: 'ellipsis',
})
export class NaturalEllipsisPipe implements PipeTransform {
    public transform(value: string, limit: number): string {
        return value.substring(0, limit - 1) + (value.length > limit ? '…' : '');
    }
}
