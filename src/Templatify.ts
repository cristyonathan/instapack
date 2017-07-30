import * as minifier from 'html-minifier';
import * as through2 from 'through2';
import * as path from 'path';

let minifierOptions = {
    caseSensitive: false,
    collapseBooleanAttributes: true,      // Not default
    collapseInlineTagWhitespace: false,
    collapseWhitespace: true,             // Not default
    conservativeCollapse: true,           // Not default
    decodeEntities: false,
    html5: true,
    includeAutoGeneratedTags: true,
    keepClosingSlash: false,
    minifyCSS: false,
    minifyJS: false,
    minifyURLs: false,
    preserveLineBreaks: false,
    preventAttributesEscaping: false,
    processConditionalComments: false,
    removeAttributeQuotes: false,
    removeComments: true,                 // Not default
    removeEmptyAttributes: false,
    removeEmptyElements: false,
    removeOptionalTags: false,
    removeRedundantAttributes: true,      // Not default
    removeScriptTypeAttributes: true,     // Not default
    removeStyleLinkTypeAttributes: true,  // Not default
    removeTagWhitespace: false,
    sortAttributes: true,                 // Not default
    sortClassName: true,                  // Not default
    trimCustomFragments: false,
    useShortDoctype: false
};

let minifyExt = ['.htm', '.html'];
let templateExt = ['.txt'].concat(minifyExt);

export default function Templatify(file) {
    return through2(function (buffer: Buffer, encoding, next) {

        var ext = path.extname(file).toLowerCase();

        if (templateExt.indexOf(ext) === -1) {
            return next(null, buffer);
        }

        let template = buffer.toString('utf8');

        if (minifyExt.indexOf(ext) !== -1) {
            template = minifier.minify(template, minifierOptions).trim();
        }

        template = 'module.exports = ' + JSON.stringify(template) + ';\n';
        //console.log("Templatify > " + file + "\n" + template);
        return next(null, template);
    });
};
