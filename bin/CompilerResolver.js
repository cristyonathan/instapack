"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fse = require("fs-extra");
const enhanced_resolve_1 = require("enhanced-resolve");
const Shout_1 = require("./Shout");
const chalk_1 = require("chalk");
function resolveAsync(customResolver, lookupStartPath, request) {
    return new Promise((ok, reject) => {
        customResolver.resolve({}, lookupStartPath, request, {}, (error, resolution) => {
            if (error) {
                reject(error);
            }
            else {
                ok(resolution);
            }
        });
    });
}
let vueCompilerResolveCache = {};
function tryGetProjectVueVersion(resolver, projectBasePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let vueJsonPath = yield resolveAsync(resolver, projectBasePath, 'vue/package.json');
            let vueJson = yield fse.readJson(vueJsonPath);
            let vueVersion = vueJson['version'];
            return vueVersion;
        }
        catch (error) {
            return undefined;
        }
    });
}
function tryGetProjectVueCompilerVersion(resolver, projectBasePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let vueCompilerJsonPath = yield resolveAsync(resolver, projectBasePath, 'vue-template-compiler/package.json');
            let vueCompilerJson = yield fse.readJson(vueCompilerJsonPath);
            let vueCompilerVersion = vueCompilerJson['version'];
            return vueCompilerVersion;
        }
        catch (error) {
            return undefined;
        }
    });
}
function resolveVueTemplateCompiler(projectBasePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (vueCompilerResolveCache[projectBasePath]) {
            return vueCompilerResolveCache[projectBasePath];
        }
        let resolver = enhanced_resolve_1.ResolverFactory.createResolver({
            fileSystem: new enhanced_resolve_1.NodeJsInputFileSystem()
        });
        let compilerRoute;
        let instapackVueCompilerVersion = require('vue-template-compiler/package.json')['version'];
        let vueVersion = yield tryGetProjectVueVersion(resolver, projectBasePath);
        try {
            let vueCompilerVersion = yield tryGetProjectVueCompilerVersion(resolver, projectBasePath);
            if (!vueVersion || !vueCompilerVersion) {
                throw new Error('Project Vue / Vue Template Compiler packages are not found.');
            }
            if (vueVersion !== vueCompilerVersion) {
                Shout_1.Shout.warning(`Project vue (${vueVersion}) and vue-template-compiler (${vueCompilerVersion}) version mismatch!`
                    + chalk_1.default.grey(`
Fix the project package.json and make sure to use the same version for both:
    yarn add vue-template-compiler@${vueVersion} -D -E
                        OR
    npm install vue-template-compiler@${vueVersion} -D -E
`));
                Shout_1.Shout.warning('Fallback to instapack default built-in Vue Template Compiler...');
                throw new Error('Project vue and vue-template-compiler version mismatched!');
            }
            let compilerPath = yield resolveAsync(resolver, projectBasePath, 'vue-template-compiler');
            compilerRoute = {
                compiler: require(compilerPath),
                compilerPath: compilerPath
            };
            Shout_1.Shout.timed(chalk_1.default.green('Vue Template Compiler'), 'project custom version:', chalk_1.default.yellow(vueCompilerVersion));
        }
        catch (err) {
            if (vueVersion && vueVersion !== instapackVueCompilerVersion) {
                Shout_1.Shout.warning(`instapack vue-template-compiler (${instapackVueCompilerVersion}) and project vue (${vueVersion}) version mismatch!`
                    + chalk_1.default.grey(`
This may introduce bugs to the application. Please install a custom vue-template-compiler version:
    yarn add vue-template-compiler@${vueVersion} -D -E
                        OR
    npm install vue-template-compiler@${vueVersion} -D -E
`));
            }
            compilerRoute = {
                compiler: require('vue-template-compiler'),
                compilerPath: require.resolve('vue-template-compiler')
            };
        }
        return compilerRoute;
    });
}
exports.resolveVueTemplateCompiler = resolveVueTemplateCompiler;
