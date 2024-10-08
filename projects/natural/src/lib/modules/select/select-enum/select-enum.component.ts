import {Component, Input, OnInit, inject} from '@angular/core';
import {ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {IEnum, NaturalEnumService} from '../../../services/enum.service';
import {AbstractSelect} from '../abstract-select.component';
import {MatOptionModule} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

type V = IEnum['value'] | IEnum['value'][];

@Component({
    selector: 'natural-select-enum',
    templateUrl: './select-enum.component.html',
    styleUrl: './select-enum.component.scss',
    standalone: true,
    imports: [MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, CommonModule, MatOptionModule],
})
export class NaturalSelectEnumComponent extends AbstractSelect<V, V> implements OnInit, ControlValueAccessor {
    private readonly enumService = inject(NaturalEnumService);

    /**
     * The name of the enum type, eg: `"ActionStatus"`
     */
    @Input({required: true}) public enumName!: string;

    /**
     * If given an extra option is added to select `null` with given label
     */
    @Input() public nullLabel?: string;

    /**
     * Functions that receives an enum value and returns whether that value is disabled
     */
    @Input() public optionDisabled?: (item: IEnum) => boolean;

    /**
     * Whether the user should be allowed to select multiple options
     */
    @Input() public multiple = false;

    public items?: Observable<IEnum[]>;

    public constructor() {
        const ngControl = inject(NgControl, {optional: true, self: true});

        super(ngControl);
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        this.items = this.enumService.get(this.enumName);
    }

    public getDisplayFn(): (item: V | null) => string {
        throw new Error('This should never be called');
    }
}
