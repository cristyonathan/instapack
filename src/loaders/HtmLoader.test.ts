import webpack = require('webpack');
import memoryFS = require('memory-fs');
import * as path from 'path';
import test from 'ava';
import { LoaderPaths } from './LoaderPaths';

const root = process.cwd();
const fixtures = path.join(root, 'fixtures', 'HtmLoader');

async function compileAsync(entry: string): Promise<webpack.Stats> {
    const compiler = webpack({
        context: fixtures,
        entry: [entry],
        output: {
            filename: 'bundle.js',
            path: fixtures
        },
        module: {
            rules: [{
                test: /\.html?$/,
                use: [{
                    loader: LoaderPaths.html
                }]
            }]
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx']
        },
        mode: 'development',
    });

    compiler.outputFileSystem = new memoryFS();

    return await new Promise<webpack.Stats>((ok, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                reject(err);
            }

            ok(stats);
        });
    });
}

test('HTML Loader', async t => {
    const entry = path.join(fixtures, 'index.ts');
    const stats = await compileAsync(entry);

    const o = stats.toJson({
        source: true,
        modules: true
    });
    // console.log(JSON.stringify(o, null, 4));
    if (o.modules) {
        let result = o.modules.filter(Q => Q.name === './test.html')[0].source;
        if (result) {
            result = result.replace(/\r/g, '');
        }
        t.is(result, 'module.exports = "<span> Hello World! </span>"');
    } else {
        t.fail('webpack stats.toJson().modules is undefined!')
    }
});
