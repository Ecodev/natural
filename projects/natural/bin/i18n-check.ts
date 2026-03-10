#! /usr/bin/env node
// @ts-check
'use strict';

// This script check for errors in HTML and XLF files that may break i18n strings.
// It can be run manually, but ideally it should at least be run as a part of a pre-commit hook.

import {fileURLToPath} from 'node:url';
import {extname, join, resolve} from 'node:path';
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {type DefaultTreeAdapterMap, parse, serializeOuter} from 'parse5';

type Node = DefaultTreeAdapterMap['node'];
type Template = DefaultTreeAdapterMap['template'];
type TextNode = DefaultTreeAdapterMap['textNode'];

// Only run if called directly as a script
const currentFilePath = fileURLToPath(import.meta.url);
if (currentFilePath === process.argv[1]) {
    main();
}

function main(): void {
    const targets = process.argv.slice(2);
    if (!targets.length) {
        console.error('Error: Missing arguments for file or directory path(s).');
        process.exit(1);
    }

    const errorCount = checkAll(targets);
    if (errorCount) {
        console.error(`${errorCount} i18n errors found !`);
        process.exit(1);
    }
}

function checkAll(targets: string[]): number {
    let errorCount = 0;
    const files = allFiles(targets);

    for (const file of files) {
        const content = readFileSync(file, 'utf-8');

        if (file.endsWith('.html')) {
            errorCount += checkHtml(file, content);
        } else {
            errorCount += checkXlf(file, content);
        }
    }

    return errorCount;
}

function allFiles(targets: string[]): string[] {
    const files = new Set<string>();

    for (const target of targets) {
        const path = resolve(target);
        const targetStat = statSync(path);

        if (targetStat.isDirectory()) {
            const entries = readdirSync(target, {recursive: true, withFileTypes: true});
            for (const entry of entries) {
                if (entry.isFile() && ['.html', '.xlf'].includes(extname(entry.name))) {
                    files.add(resolve(join(entry.parentPath, entry.name)));
                }
            }
        } else {
            files.add(path);
        }
    }

    // unique
    return [...files.values()];
}

export function checkHtml(file: string, content: string): number {
    const document = parse(content);

    return walkAST(document, file);
}

function walkAST(node: Node, file: string): number {
    let errorCount = 0;
    if ('tagName' in node && node.tagName) {
        const element = node;
        const hasI18n = element.attrs.some(attr => attr.name === 'i18n');

        if (hasI18n) {
            const textContent = getTextContent(element);

            const errorMessage = checkHtmlError(textContent);
            if (errorMessage) {
                printError(file, errorMessage, serializeOuter(element));
                errorCount++;
            }
        }
    }

    if ('childNodes' in node && node.childNodes) {
        for (const child of node.childNodes) {
            errorCount += walkAST(child, file);
        }
    }

    if (node.nodeName === 'template') {
        errorCount += walkAST((node as Template).content, file);
    }

    return errorCount;
}

function getTextContent(node: Node): string {
    let textContent = '';
    if (!('childNodes' in node)) {
        return textContent;
    }

    for (const child of node.childNodes || []) {
        if (child.nodeName === '#text') {
            textContent += (child as TextNode).value;
        } else {
            textContent += getTextContent(child);
        }
    }

    return textContent;
}

export function checkHtmlError(textContent: string): string {
    const nbsp = '\xa0';

    textContent = textContent.replaceAll(nbsp, '&nbsp;');

    if (/^\s|\s$/.test(textContent)) {
        return 'Must not start or finish with whitespace';
    } else if (/^\{\{[^}]*}}$/.test(textContent)) {
        return 'Must not contain only interpolation';
    }

    return '';
}

export function checkXlf(file: string, content: string): number {
    let errorCount = 0;
    const patterns = {
        'XLF must have ICU within <x> elements (not `{{ foo }}`)': /^\s*(?<line>.*[^";]\{\{.*)$/gm,
        'XLF ICU must not have quotes that break syntax': /^\s*(?<line>.*\{\{[^}]*(‘|’)[^}]*}}.*)$/gm,
    };

    for (const [message, r] of Object.entries(patterns)) {
        let result = null;
        while ((result = r.exec(content))) {
            const line = result.groups?.line ?? '';
            printError(file, message, line);
            errorCount++;
        }
    }

    return errorCount;
}

function printError(file: string, errorMessage: string, content: string): void {
    console.log(`🛑 ${errorMessage}:`);
    console.log(file);
    console.log(`${content}\n`);
}
