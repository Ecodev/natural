import {DestroyRef, Directive, HostBinding, HostListener, inject} from '@angular/core';
import {NaturalPanelsService} from './panels.service';
import {NaturalPanelData} from './types';
import {Observable} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Directive({standalone: true})
export class NaturalAbstractPanel {
    protected readonly destroyRef = inject(DestroyRef);
    /**
     * The data property is the container where the resolved content is stored
     * When loading a component from a panel opening (dialog), receives the data provided by the service
     */
    public data: any = {};

    /**
     * Bind isFrontPanel style class on root component
     */
    @HostBinding('class.isFrontPanel') public isFrontPanel = false;

    /**
     * Bind isPanel style class on root component
     */
    @HostBinding('class.isPanel') public isPanel = false;

    /**
     * Merging of data provided by the very root component (that is in a route context) and inherited data through panels
     * TODO: provide type with available attributes
     */
    public panelData?: NaturalPanelData;
    public panelService?: NaturalPanelsService;

    /**
     * Bind click on panels, to allow the selection of those who are behind
     */
    @HostListener('click')
    public clickPanel(): void {
        if (!this.isFrontPanel && this.panelService) {
            this.panelService.goToPanelByComponent(this);
        }
    }

    /**
     * Called when panel opens and component is loaded
     * Runs before ngOnInit()
     */
    public initPanel(panelData: NaturalPanelData): void {
        this.panelData = panelData;
        this.isPanel = true;

        if (this.panelData?.data) {
            if (this.panelData.data.model instanceof Observable) {
                // Subscribe to model to know when Apollo cache is changed, so we can reflect it into `data.model`
                this.panelData.data.model.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(model => {
                    this.data = {
                        ...this.data,
                        ...this.panelData?.data,
                        model: model,
                    };
                });
            } else {
                this.data = {
                    ...this.data,
                    ...this.panelData.data,
                };
            }
        }
    }
}
