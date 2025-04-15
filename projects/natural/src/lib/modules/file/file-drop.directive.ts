import {DestroyRef, Directive, HostBinding, HostListener, inject, OnInit, output} from '@angular/core';
import {NaturalAbstractFile} from './abstract-file';
import {eventToFiles, stopEvent} from './utils';
import {asyncScheduler, Subject} from 'rxjs';
import {throttleTime} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * This directive has all options to select files, and adds support for drag'n'drop.
 *
 * It will add the CSS class `natural-file-over` on the component when a file is
 * dragged over. It is up to the component to have some specific styling by using
 * this class.
 *
 * In most cases you probably also want click-to-select, so you should use:
 *
 * ```html
 * <div naturalFileDrop [selectable]="true"></div>
 * ```
 */
@Directive({
    selector: ':not([naturalFileSelect])[naturalFileDrop]',
    standalone: true,
})
export class NaturalFileDropDirective extends NaturalAbstractFile implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    @HostBinding('class.natural-file-over') public fileOverClass = false;

    /**
     * Emits whenever files are being dragged over
     */
    public readonly fileOver = output<boolean>();

    private readonly rawFileOver = new Subject<boolean>();

    public override ngOnInit(): void {
        super.ngOnInit();

        // Automatically change the class, but not too often to avoid visual
        // flickering in Chrome when hovering across child HTML element of our host.
        // It's not absolutely perfect and if dragging slowly and precisely we can
        // still see flicker, but it should be better for most normal usages.
        this.rawFileOver
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                throttleTime(200, asyncScheduler, {
                    leading: true,
                    trailing: true,
                }),
            )
            .subscribe(fileOver => {
                this.fileOver.emit(fileOver);
                this.fileOverClass = fileOver;
            });
    }

    @HostListener('drop', ['$event'])
    public onDrop(event: DragEvent): void {
        if (this.fileSelectionDisabled) {
            return;
        }

        this.closeDrags();

        const files = eventToFiles(event);
        if (!files.length) {
            return;
        }

        stopEvent(event);
        this.handleFiles(files);
    }

    @HostListener('dragover', ['$event'])
    public onDragOver(event: DragEvent): void {
        if (!this.hasObservers()) {
            return;
        }

        if (this.fileSelectionDisabled) {
            return;
        }

        stopEvent(event);

        // Change cursor
        const transfer = event.dataTransfer;
        if (transfer) {
            transfer.dropEffect = 'copy';
        }

        this.rawFileOver.next(true);
    }

    private closeDrags(): void {
        this.rawFileOver.next(false);
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(event: DragEvent): void {
        if (this.fileSelectionDisabled) {
            return;
        }

        stopEvent(event);
        this.closeDrags();
    }
}
