import * as upath from 'upath';
import { ResolverFactory } from 'enhanced-resolve';
import { ImporterReturnType } from 'sass';
import fs = require('fs');

/**
 * Invoke enhanced-resolve custom resolver as a Promise.
 * @param lookupStartPath 
 * @param request 
 */
function resolveAsync(customResolver, lookupStartPath: string, request: string): Promise<string> {
    return new Promise<string>((ok, reject) => {
        customResolver.resolve({}, lookupStartPath, request, {}, (error: Error, resolution: string) => {
            if (error) {
                reject(error);
            } else {
                // import resolution can be Windows / non-UNIX path!
                ok(resolution);
            }
        });
    });
}

/**
 * Implements a smarter Sass @import logic,
 * which performs resolution into node_modules and package.json:style!
 * @param source 
 * @param request 
 */
export async function sassImport(source: string, request: string): Promise<string> {
    // https://github.com/ryanelian/instapack/issues/99
    // source               :   "E:/VS/MyProject/client/css/index.scss"
    // request / @import    :   "@ryan/something"

    const lookupStartPath = upath.dirname(source);        // E:/VS/MyProject/client/css/
    const requestFileName = upath.basename(request);      // something
    const requestDir = upath.dirname(request);            // @ryan/

    if (requestFileName.startsWith('_') === false) {
        const partialFolderLookups = [lookupStartPath];
        if (requestDir !== '.') {
            // upath.dirname('test') === '.'
            // upath.dirname('test/') === '.' && upath.basename('test/') === 'test'
            // @import 'test' must not be resolved into /node_modules/_test.scss
            partialFolderLookups.push('node_modules');
        }

        const partialSassResolver = ResolverFactory.createResolver({
            fileSystem: fs,
            extensions: ['.scss'],
            modules: partialFolderLookups,
            mainFiles: [],
            descriptionFiles: []
        });

        const partialFileName = '_' + upath.addExt(requestFileName, '.scss');     // _something.scss
        const partialRequest = upath.join(requestDir, partialFileName);           // @ryan/_something.scss

        // 3: E:/VS/MyProject/client/css/@ryan/_something.scss      (Standard)
        // 8: E:/VS/MyProject/node_modules/@ryan/_something.scss    (Standard+)
        try {
            return await resolveAsync(partialSassResolver, lookupStartPath, partialRequest);
        } catch (ex) {
            // continue module resolution
        }
    }

    const sassResolver = ResolverFactory.createResolver({
        fileSystem: fs,
        extensions: ['.scss'],
        modules: [lookupStartPath, 'node_modules'],
        mainFiles: ['_index', 'index'],
        descriptionFiles: [],
        // mainFields: ['sass']
    });

    // 2: E:/VS/MyProject/client/css/@ryan/something.scss               (Standard)
    // 5: E:/VS/MyProject/client/css/@ryan/something/_index.scss        (Standard https://github.com/sass/sass/issues/690)
    // 5: E:/VS/MyProject/client/css/@ryan/something/index.scss         (Standard https://github.com/sass/sass/issues/690) 
    // 7: E:/VS/MyProject/node_modules/@ryan/something.scss             (Standard+)
    // 7: E:/VS/MyProject/node_modules/@ryan/something/_index.scss      (Standard+)
    // 7: E:/VS/MyProject/node_modules/@ryan/something/index.scss       (Standard+)
    try {
        return await resolveAsync(sassResolver, lookupStartPath, request);
    } catch (ex) {
        // continue module resolution
    }

    const cssResolver = ResolverFactory.createResolver({
        fileSystem: fs,
        extensions: ['.css'],
        modules: [lookupStartPath, 'node_modules'],
        mainFields: ['style']
    });

    // http://sass.logdown.com/posts/7807041-feature-watchcss-imports-and-css-compatibility
    // 4: E:/VS/MyProject/client/css/@ryan/something.css                    (Standard)
    // 6: E:/VS/MyProject/client/css/@ryan/something/index.css              (Standard)
    // 9: E:/VS/MyProject/node_modules/@ryan/something.css                  (Standard+)
    // 9: E:/VS/MyProject/node_modules/@ryan/something/index.css            (Standard+)
    // 10: E:/VS/MyProject/node_modules/@ryan/something/package.json:style  (Custom, Node-like)
    return await resolveAsync(cssResolver, lookupStartPath, request);

    // Standard+: when using node-sass includePaths option set to the node_modules folder. (Older instapack behavior)
}

export function sassImporter(request: string, source: string, done: (data: ImporterReturnType) => void): void {
    sassImport(source, request).then(resolution => {
        // console.log(source, '+', request, '=', resolution); console.log();
        done({
            file: resolution
        });
    }).catch(error => {
        done(error);
    });
}
