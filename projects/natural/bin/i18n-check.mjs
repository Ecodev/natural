#! /usr/bin/env node
// @ts-check

// This script check for errors in HTML and XLF files that may break i18n strings.
// It can be run manually, but ideally it should at least be run as a part of a pre-commit hook.

import {extname, join, resolve} from 'node:path';
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {parse, serializeOuter} from 'parse5';

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

function checkAll(targets) {
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

function allFiles(targets) {
    const files = new Set();

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

function checkHtml(file, content) {
    const document = parse(content);

    return walkAST(document, file);
}

function walkAST(node, file) {
    let errorCount = 0;
    if ('tagName' in node && node.tagName) {
        const element = node;
        const hasI18n = element.attrs.some(attr => attr.name === 'i18n');

        if (hasI18n) {
            let textContent = '';
            for (const child of element.childNodes) {
                if (child.nodeName === '#text') {
                    textContent += child.value;
                }
            }

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
        errorCount += walkAST(node.content, file);
    }

    return errorCount;
}

function checkHtmlError(textContent) {
    if (/^\s|\s$/.test(textContent)) {
        return 'Must not start or finish with whitespace';
    } else if (/^\{\{[^}]*}}$/.test(textContent)) {
        return 'Must not contain only interpolation';
    }

    return '';
}

function checkXlf(file, content) {
    let errorCount = 0;
    const patterns = {
        'XLF must have ICU within <x> elements (not `{{ foo }}`)': /^\s*(?<line>.*[^";]\{\{.*)$/gm,
        'XLF must not have weird characters': /^\s*(?<line>.*(‘|’).*)$/gm,
    };

    for (const [message, r] of Object.entries(patterns)) {
        let result = null;
        while ((result = r.exec(content))) {
            let line = result.groups['line'];
            printError(file, message, line);
            errorCount++;
        }
    }

    return errorCount;
}

function printError(file, errorMessage, content) {
    console.log(`🛑 ${errorMessage}:`);
    console.log(file);
    console.log(`${content}\n`);
}
