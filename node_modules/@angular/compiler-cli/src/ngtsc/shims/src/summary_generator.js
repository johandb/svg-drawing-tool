/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/shims/src/summary_generator", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/shims/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ts = require("typescript");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/util");
    var SummaryGenerator = /** @class */ (function () {
        function SummaryGenerator(map) {
            this.map = map;
        }
        SummaryGenerator.prototype.getSummaryFileNames = function () { return Array.from(this.map.keys()); };
        SummaryGenerator.prototype.recognize = function (fileName) { return this.map.has(fileName); };
        SummaryGenerator.prototype.generate = function (genFilePath, readFile) {
            var originalPath = this.map.get(genFilePath);
            var original = readFile(originalPath);
            if (original === null) {
                return null;
            }
            // Collect a list of classes that need to have factory types emitted for them. This list is
            // overly broad as at this point the ts.TypeChecker has not been created and so it can't be used
            // to semantically understand which decorators are Angular decorators. It's okay to output an
            // overly broad set of summary exports as the exports are no-ops anyway, and summaries are a
            // compatibility layer which will be removed after Ivy is enabled.
            var symbolNames = original
                .statements
                // Pick out top level class declarations...
                .filter(ts.isClassDeclaration)
                // which are named, exported, and have decorators.
                .filter(function (decl) { return isExported(decl) && decl.decorators !== undefined &&
                decl.name !== undefined; })
                // Grab the symbol name.
                .map(function (decl) { return decl.name.text; });
            var varLines = symbolNames.map(function (name) { return "export const " + name + "NgSummary: any = null;"; });
            if (varLines.length === 0) {
                // In the event there are no other exports, add an empty export to ensure the generated
                // summary file is still an ES module.
                varLines.push("export const \u0275empty = null;");
            }
            var sourceText = varLines.join('\n');
            var genFile = ts.createSourceFile(genFilePath, sourceText, original.languageVersion, true, ts.ScriptKind.TS);
            if (original.moduleName !== undefined) {
                genFile.moduleName =
                    util_1.generatedModuleName(original.moduleName, original.fileName, '.ngsummary');
            }
            return genFile;
        };
        SummaryGenerator.forRootFiles = function (files) {
            var map = new Map();
            files.filter(function (sourceFile) { return util_1.isNonDeclarationTsFile(sourceFile); })
                .forEach(function (sourceFile) { return map.set(sourceFile.replace(/\.ts$/, '.ngsummary.ts'), sourceFile); });
            return new SummaryGenerator(map);
        };
        return SummaryGenerator;
    }());
    exports.SummaryGenerator = SummaryGenerator;
    function isExported(decl) {
        return decl.modifiers !== undefined &&
            decl.modifiers.some(function (mod) { return mod.kind == ts.SyntaxKind.ExportKeyword; });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeV9nZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3NoaW1zL3NyYy9zdW1tYXJ5X2dlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUdqQyx1RUFBbUU7SUFFbkU7UUFDRSwwQkFBNEIsR0FBd0I7WUFBeEIsUUFBRyxHQUFILEdBQUcsQ0FBcUI7UUFBRyxDQUFDO1FBRXhELDhDQUFtQixHQUFuQixjQUFrQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV2RSxvQ0FBUyxHQUFULFVBQVUsUUFBZ0IsSUFBYSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV2RSxtQ0FBUSxHQUFSLFVBQVMsV0FBbUIsRUFBRSxRQUFvRDtZQUVoRixJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUcsQ0FBQztZQUNqRCxJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDeEMsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO2dCQUNyQixPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsMkZBQTJGO1lBQzNGLGdHQUFnRztZQUNoRyw2RkFBNkY7WUFDN0YsNEZBQTRGO1lBQzVGLGtFQUFrRTtZQUNsRSxJQUFNLFdBQVcsR0FBRyxRQUFRO2lCQUNILFVBQVU7Z0JBQ1gsMkNBQTJDO2lCQUMxQyxNQUFNLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDO2dCQUM5QixrREFBa0Q7aUJBQ2pELE1BQU0sQ0FDSCxVQUFBLElBQUksSUFBSSxPQUFBLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLFNBQVM7Z0JBQ3JELElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQURuQixDQUNtQixDQUFDO2dCQUNoQyx3QkFBd0I7aUJBQ3ZCLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxJQUFNLENBQUMsSUFBSSxFQUFoQixDQUFnQixDQUFDLENBQUM7WUFFdkQsSUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLGtCQUFnQixJQUFJLDJCQUF3QixFQUE1QyxDQUE0QyxDQUFDLENBQUM7WUFFdkYsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDekIsdUZBQXVGO2dCQUN2RixzQ0FBc0M7Z0JBQ3RDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0NBQTZCLENBQUMsQ0FBQzthQUM5QztZQUNELElBQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkMsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUMvQixXQUFXLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0UsSUFBSSxRQUFRLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtnQkFDckMsT0FBTyxDQUFDLFVBQVU7b0JBQ2QsMEJBQW1CLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO2FBQy9FO1lBQ0QsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUVNLDZCQUFZLEdBQW5CLFVBQW9CLEtBQTRCO1lBQzlDLElBQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1lBQ3RDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBQSxVQUFVLElBQUksT0FBQSw2QkFBc0IsQ0FBQyxVQUFVLENBQUMsRUFBbEMsQ0FBa0MsQ0FBQztpQkFDekQsT0FBTyxDQUFDLFVBQUEsVUFBVSxJQUFJLE9BQUEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsRUFBRSxVQUFVLENBQUMsRUFBakUsQ0FBaUUsQ0FBQyxDQUFDO1lBQzlGLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBdERELElBc0RDO0lBdERZLDRDQUFnQjtJQXdEN0IsU0FBUyxVQUFVLENBQUMsSUFBb0I7UUFDdEMsT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLFNBQVM7WUFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUF2QyxDQUF1QyxDQUFDLENBQUM7SUFDMUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7U2hpbUdlbmVyYXRvcn0gZnJvbSAnLi9ob3N0JztcbmltcG9ydCB7Z2VuZXJhdGVkTW9kdWxlTmFtZSwgaXNOb25EZWNsYXJhdGlvblRzRmlsZX0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGNsYXNzIFN1bW1hcnlHZW5lcmF0b3IgaW1wbGVtZW50cyBTaGltR2VuZXJhdG9yIHtcbiAgcHJpdmF0ZSBjb25zdHJ1Y3Rvcihwcml2YXRlIG1hcDogTWFwPHN0cmluZywgc3RyaW5nPikge31cblxuICBnZXRTdW1tYXJ5RmlsZU5hbWVzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIEFycmF5LmZyb20odGhpcy5tYXAua2V5cygpKTsgfVxuXG4gIHJlY29nbml6ZShmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLm1hcC5oYXMoZmlsZU5hbWUpOyB9XG5cbiAgZ2VuZXJhdGUoZ2VuRmlsZVBhdGg6IHN0cmluZywgcmVhZEZpbGU6IChmaWxlTmFtZTogc3RyaW5nKSA9PiB0cy5Tb3VyY2VGaWxlIHwgbnVsbCk6IHRzLlNvdXJjZUZpbGVcbiAgICAgIHxudWxsIHtcbiAgICBjb25zdCBvcmlnaW5hbFBhdGggPSB0aGlzLm1hcC5nZXQoZ2VuRmlsZVBhdGgpICE7XG4gICAgY29uc3Qgb3JpZ2luYWwgPSByZWFkRmlsZShvcmlnaW5hbFBhdGgpO1xuICAgIGlmIChvcmlnaW5hbCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gQ29sbGVjdCBhIGxpc3Qgb2YgY2xhc3NlcyB0aGF0IG5lZWQgdG8gaGF2ZSBmYWN0b3J5IHR5cGVzIGVtaXR0ZWQgZm9yIHRoZW0uIFRoaXMgbGlzdCBpc1xuICAgIC8vIG92ZXJseSBicm9hZCBhcyBhdCB0aGlzIHBvaW50IHRoZSB0cy5UeXBlQ2hlY2tlciBoYXMgbm90IGJlZW4gY3JlYXRlZCBhbmQgc28gaXQgY2FuJ3QgYmUgdXNlZFxuICAgIC8vIHRvIHNlbWFudGljYWxseSB1bmRlcnN0YW5kIHdoaWNoIGRlY29yYXRvcnMgYXJlIEFuZ3VsYXIgZGVjb3JhdG9ycy4gSXQncyBva2F5IHRvIG91dHB1dCBhblxuICAgIC8vIG92ZXJseSBicm9hZCBzZXQgb2Ygc3VtbWFyeSBleHBvcnRzIGFzIHRoZSBleHBvcnRzIGFyZSBuby1vcHMgYW55d2F5LCBhbmQgc3VtbWFyaWVzIGFyZSBhXG4gICAgLy8gY29tcGF0aWJpbGl0eSBsYXllciB3aGljaCB3aWxsIGJlIHJlbW92ZWQgYWZ0ZXIgSXZ5IGlzIGVuYWJsZWQuXG4gICAgY29uc3Qgc3ltYm9sTmFtZXMgPSBvcmlnaW5hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdGF0ZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGljayBvdXQgdG9wIGxldmVsIGNsYXNzIGRlY2xhcmF0aW9ucy4uLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIodHMuaXNDbGFzc0RlY2xhcmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoaWNoIGFyZSBuYW1lZCwgZXhwb3J0ZWQsIGFuZCBoYXZlIGRlY29yYXRvcnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjbCA9PiBpc0V4cG9ydGVkKGRlY2wpICYmIGRlY2wuZGVjb3JhdG9ycyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNsLm5hbWUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHcmFiIHRoZSBzeW1ib2wgbmFtZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGRlY2wgPT4gZGVjbC5uYW1lICEudGV4dCk7XG5cbiAgICBjb25zdCB2YXJMaW5lcyA9IHN5bWJvbE5hbWVzLm1hcChuYW1lID0+IGBleHBvcnQgY29uc3QgJHtuYW1lfU5nU3VtbWFyeTogYW55ID0gbnVsbDtgKTtcblxuICAgIGlmICh2YXJMaW5lcy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIEluIHRoZSBldmVudCB0aGVyZSBhcmUgbm8gb3RoZXIgZXhwb3J0cywgYWRkIGFuIGVtcHR5IGV4cG9ydCB0byBlbnN1cmUgdGhlIGdlbmVyYXRlZFxuICAgICAgLy8gc3VtbWFyeSBmaWxlIGlzIHN0aWxsIGFuIEVTIG1vZHVsZS5cbiAgICAgIHZhckxpbmVzLnB1c2goYGV4cG9ydCBjb25zdCDJtWVtcHR5ID0gbnVsbDtgKTtcbiAgICB9XG4gICAgY29uc3Qgc291cmNlVGV4dCA9IHZhckxpbmVzLmpvaW4oJ1xcbicpO1xuICAgIGNvbnN0IGdlbkZpbGUgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKFxuICAgICAgICBnZW5GaWxlUGF0aCwgc291cmNlVGV4dCwgb3JpZ2luYWwubGFuZ3VhZ2VWZXJzaW9uLCB0cnVlLCB0cy5TY3JpcHRLaW5kLlRTKTtcbiAgICBpZiAob3JpZ2luYWwubW9kdWxlTmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBnZW5GaWxlLm1vZHVsZU5hbWUgPVxuICAgICAgICAgIGdlbmVyYXRlZE1vZHVsZU5hbWUob3JpZ2luYWwubW9kdWxlTmFtZSwgb3JpZ2luYWwuZmlsZU5hbWUsICcubmdzdW1tYXJ5Jyk7XG4gICAgfVxuICAgIHJldHVybiBnZW5GaWxlO1xuICB9XG5cbiAgc3RhdGljIGZvclJvb3RGaWxlcyhmaWxlczogUmVhZG9ubHlBcnJheTxzdHJpbmc+KTogU3VtbWFyeUdlbmVyYXRvciB7XG4gICAgY29uc3QgbWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICBmaWxlcy5maWx0ZXIoc291cmNlRmlsZSA9PiBpc05vbkRlY2xhcmF0aW9uVHNGaWxlKHNvdXJjZUZpbGUpKVxuICAgICAgICAuZm9yRWFjaChzb3VyY2VGaWxlID0+IG1hcC5zZXQoc291cmNlRmlsZS5yZXBsYWNlKC9cXC50cyQvLCAnLm5nc3VtbWFyeS50cycpLCBzb3VyY2VGaWxlKSk7XG4gICAgcmV0dXJuIG5ldyBTdW1tYXJ5R2VuZXJhdG9yKG1hcCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNFeHBvcnRlZChkZWNsOiB0cy5EZWNsYXJhdGlvbik6IGJvb2xlYW4ge1xuICByZXR1cm4gZGVjbC5tb2RpZmllcnMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgZGVjbC5tb2RpZmllcnMuc29tZShtb2QgPT4gbW9kLmtpbmQgPT0gdHMuU3ludGF4S2luZC5FeHBvcnRLZXl3b3JkKTtcbn1cbiJdfQ==