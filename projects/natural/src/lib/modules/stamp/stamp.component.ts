import {Component, Input} from '@angular/core';
import {NameOrFullName} from '../../types/types';

type Stamped = {
    creator: NameOrFullName | null;
    updater: NameOrFullName | null;
    creationDate: string | null;
    updateDate: string | null;
};

@Component({
    selector: 'natural-stamp',
    templateUrl: './stamp.component.html',
})
export class NaturalStampComponent {
    @Input() public item!: Stamped;
}
