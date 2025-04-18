import {Component, inject, Input, output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NaturalFixedButtonComponent} from '../fixed-button/fixed-button.component';

type Model = {
    id?: string;
    permissions?: {
        delete: boolean;
    };
};

@Component({
    selector: 'natural-fixed-button-detail',
    templateUrl: './fixed-button-detail.component.html',
    styleUrl: './fixed-button-detail.component.scss',
    imports: [NaturalFixedButtonComponent, MatTooltipModule],
})
export class NaturalFixedButtonDetailComponent {
    private canChange = true;
    public isCreation = false;

    public get model(): Model {
        return this._model;
    }

    @Input({required: true})
    public set model(value: Model) {
        this._model = value;
        if (this.canChange) {
            this.isCreation = !this._model.id;
            this.canChange = false;
        }
    }

    private _model!: Model;

    @Input({required: true}) public form!: FormGroup;

    public readonly create = output();
    public readonly delete = output();

    public constructor() {
        const route = inject(ActivatedRoute);

        route.params.pipe(takeUntilDestroyed()).subscribe(() => (this.canChange = true));
    }

    public clickCreate(): void {
        if (this.form.enabled) {
            this.create.emit();
        }
    }

    public clickDelete(): void {
        if (this.form.enabled) {
            this.delete.emit();
        }
    }
}
