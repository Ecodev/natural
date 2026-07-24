import {type EditorState, type Transaction} from 'prosemirror-state';
import {type EditorView} from 'prosemirror-view';
import {Item} from './item';
import {type MatDialog} from '@angular/material/dialog';
import {ColorDialogComponent, type ColorDialogData} from '../../color-dialog/color-dialog.component';
import {type MarkType} from 'prosemirror-model';
import {markActive} from './utils';
import {toggleMark} from 'prosemirror-commands';
import {rgbToHex} from '@ecodev/natural';

function findFirstColorInSelection(state: EditorState, markType: MarkType): string {
    const {selection, doc} = state;
    const {from, to} = selection;
    let foundColor = '';

    doc.nodesBetween(from, to, node => {
        if (foundColor) {
            return false;
        }

        const mark = node.marks.find(mark => mark.type === markType);
        if (mark?.attrs.color) {
            foundColor = mark.attrs.color;
        }

        return !foundColor;
    });

    return rgbToHex(foundColor);
}

export class TextColorItem extends Item {
    public constructor(markType: MarkType, dialog: MatDialog) {
        super({
            active(state: EditorState): boolean {
                return markActive(state, markType);
            },
            enable(state: EditorState): boolean {
                return !state.selection.empty;
            },
            run(state: EditorState, dispatch: (p: Transaction) => void, view: EditorView): void {
                dialog
                    .open<ColorDialogComponent, ColorDialogData, ColorDialogData>(ColorDialogComponent, {
                        data: {
                            color: findFirstColorInSelection(state, markType),
                        },
                    })
                    .afterClosed()
                    .subscribe(result => {
                        if (result) {
                            // Remove existing color before applying new one
                            if (markActive(state, markType)) {
                                toggleMark(markType, {}, {})(view.state, view.dispatch);
                            }

                            // Apply new color, unless we selected "transparent"
                            if (result.color) {
                                toggleMark(markType, result, {})(view.state, view.dispatch);
                            }
                        }

                        view.focus();
                    });
            },
        });
    }
}
