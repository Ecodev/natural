import {Node, NodeType, Schema} from 'prosemirror-model';
import {AllSelection, TextSelection, Transaction} from 'prosemirror-state';
import {Item} from './item';

type Alignment = 'left' | 'right' | 'center' | 'justify';

function setTextAlign(tr: Transaction, schema: Schema, alignment: null | Alignment): Transaction {
    const {selection, doc} = tr;
    if (!selection || !doc) {
        return tr;
    }
    const {from, to} = selection;
    const {nodes} = schema;

    const tasks: {
        node: Node;
        pos: number;
        nodeType: NodeType;
    }[] = [];

    alignment = alignment || null;

    const allowedNodeTypes = new Set([
        nodes.paragraph,
        // nodes['blockquote'],
        // nodes['listItem'],
        // nodes['heading'],
    ]);

    doc.nodesBetween(from, to, (node, pos) => {
        const nodeType = node.type;
        const align = node.attrs.align || null;
        if (align !== alignment && allowedNodeTypes.has(nodeType)) {
            tasks.push({
                node,
                pos,
                nodeType,
            });
        }
        return true;
    });

    if (!tasks.length) {
        return tr;
    }

    tasks.forEach(job => {
        const {node, pos, nodeType} = job;
        const newAttrs = {
            ...node.attrs,
            align: alignment ? alignment : null,
        };

        tr = tr.setNodeMarkup(pos, nodeType, newAttrs, node.marks);
    });

    return tr;
}

export class TextAlignItem extends Item {
    public constructor(alignment: Alignment) {
        super({
            active: state => {
                const {selection, doc} = state;
                const {from, to} = selection;
                let keepLooking = true;
                let active = false;
                doc.nodesBetween(from, to, node => {
                    if (keepLooking && node.attrs.align === alignment) {
                        keepLooking = false;
                        active = true;
                    }
                    return keepLooking;
                });

                return active;
            },

            enable: state => {
                const {selection} = state;
                return selection instanceof TextSelection || selection instanceof AllSelection;
            },

            run: (state, dispatch): boolean => {
                const {schema, selection} = state;

                const tr = setTextAlign(state.tr.setSelection(selection), schema, this.active ? null : alignment);
                if (tr.docChanged) {
                    dispatch?.(tr);
                    return true;
                } else {
                    return false;
                }
            },
        });
    }
}
