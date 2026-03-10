import test from 'node:test';
import assert from 'node:assert/strict';
import {checkHtml, checkXlf} from './i18n-check';

const casesXlf: [string, string][] = [
    [
        `<target>J'ai lu <x equiv-text="&lt;a href=&quot;{{ subscriptionForm.termsUrl }}&quot; target=&quot;_blank&quot;&gt;"/></target>`,
        ``,
    ],
    [`<target><x id="PH" equiv-text="state.quantity"/> semble beaucoup</target>`, ``],
    [`<target>Dans <x id="INTERPOLATION" equiv-text="{{ countdown }}"/>s)</target>`, ``],
    [
        `<target>Einkäufe{{ model.cartId }}</target>`,
        `🛑 XLF must have ICU within <x> elements (not \`{{ foo }}\`):
file
<target>Einkäufe{{ model.cartId }}</target>`,
    ],
    [
        `<target>Einkäufe{{ model.cartId ? ‘ ' : '' }}</target>`,
        `🛑 XLF must have ICU within <x> elements (not \`{{ foo }}\`):
file
<target>Einkäufe{{ model.cartId ? ‘ ' : '' }}</target>

🛑 XLF ICU must not have quotes that break syntax:
file
<target>Einkäufe{{ model.cartId ? ‘ ' : '' }}</target>`,
    ],
];

for (const [input, expected] of casesXlf) {
    test('checkXlf output with: ' + input, testContext => {
        const logMock = testContext.mock.method(console, 'log', () => null);

        checkXlf('file', input);

        const actual = logMock.mock.calls
            .map(call => call.arguments[0])
            .join('\n')
            .trim();
        assert.strictEqual(actual, expected);
    });
}

const casesHtml: [string, string][] = [
    [
        `<p i18n>Cette tâche est issue du service
    <a href="/url">{{
        foo
    }}</a></p>`,
        ``,
    ],
    [
        `<p i18n>Cette tâche est issue du service
    <a href="/url">{{
        foo
    }}</a></p>`,
        ``,
    ],
    [
        `<p i18n>Cette tâche est issue du service
    <a href="/url">
        {{ foo }}
    </a>
</p>
`,
        `🛑 Must not start or finish with whitespace:
file
<p i18n="">Cette tâche est issue du service
    <a href="/url">
        {{ foo }}
    </a>
</p>`,
    ],
    [`<div i18n="">&nbsp;à {{ price }}</div>`, ``],
    [
        `<div i18n=""> à {{ price }}</div>`,
        `🛑 Must not start or finish with whitespace:
file
<div i18n=""> à {{ price }}</div>`,
    ],
];

for (const [input, expected] of casesHtml) {
    test('checkHtml output with: ' + input, testContext => {
        const logMock = testContext.mock.method(console, 'log', () => null);

        checkHtml('file', input);

        const actual = logMock.mock.calls
            .map(call => call.arguments[0])
            .join('\n')
            .trim();
        assert.strictEqual(actual, expected);
    });
}
