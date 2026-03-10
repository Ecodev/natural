#! /usr/bin/env node
// @ts-check

// This script check for errors in HTML files that may break i18n strings

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
        const html = readFileSync(file, 'utf-8');
        const document = parse(html);
        errorCount += walkAST(document, file);
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
                if (entry.isFile() && extname(entry.name) === '.html') {
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

function checkError(textContent) {
    if (/^\s|\s$/.test(textContent)) {
        return 'Must not start or finish with whitespace';
    } else if (/^\{\{[^}]*}}$/.test(textContent)) {
        return 'Must not contain only interpolation';
    }
    return '';
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

            const errorMessage = checkError(textContent);
            if (errorMessage) {
                console.log(`🛑 ${errorMessage}:`);
                console.log(file);
                console.log(`${serializeOuter(element)}\n`);
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
