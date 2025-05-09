import {Component, ElementRef, inject, input, Input, OnDestroy, OnInit, output, viewChild} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';
import {EditorView} from 'prosemirror-view';
import {EditorState, Plugin, Transaction} from 'prosemirror-state';
import {DOMParser, DOMSerializer, Schema} from 'prosemirror-model';
import {DOCUMENT} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {goToNextCell, tableEditing} from 'prosemirror-tables';
import {keymap} from 'prosemirror-keymap';
import {ImagePlugin, ImageUploader} from '../utils/image';
import {advancedSchema, basicSchema} from '../utils/schema/schema';
import {buildMenuItems, Key, MenuItems} from '../utils/menu';
import {history} from 'prosemirror-history';
import {baseKeymap} from 'prosemirror-commands';
import {dropCursor} from 'prosemirror-dropcursor';
import {gapCursor} from 'prosemirror-gapcursor';
import {buildInputRules} from '../utils/inputrules';
import {buildKeymap} from '../utils/keymap';
import {NaturalFileDropDirective} from '@ecodev/natural';
import {MatDividerModule} from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {Subject} from 'rxjs';
import {outputFromObservable} from '@angular/core/rxjs-interop';

/**
 * Prosemirror component
 *
 * Usage :
 *
 * ```html
 * <natural-editor [(ngModel)]="htmlString" />
 * ```
 */
// @dynamic
@Component({
    selector: 'natural-editor',
    templateUrl: './editor.component.html',
    styleUrl: './editor.component.scss',
    providers: [ImagePlugin],
    imports: [
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        MatButtonToggleModule,
        MatMenuModule,
        MatDividerModule,
        NaturalFileDropDirective,
    ],
})
export class NaturalEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
    private readonly ngControl = inject(NgControl, {optional: true, self: true});
    private readonly document = inject(DOCUMENT);
    private readonly dialog = inject(MatDialog);
    private readonly imagePlugin = inject(ImagePlugin);

    private view: EditorView | null = null;

    private readonly editor = viewChild.required('editor', {read: ElementRef});

    public readonly contentChange = output<string>();

    /**
     * Callback to upload an image.
     *
     * If given it will enable advanced schema, including image and tables.
     * It must be given on initialization and cannot be changed later on.
     */
    @Input() public imageUploader: ImageUploader | null = null;

    /**
     * Mode must be set on initialization. Later changes will have no effect. Possible values are:
     *
     * - `basic`, the default, only offers minimal formatting options
     * - `advanced`, adds text colors, headings, alignments, and tables.  If `imageUploader` is given, it will force `advanced` mode.
     */
    public readonly mode = input<'basic' | 'advanced'>('basic');

    private schema: Schema = basicSchema;

    /**
     * Interface with ControlValueAccessor
     * Notifies parent model / form controller
     */
    private onChange?: (value: string | null) => void;

    /**
     * HTML string
     */
    private content = '';

    public menu: MenuItems | null = null;

    protected readonly save$ = new Subject<void>();

    /**
     * If subscribed to, then the save button will be shown and click events forwarded
     */
    public readonly save = outputFromObservable(this.save$);

    public disabled = false;

    public constructor() {
        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }
    }

    public ngOnInit(): void {
        this.schema = this.imageUploader || this.mode() === 'advanced' ? advancedSchema : basicSchema;
        this.menu = buildMenuItems(this.schema, this.dialog);
        const serializer = DOMSerializer.fromSchema(this.schema);
        const state = this.createState();

        this.view = new EditorView(this.editor().nativeElement, {
            state: state,
            editable: () => !this.disabled,
            dispatchTransaction: (transaction: Transaction) => {
                if (!this.view) {
                    return;
                }

                const newState = this.view.state.apply(transaction);
                this.view.updateState(newState);

                // Transform doc into HTML string
                const dom = serializer.serializeFragment(this.view.state.doc as any);
                const el = this.document.createElement('_');
                el.appendChild(dom);

                const newContent = el.innerHTML;
                if (this.content === newContent || this.disabled) {
                    return;
                }

                this.content = el.innerHTML;

                if (this.onChange) {
                    this.onChange(this.content);
                }
                this.contentChange.emit(this.content);
            },
        });
        this.update();
    }

    public writeValue(val: string | undefined): void {
        if (typeof val === 'string' && val !== this.content) {
            this.content = val;
        }

        if (this.view !== null) {
            const state = this.createState();
            this.view.updateState(state);
        }
    }

    private createState(): EditorState {
        const template = this.document.createElement('_');
        template.innerHTML = '<div>' + this.content + '</div>';
        if (!template.firstChild) {
            throw new Error('child of template element could not be created');
        }

        const parser = DOMParser.fromSchema(this.schema);
        const doc = parser.parse(template.firstChild);

        return EditorState.create({
            doc: doc,
            plugins: this.createPlugins(),
        });
    }

    private createPlugins(): Plugin[] {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const isMac = !!this.document.defaultView?.navigator.platform.match(/Mac/);

        const plugins = [
            buildInputRules(this.schema),
            keymap(buildKeymap(this.schema, isMac)),
            keymap(baseKeymap),
            dropCursor(),
            gapCursor(),
            history(),
            new Plugin({
                props: {
                    attributes: {class: 'ProseMirror-example-setup-style'},
                },
            }),
            new Plugin({
                view: () => this,
            }),
        ];

        if (this.imageUploader) {
            plugins.push(this.imagePlugin.plugin);
        }

        if (this.schema === advancedSchema) {
            plugins.push(
                tableEditing(),
                keymap({
                    Tab: goToNextCell(1),
                    'Shift-Tab': goToNextCell(-1),
                }),
            );
        }

        return plugins;
    }

    /**
     * Called by Prosemirror whenever the editor state changes. So we update our menu states.
     */
    public update(): void {
        if (!this.view || !this.menu) {
            return;
        }

        for (const item of Object.values(this.menu)) {
            item.update(this.view, this.view.state);
        }
    }

    public registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    public registerOnTouched(): void {
        // noop
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public ngOnDestroy(): void {
        if (this.view) {
            this.view.destroy();
            this.view = null;
        }
    }

    public run(event: Event, key: Key): void {
        if (!this.view || !this.menu) {
            return;
        }

        const item = this.menu[key];
        if (!item || item.disabled || !item.show) {
            return;
        }

        item.spec.run(this.view.state, this.view.dispatch, this.view, event);
        this.view.focus();
    }

    public upload(file: File): void {
        if (!this.view || !this.imageUploader) {
            return;
        }

        if (this.view.state.selection.$from.parent.inlineContent) {
            this.imagePlugin.startImageUpload(this.view, file, this.imageUploader, this.schema);
        }

        this.view.focus();
    }
}
