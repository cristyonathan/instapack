"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const upath = require("upath");
class PathFinder {
    constructor(variables) {
        this.variables = variables;
    }
    get root() {
        return this.variables.root;
    }
    get packageJson() {
        return upath.join(this.root, 'package.json');
    }
    get npmFolder() {
        return upath.join(this.root, 'node_modules');
    }
    get tsConfigJson() {
        return upath.join(this.root, 'tsconfig.json');
    }
    get babelConfiguration() {
        return upath.join(this.root, '.babelrc');
    }
    get inputFolderName() {
        return this.variables.input;
    }
    get inputFolderPath() {
        return upath.join(this.root, this.inputFolderName);
    }
    get jsInputFolder() {
        return upath.join(this.inputFolderPath, 'js');
    }
    get jsEntry() {
        return upath.join(this.jsInputFolder, 'index.ts');
    }
    get cssInputFolder() {
        return upath.join(this.inputFolderPath, 'css');
    }
    get cssEntry() {
        return upath.join(this.cssInputFolder, 'index.scss');
    }
    get scssGlob() {
        return upath.join(this.cssInputFolder, '**', '*.scss');
    }
    get outputFolderName() {
        return this.variables.output;
    }
    get outputFolderPath() {
        return upath.join(this.root, this.outputFolderName);
    }
    get jsOutputFolder() {
        return upath.join(this.outputFolderPath, 'js');
    }
    get jsOutputFileName() {
        return this.variables.jsOut;
    }
    get jsChunkFileName() {
        return upath.removeExt(this.jsOutputFileName, '.js') + '.[name].js';
    }
    get jsOutputFilePath() {
        return upath.join(this.jsOutputFolder, this.jsOutputFileName);
    }
    get statsJsonFilePath() {
        return upath.join(this.jsOutputFolder, 'stats.json');
    }
    get cssOutputFolder() {
        return upath.join(this.outputFolderPath, 'css');
    }
    get cssOutputFileName() {
        return this.variables.cssOut;
    }
    get cssOutputFilePath() {
        return upath.join(this.cssOutputFolder, this.cssOutputFileName);
    }
}
exports.PathFinder = PathFinder;
