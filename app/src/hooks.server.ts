import type { Handle } from '@sveltejs/kit';
import { signer, verifier, openDatabase } from '@eligo/server';
import { building, dev } from '$app/environment';
import { minify, type Options as HtmlMinifierOptions } from 'html-minifier';

const minificationOptions: HtmlMinifierOptions = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    decodeEntities: true,
    html5: true,
    ignoreCustomComments: [/^#/],
    minifyCSS: true,
    minifyJS: false,
    removeAttributeQuotes: true,
    removeComments: false, // some hydration code needs comments, so leave them in
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortAttributes: true,
    sortClassName: true
};

let database = building
    ? undefined
    : openDatabase(dev ? 'database.dev.jsonl' : '/data/database.jsonl');

let tokens = building
    ? undefined
    : signer(database!).then((signer) => ({ ...signer, ...verifier(database!) }));

export const handle: Handle = async ({ event, resolve }) => {
    if (!building) {
        event.locals.database = database!;
        event.locals.tokens = await tokens!;
    }

    let page = '';
    return resolve(event, {
        transformPageChunk: ({ html, done }) => {
            page += html;
            if (done) {
                return building ? minify(page, minificationOptions) : page;
            }
            return;
        }
    });
};
