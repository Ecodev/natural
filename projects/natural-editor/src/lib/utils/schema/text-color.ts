import {Attrs, MarkSpec} from 'prosemirror-model';

export const textColor: MarkSpec = {
    attrs: {color: {default: '#FF0000'}},
    parseDOM: [
        {
            style: 'color',
            getAttrs: (value: string | HTMLElement): null | Attrs => {
                if (typeof value === 'string') {
                    return {color: value};
                }

                return null;
            },
        },
    ],
    toDOM(mark) {
        return ['span', {style: `color: ${mark.attrs.color}`}, 0];
    },
};
