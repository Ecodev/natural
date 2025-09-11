import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {NameOrFullName} from '../../types/types';
import {NaturalTimeAgoPipe} from '../common/pipes/time-ago.pipe';
import {DatePipe} from '@angular/common';

type Stamped = {
    creator: NameOrFullName | null;
    updater: NameOrFullName | null;
    creationDate: string | null;
    updateDate: string | null;
};

@Component({
    selector: 'natural-stamp',
    imports: [DatePipe, NaturalTimeAgoPipe],
    templateUrl: './stamp.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NaturalStampComponent {
    public readonly item = input.required<Stamped>();

    protected readonly showUpdate = computed(() => {
        const item = this.item();
        const same = item.updater?.id === item.creator?.id && item.updateDate && item.updateDate === item.creationDate;

        return !same && (!!item.updateDate || !!item.updater);
    });
}
