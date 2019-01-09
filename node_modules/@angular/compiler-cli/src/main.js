#!/usr/bin/env node
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/main", ["require", "exports", "tslib", "reflect-metadata", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/transformers/util", "@angular/compiler-cli/src/perform_compile", "@angular/compiler-cli/src/perform_watch"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    require("reflect-metadata");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var api = require("@angular/compiler-cli/src/transformers/api");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    var perform_compile_1 = require("@angular/compiler-cli/src/perform_compile");
    var perform_watch_1 = require("@angular/compiler-cli/src/perform_watch");
    function main(args, consoleError, config, customTransformers) {
        if (consoleError === void 0) { consoleError = console.error; }
        var _a = config || readNgcCommandLineAndConfiguration(args), project = _a.project, rootNames = _a.rootNames, options = _a.options, configErrors = _a.errors, watch = _a.watch, emitFlags = _a.emitFlags;
        if (configErrors.length) {
            return reportErrorsAndExit(configErrors, /*options*/ undefined, consoleError);
        }
        if (watch) {
            var result = watchMode(project, options, consoleError);
            return reportErrorsAndExit(result.firstCompileResult, options, consoleError);
        }
        var compileDiags = perform_compile_1.performCompilation({
            rootNames: rootNames,
            options: options,
            emitFlags: emitFlags,
            emitCallback: createEmitCallback(options), customTransformers: customTransformers
        }).diagnostics;
        return reportErrorsAndExit(compileDiags, options, consoleError);
    }
    exports.main = main;
    function mainDiagnosticsForTest(args, config) {
        var _a = config || readNgcCommandLineAndConfiguration(args), project = _a.project, rootNames = _a.rootNames, options = _a.options, configErrors = _a.errors, watch = _a.watch, emitFlags = _a.emitFlags;
        if (configErrors.length) {
            return configErrors;
        }
        var compileDiags = perform_compile_1.performCompilation({ rootNames: rootNames, options: options, emitFlags: emitFlags, emitCallback: createEmitCallback(options) }).diagnostics;
        return compileDiags;
    }
    exports.mainDiagnosticsForTest = mainDiagnosticsForTest;
    function createEmitCallback(options) {
        var transformDecorators = options.enableIvy !== 'ngtsc' && options.enableIvy !== 'tsc' &&
            options.annotationsAs !== 'decorators';
        var transformTypesToClosure = options.annotateForClosureCompiler;
        if (!transformDecorators && !transformTypesToClosure) {
            return undefined;
        }
        if (transformDecorators) {
            // This is needed as a workaround for https://github.com/angular/tsickle/issues/635
            // Otherwise tsickle might emit references to non imported values
            // as TypeScript elided the import.
            options.emitDecoratorMetadata = true;
        }
        var tsickleHost = {
            shouldSkipTsickleProcessing: function (fileName) {
                return /\.d\.ts$/.test(fileName) || util_1.GENERATED_FILES.test(fileName);
            },
            pathToModuleName: function (context, importPath) { return ''; },
            shouldIgnoreWarningsForPath: function (filePath) { return false; },
            fileNameToModuleId: function (fileName) { return fileName; },
            googmodule: false,
            untyped: true,
            convertIndexImportShorthand: false, transformDecorators: transformDecorators, transformTypesToClosure: transformTypesToClosure,
        };
        if (options.annotateForClosureCompiler || options.annotationsAs === 'static fields') {
            return function (_a) {
                var program = _a.program, targetSourceFile = _a.targetSourceFile, writeFile = _a.writeFile, cancellationToken = _a.cancellationToken, emitOnlyDtsFiles = _a.emitOnlyDtsFiles, _b = _a.customTransformers, customTransformers = _b === void 0 ? {} : _b, host = _a.host, options = _a.options;
                // tslint:disable-next-line:no-require-imports only depend on tsickle if requested
                return require('tsickle').emitWithTsickle(program, tslib_1.__assign({}, tsickleHost, { options: options, host: host }), host, options, targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, {
                    beforeTs: customTransformers.before,
                    afterTs: customTransformers.after,
                });
            };
        }
        else {
            return function (_a) {
                var program = _a.program, targetSourceFile = _a.targetSourceFile, writeFile = _a.writeFile, cancellationToken = _a.cancellationToken, emitOnlyDtsFiles = _a.emitOnlyDtsFiles, _b = _a.customTransformers, customTransformers = _b === void 0 ? {} : _b;
                return program.emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, { after: customTransformers.after, before: customTransformers.before });
            };
        }
    }
    function readNgcCommandLineAndConfiguration(args) {
        var options = {};
        var parsedArgs = require('minimist')(args);
        if (parsedArgs.i18nFile)
            options.i18nInFile = parsedArgs.i18nFile;
        if (parsedArgs.i18nFormat)
            options.i18nInFormat = parsedArgs.i18nFormat;
        if (parsedArgs.locale)
            options.i18nInLocale = parsedArgs.locale;
        var mt = parsedArgs.missingTranslation;
        if (mt === 'error' || mt === 'warning' || mt === 'ignore') {
            options.i18nInMissingTranslations = mt;
        }
        var config = readCommandLineAndConfiguration(args, options, ['i18nFile', 'i18nFormat', 'locale', 'missingTranslation', 'watch']);
        var watch = parsedArgs.w || parsedArgs.watch;
        return tslib_1.__assign({}, config, { watch: watch });
    }
    function readCommandLineAndConfiguration(args, existingOptions, ngCmdLineOptions) {
        if (existingOptions === void 0) { existingOptions = {}; }
        if (ngCmdLineOptions === void 0) { ngCmdLineOptions = []; }
        var cmdConfig = ts.parseCommandLine(args);
        var project = cmdConfig.options.project || '.';
        var cmdErrors = cmdConfig.errors.filter(function (e) {
            if (typeof e.messageText === 'string') {
                var msg_1 = e.messageText;
                return !ngCmdLineOptions.some(function (o) { return msg_1.indexOf(o) >= 0; });
            }
            return true;
        });
        if (cmdErrors.length) {
            return {
                project: project,
                rootNames: [],
                options: cmdConfig.options,
                errors: cmdErrors,
                emitFlags: api.EmitFlags.Default
            };
        }
        var allDiagnostics = [];
        var config = perform_compile_1.readConfiguration(project, cmdConfig.options);
        var options = tslib_1.__assign({}, config.options, existingOptions);
        if (options.locale) {
            options.i18nInLocale = options.locale;
        }
        return {
            project: project,
            rootNames: config.rootNames, options: options,
            errors: config.errors,
            emitFlags: config.emitFlags
        };
    }
    exports.readCommandLineAndConfiguration = readCommandLineAndConfiguration;
    function reportErrorsAndExit(allDiagnostics, options, consoleError) {
        if (consoleError === void 0) { consoleError = console.error; }
        var errorsAndWarnings = perform_compile_1.filterErrorsAndWarnings(allDiagnostics);
        if (errorsAndWarnings.length) {
            var currentDir_1 = options ? options.basePath : undefined;
            var formatHost = {
                getCurrentDirectory: function () { return currentDir_1 || ts.sys.getCurrentDirectory(); },
                getCanonicalFileName: function (fileName) { return fileName; },
                getNewLine: function () { return ts.sys.newLine; }
            };
            if (options && (options.enableIvy === true || options.enableIvy === 'ngtsc')) {
                var ngDiagnostics = errorsAndWarnings.filter(api.isNgDiagnostic);
                var tsDiagnostics = errorsAndWarnings.filter(api.isTsDiagnostic);
                consoleError(diagnostics_1.replaceTsWithNgInErrors(ts.formatDiagnosticsWithColorAndContext(tsDiagnostics, formatHost)));
                consoleError(perform_compile_1.formatDiagnostics(ngDiagnostics, formatHost));
            }
            else {
                consoleError(perform_compile_1.formatDiagnostics(errorsAndWarnings, formatHost));
            }
        }
        return perform_compile_1.exitCodeFromResult(allDiagnostics);
    }
    function watchMode(project, options, consoleError) {
        return perform_watch_1.performWatchCompilation(perform_watch_1.createPerformWatchHost(project, function (diagnostics) {
            consoleError(perform_compile_1.formatDiagnostics(diagnostics));
        }, options, function (options) { return createEmitCallback(options); }));
    }
    exports.watchMode = watchMode;
    // CLI entry point
    if (require.main === module) {
        var args = process.argv.slice(2);
        process.exitCode = main(args);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBVUEsNEJBQTBCO0lBRTFCLCtCQUFpQztJQUdqQywyRUFBNEQ7SUFDNUQsZ0VBQTBDO0lBQzFDLG9FQUFvRDtJQUVwRCw2RUFBb007SUFDcE0seUVBQWdGO0lBRWhGLFNBQWdCLElBQUksQ0FDaEIsSUFBYyxFQUFFLFlBQWlELEVBQ2pFLE1BQStCLEVBQUUsa0JBQTJDO1FBRDVELDZCQUFBLEVBQUEsZUFBb0MsT0FBTyxDQUFDLEtBQUs7UUFFL0QsSUFBQSx1REFDa0QsRUFEakQsb0JBQU8sRUFBRSx3QkFBUyxFQUFFLG9CQUFPLEVBQUUsd0JBQW9CLEVBQUUsZ0JBQUssRUFBRSx3QkFDVCxDQUFDO1FBQ3ZELElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTtZQUN2QixPQUFPLG1CQUFtQixDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQy9FO1FBQ0QsSUFBSSxLQUFLLEVBQUU7WUFDVCxJQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztZQUN6RCxPQUFPLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDOUU7UUFDTSxJQUFBOzs7OztzQkFBeUIsQ0FLN0I7UUFDSCxPQUFPLG1CQUFtQixDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQW5CRCxvQkFtQkM7SUFFRCxTQUFnQixzQkFBc0IsQ0FDbEMsSUFBYyxFQUFFLE1BQStCO1FBQzdDLElBQUEsdURBQ2tELEVBRGpELG9CQUFPLEVBQUUsd0JBQVMsRUFBRSxvQkFBTyxFQUFFLHdCQUFvQixFQUFF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b0NBQWtCLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELFNBQWdCLFNBQVMsQ0FDckIsT0FBZSxFQUFFLE9BQTRCLEVBQUUsWUFBaUM7UUFDbEYsT0FBTyx1Q0FBdUIsQ0FBQyxzQ0FBc0IsQ0FBQyxPQUFPLEVBQUUsVUFBQSxXQUFXO1lBQ3hFLFlBQVksQ0FBQyxtQ0FBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQy9DLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQSxPQUFPLElBQUksT0FBQSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsRUFBM0IsQ0FBMkIsQ0FBQyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUxELDhCQUtDO0lBRUQsa0JBQWtCO0lBQ2xCLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDM0IsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsT0FBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDL0IiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIE11c3QgYmUgaW1wb3J0ZWQgZmlyc3QsIGJlY2F1c2UgQW5ndWxhciBkZWNvcmF0b3JzIHRocm93IG9uIGxvYWQuXG5pbXBvcnQgJ3JlZmxlY3QtbWV0YWRhdGEnO1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCAqIGFzIHRzaWNrbGUgZnJvbSAndHNpY2tsZSc7XG5cbmltcG9ydCB7cmVwbGFjZVRzV2l0aE5nSW5FcnJvcnN9IGZyb20gJy4vbmd0c2MvZGlhZ25vc3RpY3MnO1xuaW1wb3J0ICogYXMgYXBpIGZyb20gJy4vdHJhbnNmb3JtZXJzL2FwaSc7XG5pbXBvcnQge0dFTkVSQVRFRF9GSUxFU30gZnJvbSAnLi90cmFuc2Zvcm1lcnMvdXRpbCc7XG5cbmltcG9ydCB7ZXhpdENvZGVGcm9tUmVzdWx0LCBwZXJmb3JtQ29tcGlsYXRpb24sIHJlYWRDb25maWd1cmF0aW9uLCBmb3JtYXREaWFnbm9zdGljcywgRGlhZ25vc3RpY3MsIFBhcnNlZENvbmZpZ3VyYXRpb24sIFBlcmZvcm1Db21waWxhdGlvblJlc3VsdCwgZmlsdGVyRXJyb3JzQW5kV2FybmluZ3N9IGZyb20gJy4vcGVyZm9ybV9jb21waWxlJztcbmltcG9ydCB7cGVyZm9ybVdhdGNoQ29tcGlsYXRpb24swqBjcmVhdGVQZXJmb3JtV2F0Y2hIb3N0fSBmcm9tICcuL3BlcmZvcm1fd2F0Y2gnO1xuXG5leHBvcnQgZnVuY3Rpb24gbWFpbihcbiAgICBhcmdzOiBzdHJpbmdbXSwgY29uc29sZUVycm9yOiAoczogc3RyaW5nKSA9PiB2b2lkID0gY29uc29sZS5lcnJvcixcbiAgICBjb25maWc/OiBOZ2NQYXJzZWRDb25maWd1cmF0aW9uLCBjdXN0b21UcmFuc2Zvcm1lcnM/OiBhcGkuQ3VzdG9tVHJhbnNmb3JtZXJzKTogbnVtYmVyIHtcbiAgbGV0IHtwcm9qZWN0LCByb290TmFtZXMsIG9wdGlvbnMsIGVycm9yczogY29uZmlnRXJyb3JzLCB3YXRjaCwgZW1pdEZsYWdzfSA9XG4gICAgICBjb25maWcgfHwgcmVhZE5nY0NvbW1hbmRMaW5lQW5kQ29uZmlndXJhdGlvbihhcmdzKTtcbiAgaWYgKGNvbmZpZ0Vycm9ycy5sZW5ndGgpIHtcbiAgICByZXR1cm4gcmVwb3J0RXJyb3JzQW5kRXhpdChjb25maWdFcnJvcnMsIC8qb3B0aW9ucyovIHVuZGVmaW5lZCwgY29uc29sZUVycm9yKTtcbiAgfVxuICBpZiAod2F0Y2gpIHtcbiAgICBjb25zdCByZXN1bHQgPSB3YXRjaE1vZGUocHJvamVjdCwgb3B0aW9ucywgY29uc29sZUVycm9yKTtcbiAgICByZXR1cm4gcmVwb3J0RXJyb3JzQW5kRXhpdChyZXN1bHQuZmlyc3RDb21waWxlUmVzdWx0LCBvcHRpb25zLCBjb25zb2xlRXJyb3IpO1xuICB9XG4gIGNvbnN0IHtkaWFnbm9zdGljczogY29tcGlsZURpYWdzfSA9IHBlcmZvcm1Db21waWxhdGlvbih7XG4gICAgcm9vdE5hbWVzLFxuICAgIG9wdGlvbnMsXG4gICAgZW1pdEZsYWdzLFxuICAgIGVtaXRDYWxsYmFjazogY3JlYXRlRW1pdENhbGxiYWNrKG9wdGlvbnMpLCBjdXN0b21UcmFuc2Zvcm1lcnNcbiAgfSk7XG4gIHJldHVybiByZXBvcnRFcnJvcnNBbmRFeGl0KGNvbXBpbGVEaWFncywgb3B0aW9ucywgY29uc29sZUVycm9yKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW5EaWFnbm9zdGljc0ZvclRlc3QoXG4gICAgYXJnczogc3RyaW5nW10sIGNvbmZpZz86IE5nY1BhcnNlZENvbmZpZ3VyYXRpb24pOiBSZWFkb25seUFycmF5PHRzLkRpYWdub3N0aWN8YXBpLkRpYWdub3N0aWM+IHtcbiAgbGV0IHtwcm9qZWN0LCByb290TmFtZXMsIG9wdGlvbnMsIGVycm9yczogY29uZmlnRXJyb3JzLCB3YXRjaCwgZW1pdEZsYWdzfSA9XG4gICAgICBjb25maWcgfHwgcmVhZE5nY0NvbW1hbmRMaW5lQW5kQ29uZmlndXJhdGlvbihhcmdzKTtcbiAgaWYgKGNvbmZpZ0Vycm9ycy5sZW5ndGgpIHtcbiAgICByZXR1cm4gY29uZmlnRXJyb3JzO1xuICB9XG4gIGNvbnN0IHtkaWFnbm9zdGljczogY29tcGlsZURpYWdzfSA9IHBlcmZvcm1Db21waWxhdGlvbihcbiAgICAgIHtyb290TmFtZXMsIG9wdGlvbnMsIGVtaXRGbGFncywgZW1pdENhbGxiYWNrOiBjcmVhdGVFbWl0Q2FsbGJhY2sob3B0aW9ucyl9KTtcbiAgcmV0dXJuIGNvbXBpbGVEaWFncztcbn1cblxuZnVuY3Rpb24gY3JlYXRlRW1pdENhbGxiYWNrKG9wdGlvbnM6IGFwaS5Db21waWxlck9wdGlvbnMpOiBhcGkuVHNFbWl0Q2FsbGJhY2t8dW5kZWZpbmVkIHtcbiAgY29uc3QgdHJhbnNmb3JtRGVjb3JhdG9ycyA9IG9wdGlvbnMuZW5hYmxlSXZ5ICE9PSAnbmd0c2MnICYmIG9wdGlvbnMuZW5hYmxlSXZ5ICE9PSAndHNjJyAmJlxuICAgICAgb3B0aW9ucy5hbm5vdGF0aW9uc0FzICE9PSAnZGVjb3JhdG9ycyc7XG4gIGNvbnN0IHRyYW5zZm9ybVR5cGVzVG9DbG9zdXJlID0gb3B0aW9ucy5hbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlcjtcbiAgaWYgKCF0cmFuc2Zvcm1EZWNvcmF0b3JzICYmICF0cmFuc2Zvcm1UeXBlc1RvQ2xvc3VyZSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgaWYgKHRyYW5zZm9ybURlY29yYXRvcnMpIHtcbiAgICAvLyBUaGlzIGlzIG5lZWRlZCBhcyBhIHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL3RzaWNrbGUvaXNzdWVzLzYzNVxuICAgIC8vIE90aGVyd2lzZSB0c2lja2xlIG1pZ2h0IGVtaXQgcmVmZXJlbmNlcyB0byBub24gaW1wb3J0ZWQgdmFsdWVzXG4gICAgLy8gYXMgVHlwZVNjcmlwdCBlbGlkZWQgdGhlIGltcG9ydC5cbiAgICBvcHRpb25zLmVtaXREZWNvcmF0b3JNZXRhZGF0YSA9IHRydWU7XG4gIH1cbiAgY29uc3QgdHNpY2tsZUhvc3Q6IFBpY2s8XG4gICAgICB0c2lja2xlLlRzaWNrbGVIb3N0LCAnc2hvdWxkU2tpcFRzaWNrbGVQcm9jZXNzaW5nJ3wncGF0aFRvTW9kdWxlTmFtZSd8XG4gICAgICAnc2hvdWxkSWdub3JlV2FybmluZ3NGb3JQYXRoJ3wnZmlsZU5hbWVUb01vZHVsZUlkJ3wnZ29vZ21vZHVsZSd8J3VudHlwZWQnfFxuICAgICAgJ2NvbnZlcnRJbmRleEltcG9ydFNob3J0aGFuZCd8J3RyYW5zZm9ybURlY29yYXRvcnMnfCd0cmFuc2Zvcm1UeXBlc1RvQ2xvc3VyZSc+ID0ge1xuICAgIHNob3VsZFNraXBUc2lja2xlUHJvY2Vzc2luZzogKGZpbGVOYW1lKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC9cXC5kXFwudHMkLy50ZXN0KGZpbGVOYW1lKSB8fCBHRU5FUkFURURfRklMRVMudGVzdChmaWxlTmFtZSksXG4gICAgcGF0aFRvTW9kdWxlTmFtZTogKGNvbnRleHQsIGltcG9ydFBhdGgpID0+ICcnLFxuICAgIHNob3VsZElnbm9yZVdhcm5pbmdzRm9yUGF0aDogKGZpbGVQYXRoKSA9PiBmYWxzZSxcbiAgICBmaWxlTmFtZVRvTW9kdWxlSWQ6IChmaWxlTmFtZSkgPT4gZmlsZU5hbWUsXG4gICAgZ29vZ21vZHVsZTogZmFsc2UsXG4gICAgdW50eXBlZDogdHJ1ZSxcbiAgICBjb252ZXJ0SW5kZXhJbXBvcnRTaG9ydGhhbmQ6IGZhbHNlLCB0cmFuc2Zvcm1EZWNvcmF0b3JzLCB0cmFuc2Zvcm1UeXBlc1RvQ2xvc3VyZSxcbiAgfTtcblxuICBpZiAob3B0aW9ucy5hbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlciB8fCBvcHRpb25zLmFubm90YXRpb25zQXMgPT09ICdzdGF0aWMgZmllbGRzJykge1xuICAgIHJldHVybiAoe1xuICAgICAgICAgICAgIHByb2dyYW0sXG4gICAgICAgICAgICAgdGFyZ2V0U291cmNlRmlsZSxcbiAgICAgICAgICAgICB3cml0ZUZpbGUsXG4gICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgICAgICAgICAgZW1pdE9ubHlEdHNGaWxlcyxcbiAgICAgICAgICAgICBjdXN0b21UcmFuc2Zvcm1lcnMgPSB7fSxcbiAgICAgICAgICAgICBob3N0LFxuICAgICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgICAgfSkgPT5cbiAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1yZXF1aXJlLWltcG9ydHMgb25seSBkZXBlbmQgb24gdHNpY2tsZSBpZiByZXF1ZXN0ZWRcbiAgICAgICAgcmVxdWlyZSgndHNpY2tsZScpLmVtaXRXaXRoVHNpY2tsZShcbiAgICAgICAgICAgIHByb2dyYW0sIHsuLi50c2lja2xlSG9zdCwgb3B0aW9ucywgaG9zdH0sIGhvc3QsIG9wdGlvbnMsIHRhcmdldFNvdXJjZUZpbGUsIHdyaXRlRmlsZSxcbiAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuLCBlbWl0T25seUR0c0ZpbGVzLCB7XG4gICAgICAgICAgICAgIGJlZm9yZVRzOiBjdXN0b21UcmFuc2Zvcm1lcnMuYmVmb3JlLFxuICAgICAgICAgICAgICBhZnRlclRzOiBjdXN0b21UcmFuc2Zvcm1lcnMuYWZ0ZXIsXG4gICAgICAgICAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKHtcbiAgICAgICAgICAgICBwcm9ncmFtLFxuICAgICAgICAgICAgIHRhcmdldFNvdXJjZUZpbGUsXG4gICAgICAgICAgICAgd3JpdGVGaWxlLFxuICAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuLFxuICAgICAgICAgICAgIGVtaXRPbmx5RHRzRmlsZXMsXG4gICAgICAgICAgICAgY3VzdG9tVHJhbnNmb3JtZXJzID0ge30sXG4gICAgICAgICAgIH0pID0+XG4gICAgICAgICAgICAgICBwcm9ncmFtLmVtaXQoXG4gICAgICAgICAgICAgICAgICAgdGFyZ2V0U291cmNlRmlsZSwgd3JpdGVGaWxlLCBjYW5jZWxsYXRpb25Ub2tlbiwgZW1pdE9ubHlEdHNGaWxlcyxcbiAgICAgICAgICAgICAgICAgICB7YWZ0ZXI6IGN1c3RvbVRyYW5zZm9ybWVycy5hZnRlciwgYmVmb3JlOiBjdXN0b21UcmFuc2Zvcm1lcnMuYmVmb3JlfSk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBOZ2NQYXJzZWRDb25maWd1cmF0aW9uIGV4dGVuZHMgUGFyc2VkQ29uZmlndXJhdGlvbiB7IHdhdGNoPzogYm9vbGVhbjsgfVxuXG5mdW5jdGlvbiByZWFkTmdjQ29tbWFuZExpbmVBbmRDb25maWd1cmF0aW9uKGFyZ3M6IHN0cmluZ1tdKTogTmdjUGFyc2VkQ29uZmlndXJhdGlvbiB7XG4gIGNvbnN0IG9wdGlvbnM6IGFwaS5Db21waWxlck9wdGlvbnMgPSB7fTtcbiAgY29uc3QgcGFyc2VkQXJncyA9IHJlcXVpcmUoJ21pbmltaXN0JykoYXJncyk7XG4gIGlmIChwYXJzZWRBcmdzLmkxOG5GaWxlKSBvcHRpb25zLmkxOG5JbkZpbGUgPSBwYXJzZWRBcmdzLmkxOG5GaWxlO1xuICBpZiAocGFyc2VkQXJncy5pMThuRm9ybWF0KSBvcHRpb25zLmkxOG5JbkZvcm1hdCA9IHBhcnNlZEFyZ3MuaTE4bkZvcm1hdDtcbiAgaWYgKHBhcnNlZEFyZ3MubG9jYWxlKSBvcHRpb25zLmkxOG5JbkxvY2FsZSA9IHBhcnNlZEFyZ3MubG9jYWxlO1xuICBjb25zdCBtdCA9IHBhcnNlZEFyZ3MubWlzc2luZ1RyYW5zbGF0aW9uO1xuICBpZiAobXQgPT09ICdlcnJvcicgfHwgbXQgPT09ICd3YXJuaW5nJyB8fCBtdCA9PT0gJ2lnbm9yZScpIHtcbiAgICBvcHRpb25zLmkxOG5Jbk1pc3NpbmdUcmFuc2xhdGlvbnMgPSBtdDtcbiAgfVxuICBjb25zdCBjb25maWcgPSByZWFkQ29tbWFuZExpbmVBbmRDb25maWd1cmF0aW9uKFxuICAgICAgYXJncywgb3B0aW9ucywgWydpMThuRmlsZScsICdpMThuRm9ybWF0JywgJ2xvY2FsZScsICdtaXNzaW5nVHJhbnNsYXRpb24nLCAnd2F0Y2gnXSk7XG4gIGNvbnN0IHdhdGNoID0gcGFyc2VkQXJncy53IHx8IHBhcnNlZEFyZ3Mud2F0Y2g7XG4gIHJldHVybiB7Li4uY29uZmlnLCB3YXRjaH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQ29tbWFuZExpbmVBbmRDb25maWd1cmF0aW9uKFxuICAgIGFyZ3M6IHN0cmluZ1tdLCBleGlzdGluZ09wdGlvbnM6IGFwaS5Db21waWxlck9wdGlvbnMgPSB7fSxcbiAgICBuZ0NtZExpbmVPcHRpb25zOiBzdHJpbmdbXSA9IFtdKTogUGFyc2VkQ29uZmlndXJhdGlvbiB7XG4gIGxldCBjbWRDb25maWcgPSB0cy5wYXJzZUNvbW1hbmRMaW5lKGFyZ3MpO1xuICBjb25zdCBwcm9qZWN0ID0gY21kQ29uZmlnLm9wdGlvbnMucHJvamVjdCB8fCAnLic7XG4gIGNvbnN0IGNtZEVycm9ycyA9IGNtZENvbmZpZy5lcnJvcnMuZmlsdGVyKGUgPT4ge1xuICAgIGlmICh0eXBlb2YgZS5tZXNzYWdlVGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IG1zZyA9IGUubWVzc2FnZVRleHQ7XG4gICAgICByZXR1cm4gIW5nQ21kTGluZU9wdGlvbnMuc29tZShvID0+IG1zZy5pbmRleE9mKG8pID49IDApO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG4gIGlmIChjbWRFcnJvcnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb2plY3QsXG4gICAgICByb290TmFtZXM6IFtdLFxuICAgICAgb3B0aW9uczogY21kQ29uZmlnLm9wdGlvbnMsXG4gICAgICBlcnJvcnM6IGNtZEVycm9ycyxcbiAgICAgIGVtaXRGbGFnczogYXBpLkVtaXRGbGFncy5EZWZhdWx0XG4gICAgfTtcbiAgfVxuICBjb25zdCBhbGxEaWFnbm9zdGljczogRGlhZ25vc3RpY3MgPSBbXTtcbiAgY29uc3QgY29uZmlnID0gcmVhZENvbmZpZ3VyYXRpb24ocHJvamVjdCwgY21kQ29uZmlnLm9wdGlvbnMpO1xuICBjb25zdCBvcHRpb25zID0gey4uLmNvbmZpZy5vcHRpb25zLCAuLi5leGlzdGluZ09wdGlvbnN9O1xuICBpZiAob3B0aW9ucy5sb2NhbGUpIHtcbiAgICBvcHRpb25zLmkxOG5JbkxvY2FsZSA9IG9wdGlvbnMubG9jYWxlO1xuICB9XG4gIHJldHVybiB7XG4gICAgcHJvamVjdCxcbiAgICByb290TmFtZXM6IGNvbmZpZy5yb290TmFtZXMsIG9wdGlvbnMsXG4gICAgZXJyb3JzOiBjb25maWcuZXJyb3JzLFxuICAgIGVtaXRGbGFnczogY29uZmlnLmVtaXRGbGFnc1xuICB9O1xufVxuXG5mdW5jdGlvbiByZXBvcnRFcnJvcnNBbmRFeGl0KFxuICAgIGFsbERpYWdub3N0aWNzOiBEaWFnbm9zdGljcywgb3B0aW9ucz86IGFwaS5Db21waWxlck9wdGlvbnMsXG4gICAgY29uc29sZUVycm9yOiAoczogc3RyaW5nKSA9PiB2b2lkID0gY29uc29sZS5lcnJvcik6IG51bWJlciB7XG4gIGNvbnN0IGVycm9yc0FuZFdhcm5pbmdzID0gZmlsdGVyRXJyb3JzQW5kV2FybmluZ3MoYWxsRGlhZ25vc3RpY3MpO1xuICBpZiAoZXJyb3JzQW5kV2FybmluZ3MubGVuZ3RoKSB7XG4gICAgbGV0IGN1cnJlbnREaXIgPSBvcHRpb25zID8gb3B0aW9ucy5iYXNlUGF0aCA6IHVuZGVmaW5lZDtcbiAgICBjb25zdCBmb3JtYXRIb3N0OiB0cy5Gb3JtYXREaWFnbm9zdGljc0hvc3QgPSB7XG4gICAgICBnZXRDdXJyZW50RGlyZWN0b3J5OiAoKSA9PiBjdXJyZW50RGlyIHx8IHRzLnN5cy5nZXRDdXJyZW50RGlyZWN0b3J5KCksXG4gICAgICBnZXRDYW5vbmljYWxGaWxlTmFtZTogZmlsZU5hbWUgPT4gZmlsZU5hbWUsXG4gICAgICBnZXROZXdMaW5lOiAoKSA9PiB0cy5zeXMubmV3TGluZVxuICAgIH07XG4gICAgaWYgKG9wdGlvbnMgJiYgKG9wdGlvbnMuZW5hYmxlSXZ5ID09PSB0cnVlIHx8IG9wdGlvbnMuZW5hYmxlSXZ5ID09PSAnbmd0c2MnKSkge1xuICAgICAgY29uc3QgbmdEaWFnbm9zdGljcyA9IGVycm9yc0FuZFdhcm5pbmdzLmZpbHRlcihhcGkuaXNOZ0RpYWdub3N0aWMpO1xuICAgICAgY29uc3QgdHNEaWFnbm9zdGljcyA9IGVycm9yc0FuZFdhcm5pbmdzLmZpbHRlcihhcGkuaXNUc0RpYWdub3N0aWMpO1xuICAgICAgY29uc29sZUVycm9yKHJlcGxhY2VUc1dpdGhOZ0luRXJyb3JzKFxuICAgICAgICAgIHRzLmZvcm1hdERpYWdub3N0aWNzV2l0aENvbG9yQW5kQ29udGV4dCh0c0RpYWdub3N0aWNzLCBmb3JtYXRIb3N0KSkpO1xuICAgICAgY29uc29sZUVycm9yKGZvcm1hdERpYWdub3N0aWNzKG5nRGlhZ25vc3RpY3MsIGZvcm1hdEhvc3QpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZUVycm9yKGZvcm1hdERpYWdub3N0aWNzKGVycm9yc0FuZFdhcm5pbmdzLCBmb3JtYXRIb3N0KSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBleGl0Q29kZUZyb21SZXN1bHQoYWxsRGlhZ25vc3RpY3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2F0Y2hNb2RlKFxuICAgIHByb2plY3Q6IHN0cmluZywgb3B0aW9uczogYXBpLkNvbXBpbGVyT3B0aW9ucywgY29uc29sZUVycm9yOiAoczogc3RyaW5nKSA9PiB2b2lkKSB7XG4gIHJldHVybiBwZXJmb3JtV2F0Y2hDb21waWxhdGlvbihjcmVhdGVQZXJmb3JtV2F0Y2hIb3N0KHByb2plY3QsIGRpYWdub3N0aWNzID0+IHtcbiAgICBjb25zb2xlRXJyb3IoZm9ybWF0RGlhZ25vc3RpY3MoZGlhZ25vc3RpY3MpKTtcbiAgfSwgb3B0aW9ucywgb3B0aW9ucyA9PiBjcmVhdGVFbWl0Q2FsbGJhY2sob3B0aW9ucykpKTtcbn1cblxuLy8gQ0xJIGVudHJ5IHBvaW50XG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgY29uc3QgYXJncyA9IHByb2Nlc3MuYXJndi5zbGljZSgyKTtcbiAgcHJvY2Vzcy5leGl0Q29kZSA9IG1haW4oYXJncyk7XG59XG4iXX0=