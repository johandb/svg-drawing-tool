"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("typescript");
const ast_utils_1 = require("../utility/ast-utils");
const change_1 = require("../utility/change");
const find_module_1 = require("../utility/find-module");
const lint_fix_1 = require("../utility/lint-fix");
const parse_name_1 = require("../utility/parse-name");
const project_1 = require("../utility/project");
const validation_1 = require("../utility/validation");
function readIntoSourceFile(host, modulePath) {
    const text = host.read(modulePath);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    return ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
}
function addDeclarationToNgModule(options) {
    return (host) => {
        if (options.skipImport || !options.module) {
            return host;
        }
        const modulePath = options.module;
        const source = readIntoSourceFile(host, modulePath);
        const componentPath = `/${options.path}/`
            + (options.flat ? '' : core_1.strings.dasherize(options.name) + '/')
            + core_1.strings.dasherize(options.name)
            + '.component';
        const relativePath = find_module_1.buildRelativePath(modulePath, componentPath);
        const classifiedName = core_1.strings.classify(`${options.name}Component`);
        const declarationChanges = ast_utils_1.addDeclarationToModule(source, modulePath, classifiedName, relativePath);
        const declarationRecorder = host.beginUpdate(modulePath);
        for (const change of declarationChanges) {
            if (change instanceof change_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        if (options.export) {
            // Need to refresh the AST because we overwrote the file in the host.
            const source = readIntoSourceFile(host, modulePath);
            const exportRecorder = host.beginUpdate(modulePath);
            const exportChanges = ast_utils_1.addExportToModule(source, modulePath, core_1.strings.classify(`${options.name}Component`), relativePath);
            for (const change of exportChanges) {
                if (change instanceof change_1.InsertChange) {
                    exportRecorder.insertLeft(change.pos, change.toAdd);
                }
            }
            host.commitUpdate(exportRecorder);
        }
        if (options.entryComponent) {
            // Need to refresh the AST because we overwrote the file in the host.
            const source = readIntoSourceFile(host, modulePath);
            const entryComponentRecorder = host.beginUpdate(modulePath);
            const entryComponentChanges = ast_utils_1.addEntryComponentToModule(source, modulePath, core_1.strings.classify(`${options.name}Component`), relativePath);
            for (const change of entryComponentChanges) {
                if (change instanceof change_1.InsertChange) {
                    entryComponentRecorder.insertLeft(change.pos, change.toAdd);
                }
            }
            host.commitUpdate(entryComponentRecorder);
        }
        return host;
    };
}
function buildSelector(options, projectPrefix) {
    let selector = core_1.strings.dasherize(options.name);
    if (options.prefix) {
        selector = `${options.prefix}-${selector}`;
    }
    else if (options.prefix === undefined && projectPrefix) {
        selector = `${projectPrefix}-${selector}`;
    }
    return selector;
}
function default_1(options) {
    return (host) => {
        if (!options.project) {
            throw new schematics_1.SchematicsException('Option (project) is required.');
        }
        const project = project_1.getProject(host, options.project);
        if (options.path === undefined) {
            options.path = project_1.buildDefaultPath(project);
        }
        options.module = find_module_1.findModuleFromOptions(host, options);
        const parsedPath = parse_name_1.parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        options.selector = options.selector || buildSelector(options, project.prefix);
        // todo remove these when we remove the deprecations
        options.style = (options.style && options.style !== 'css'
            ? options.style : options.styleext) || 'css';
        options.skipTests = options.skipTests || !options.spec;
        validation_1.validateName(options.name);
        validation_1.validateHtmlSelector(options.selector);
        const templateSource = schematics_1.apply(schematics_1.url('./files'), [
            options.skipTests ? schematics_1.filter(path => !path.endsWith('.spec.ts')) : schematics_1.noop(),
            options.inlineStyle ? schematics_1.filter(path => !path.endsWith('.__style__')) : schematics_1.noop(),
            options.inlineTemplate ? schematics_1.filter(path => !path.endsWith('.html')) : schematics_1.noop(),
            schematics_1.template(Object.assign({}, core_1.strings, { 'if-flat': (s) => options.flat ? '' : s }, options)),
            schematics_1.move(parsedPath.path),
        ]);
        return schematics_1.chain([
            schematics_1.branchAndMerge(schematics_1.chain([
                addDeclarationToNgModule(options),
                schematics_1.mergeWith(templateSource),
            ])),
            options.lintFix ? lint_fix_1.applyLintFix(options.path) : schematics_1.noop(),
        ]);
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3NjaGVtYXRpY3MvYW5ndWxhci9jb21wb25lbnQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwrQ0FBK0M7QUFDL0MsMkRBYW9DO0FBQ3BDLGlDQUFpQztBQUNqQyxvREFJOEI7QUFDOUIsOENBQWlEO0FBQ2pELHdEQUFrRjtBQUNsRixrREFBbUQ7QUFDbkQsc0RBQWtEO0FBQ2xELGdEQUFrRTtBQUNsRSxzREFBMkU7QUFHM0UsU0FBUyxrQkFBa0IsQ0FBQyxJQUFVLEVBQUUsVUFBa0I7SUFDeEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuQyxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7UUFDakIsTUFBTSxJQUFJLGdDQUFtQixDQUFDLFFBQVEsVUFBVSxrQkFBa0IsQ0FBQyxDQUFDO0tBQ3JFO0lBQ0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUUxQyxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25GLENBQUM7QUFFRCxTQUFTLHdCQUF3QixDQUFDLE9BQXlCO0lBQ3pELE9BQU8sQ0FBQyxJQUFVLEVBQUUsRUFBRTtRQUNwQixJQUFJLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQ3pDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ2xDLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVwRCxNQUFNLGFBQWEsR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEdBQUc7Y0FDakIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztjQUMzRCxjQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7Y0FDL0IsWUFBWSxDQUFDO1FBQ3JDLE1BQU0sWUFBWSxHQUFHLCtCQUFpQixDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNsRSxNQUFNLGNBQWMsR0FBRyxjQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUM7UUFDcEUsTUFBTSxrQkFBa0IsR0FBRyxrQ0FBc0IsQ0FBQyxNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFDZCxZQUFZLENBQUMsQ0FBQztRQUVoRSxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDekQsS0FBSyxNQUFNLE1BQU0sSUFBSSxrQkFBa0IsRUFBRTtZQUN2QyxJQUFJLE1BQU0sWUFBWSxxQkFBWSxFQUFFO2dCQUNsQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDMUQ7U0FDRjtRQUNELElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUV2QyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDbEIscUVBQXFFO1lBQ3JFLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztZQUVwRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sYUFBYSxHQUFHLDZCQUFpQixDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQ2xCLGNBQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxXQUFXLENBQUMsRUFDNUMsWUFBWSxDQUFDLENBQUM7WUFFdEQsS0FBSyxNQUFNLE1BQU0sSUFBSSxhQUFhLEVBQUU7Z0JBQ2xDLElBQUksTUFBTSxZQUFZLHFCQUFZLEVBQUU7b0JBQ2xDLGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3JEO2FBQ0Y7WUFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ25DO1FBRUQsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFO1lBQzFCLHFFQUFxRTtZQUNyRSxNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFcEQsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzVELE1BQU0scUJBQXFCLEdBQUcscUNBQXlCLENBQ3JELE1BQU0sRUFBRSxVQUFVLEVBQ2xCLGNBQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxXQUFXLENBQUMsRUFDNUMsWUFBWSxDQUFDLENBQUM7WUFFaEIsS0FBSyxNQUFNLE1BQU0sSUFBSSxxQkFBcUIsRUFBRTtnQkFDMUMsSUFBSSxNQUFNLFlBQVkscUJBQVksRUFBRTtvQkFDbEMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUM3RDthQUNGO1lBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQzNDO1FBR0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDLENBQUM7QUFDSixDQUFDO0FBR0QsU0FBUyxhQUFhLENBQUMsT0FBeUIsRUFBRSxhQUFxQjtJQUNyRSxJQUFJLFFBQVEsR0FBRyxjQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDbEIsUUFBUSxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxRQUFRLEVBQUUsQ0FBQztLQUM1QztTQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksYUFBYSxFQUFFO1FBQ3hELFFBQVEsR0FBRyxHQUFHLGFBQWEsSUFBSSxRQUFRLEVBQUUsQ0FBQztLQUMzQztJQUVELE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUFHRCxtQkFBeUIsT0FBeUI7SUFDaEQsT0FBTyxDQUFDLElBQVUsRUFBRSxFQUFFO1FBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxnQ0FBbUIsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1NBQ2hFO1FBQ0QsTUFBTSxPQUFPLEdBQUcsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWxELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDOUIsT0FBTyxDQUFDLElBQUksR0FBRywwQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMxQztRQUVELE9BQU8sQ0FBQyxNQUFNLEdBQUcsbUNBQXFCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXRELE1BQU0sVUFBVSxHQUFHLHNCQUFTLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekQsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztRQUMvQixPQUFPLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFOUUsb0RBQW9EO1FBQ3BELE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FDZCxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssS0FBSztZQUN0QyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FDckMsSUFBSSxLQUFLLENBQUM7UUFDWCxPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBRXZELHlCQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLGlDQUFvQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV2QyxNQUFNLGNBQWMsR0FBRyxrQkFBSyxDQUFDLGdCQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDM0MsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBSSxFQUFFO1lBQ3ZFLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLG1CQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQUksRUFBRTtZQUMzRSxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxtQkFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFJLEVBQUU7WUFDekUscUJBQVEsbUJBQ0gsY0FBTyxJQUNWLFNBQVMsRUFBRSxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQzVDLE9BQU8sRUFDVjtZQUNGLGlCQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztTQUN0QixDQUFDLENBQUM7UUFFSCxPQUFPLGtCQUFLLENBQUM7WUFDWCwyQkFBYyxDQUFDLGtCQUFLLENBQUM7Z0JBQ25CLHdCQUF3QixDQUFDLE9BQU8sQ0FBQztnQkFDakMsc0JBQVMsQ0FBQyxjQUFjLENBQUM7YUFDMUIsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsdUJBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFJLEVBQUU7U0FDdEQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWhERCw0QkFnREMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBzdHJpbmdzIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHtcbiAgUnVsZSxcbiAgU2NoZW1hdGljc0V4Y2VwdGlvbixcbiAgVHJlZSxcbiAgYXBwbHksXG4gIGJyYW5jaEFuZE1lcmdlLFxuICBjaGFpbixcbiAgZmlsdGVyLFxuICBtZXJnZVdpdGgsXG4gIG1vdmUsXG4gIG5vb3AsXG4gIHRlbXBsYXRlLFxuICB1cmwsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtcbiAgYWRkRGVjbGFyYXRpb25Ub01vZHVsZSxcbiAgYWRkRW50cnlDb21wb25lbnRUb01vZHVsZSxcbiAgYWRkRXhwb3J0VG9Nb2R1bGUsXG59IGZyb20gJy4uL3V0aWxpdHkvYXN0LXV0aWxzJztcbmltcG9ydCB7IEluc2VydENoYW5nZSB9IGZyb20gJy4uL3V0aWxpdHkvY2hhbmdlJztcbmltcG9ydCB7IGJ1aWxkUmVsYXRpdmVQYXRoLCBmaW5kTW9kdWxlRnJvbU9wdGlvbnMgfSBmcm9tICcuLi91dGlsaXR5L2ZpbmQtbW9kdWxlJztcbmltcG9ydCB7IGFwcGx5TGludEZpeCB9IGZyb20gJy4uL3V0aWxpdHkvbGludC1maXgnO1xuaW1wb3J0IHsgcGFyc2VOYW1lIH0gZnJvbSAnLi4vdXRpbGl0eS9wYXJzZS1uYW1lJztcbmltcG9ydCB7IGJ1aWxkRGVmYXVsdFBhdGgsIGdldFByb2plY3QgfSBmcm9tICcuLi91dGlsaXR5L3Byb2plY3QnO1xuaW1wb3J0IHsgdmFsaWRhdGVIdG1sU2VsZWN0b3IsIHZhbGlkYXRlTmFtZSB9IGZyb20gJy4uL3V0aWxpdHkvdmFsaWRhdGlvbic7XG5pbXBvcnQgeyBTY2hlbWEgYXMgQ29tcG9uZW50T3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuZnVuY3Rpb24gcmVhZEludG9Tb3VyY2VGaWxlKGhvc3Q6IFRyZWUsIG1vZHVsZVBhdGg6IHN0cmluZyk6IHRzLlNvdXJjZUZpbGUge1xuICBjb25zdCB0ZXh0ID0gaG9zdC5yZWFkKG1vZHVsZVBhdGgpO1xuICBpZiAodGV4dCA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBGaWxlICR7bW9kdWxlUGF0aH0gZG9lcyBub3QgZXhpc3QuYCk7XG4gIH1cbiAgY29uc3Qgc291cmNlVGV4dCA9IHRleHQudG9TdHJpbmcoJ3V0Zi04Jyk7XG5cbiAgcmV0dXJuIHRzLmNyZWF0ZVNvdXJjZUZpbGUobW9kdWxlUGF0aCwgc291cmNlVGV4dCwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGFkZERlY2xhcmF0aW9uVG9OZ01vZHVsZShvcHRpb25zOiBDb21wb25lbnRPcHRpb25zKTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSkgPT4ge1xuICAgIGlmIChvcHRpb25zLnNraXBJbXBvcnQgfHwgIW9wdGlvbnMubW9kdWxlKSB7XG4gICAgICByZXR1cm4gaG9zdDtcbiAgICB9XG5cbiAgICBjb25zdCBtb2R1bGVQYXRoID0gb3B0aW9ucy5tb2R1bGU7XG4gICAgY29uc3Qgc291cmNlID0gcmVhZEludG9Tb3VyY2VGaWxlKGhvc3QsIG1vZHVsZVBhdGgpO1xuXG4gICAgY29uc3QgY29tcG9uZW50UGF0aCA9IGAvJHtvcHRpb25zLnBhdGh9L2BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKyAob3B0aW9ucy5mbGF0ID8gJycgOiBzdHJpbmdzLmRhc2hlcml6ZShvcHRpb25zLm5hbWUpICsgJy8nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICArIHN0cmluZ3MuZGFzaGVyaXplKG9wdGlvbnMubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKyAnLmNvbXBvbmVudCc7XG4gICAgY29uc3QgcmVsYXRpdmVQYXRoID0gYnVpbGRSZWxhdGl2ZVBhdGgobW9kdWxlUGF0aCwgY29tcG9uZW50UGF0aCk7XG4gICAgY29uc3QgY2xhc3NpZmllZE5hbWUgPSBzdHJpbmdzLmNsYXNzaWZ5KGAke29wdGlvbnMubmFtZX1Db21wb25lbnRgKTtcbiAgICBjb25zdCBkZWNsYXJhdGlvbkNoYW5nZXMgPSBhZGREZWNsYXJhdGlvblRvTW9kdWxlKHNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2lmaWVkTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlUGF0aCk7XG5cbiAgICBjb25zdCBkZWNsYXJhdGlvblJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShtb2R1bGVQYXRoKTtcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBkZWNsYXJhdGlvbkNoYW5nZXMpIHtcbiAgICAgIGlmIChjaGFuZ2UgaW5zdGFuY2VvZiBJbnNlcnRDaGFuZ2UpIHtcbiAgICAgICAgZGVjbGFyYXRpb25SZWNvcmRlci5pbnNlcnRMZWZ0KGNoYW5nZS5wb3MsIGNoYW5nZS50b0FkZCk7XG4gICAgICB9XG4gICAgfVxuICAgIGhvc3QuY29tbWl0VXBkYXRlKGRlY2xhcmF0aW9uUmVjb3JkZXIpO1xuXG4gICAgaWYgKG9wdGlvbnMuZXhwb3J0KSB7XG4gICAgICAvLyBOZWVkIHRvIHJlZnJlc2ggdGhlIEFTVCBiZWNhdXNlIHdlIG92ZXJ3cm90ZSB0aGUgZmlsZSBpbiB0aGUgaG9zdC5cbiAgICAgIGNvbnN0IHNvdXJjZSA9IHJlYWRJbnRvU291cmNlRmlsZShob3N0LCBtb2R1bGVQYXRoKTtcblxuICAgICAgY29uc3QgZXhwb3J0UmVjb3JkZXIgPSBob3N0LmJlZ2luVXBkYXRlKG1vZHVsZVBhdGgpO1xuICAgICAgY29uc3QgZXhwb3J0Q2hhbmdlcyA9IGFkZEV4cG9ydFRvTW9kdWxlKHNvdXJjZSwgbW9kdWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmdzLmNsYXNzaWZ5KGAke29wdGlvbnMubmFtZX1Db21wb25lbnRgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZVBhdGgpO1xuXG4gICAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBleHBvcnRDaGFuZ2VzKSB7XG4gICAgICAgIGlmIChjaGFuZ2UgaW5zdGFuY2VvZiBJbnNlcnRDaGFuZ2UpIHtcbiAgICAgICAgICBleHBvcnRSZWNvcmRlci5pbnNlcnRMZWZ0KGNoYW5nZS5wb3MsIGNoYW5nZS50b0FkZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGhvc3QuY29tbWl0VXBkYXRlKGV4cG9ydFJlY29yZGVyKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5lbnRyeUNvbXBvbmVudCkge1xuICAgICAgLy8gTmVlZCB0byByZWZyZXNoIHRoZSBBU1QgYmVjYXVzZSB3ZSBvdmVyd3JvdGUgdGhlIGZpbGUgaW4gdGhlIGhvc3QuXG4gICAgICBjb25zdCBzb3VyY2UgPSByZWFkSW50b1NvdXJjZUZpbGUoaG9zdCwgbW9kdWxlUGF0aCk7XG5cbiAgICAgIGNvbnN0IGVudHJ5Q29tcG9uZW50UmVjb3JkZXIgPSBob3N0LmJlZ2luVXBkYXRlKG1vZHVsZVBhdGgpO1xuICAgICAgY29uc3QgZW50cnlDb21wb25lbnRDaGFuZ2VzID0gYWRkRW50cnlDb21wb25lbnRUb01vZHVsZShcbiAgICAgICAgc291cmNlLCBtb2R1bGVQYXRoLFxuICAgICAgICBzdHJpbmdzLmNsYXNzaWZ5KGAke29wdGlvbnMubmFtZX1Db21wb25lbnRgKSxcbiAgICAgICAgcmVsYXRpdmVQYXRoKTtcblxuICAgICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgZW50cnlDb21wb25lbnRDaGFuZ2VzKSB7XG4gICAgICAgIGlmIChjaGFuZ2UgaW5zdGFuY2VvZiBJbnNlcnRDaGFuZ2UpIHtcbiAgICAgICAgICBlbnRyeUNvbXBvbmVudFJlY29yZGVyLmluc2VydExlZnQoY2hhbmdlLnBvcywgY2hhbmdlLnRvQWRkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaG9zdC5jb21taXRVcGRhdGUoZW50cnlDb21wb25lbnRSZWNvcmRlcik7XG4gICAgfVxuXG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuXG5mdW5jdGlvbiBidWlsZFNlbGVjdG9yKG9wdGlvbnM6IENvbXBvbmVudE9wdGlvbnMsIHByb2plY3RQcmVmaXg6IHN0cmluZykge1xuICBsZXQgc2VsZWN0b3IgPSBzdHJpbmdzLmRhc2hlcml6ZShvcHRpb25zLm5hbWUpO1xuICBpZiAob3B0aW9ucy5wcmVmaXgpIHtcbiAgICBzZWxlY3RvciA9IGAke29wdGlvbnMucHJlZml4fS0ke3NlbGVjdG9yfWA7XG4gIH0gZWxzZSBpZiAob3B0aW9ucy5wcmVmaXggPT09IHVuZGVmaW5lZCAmJiBwcm9qZWN0UHJlZml4KSB7XG4gICAgc2VsZWN0b3IgPSBgJHtwcm9qZWN0UHJlZml4fS0ke3NlbGVjdG9yfWA7XG4gIH1cblxuICByZXR1cm4gc2VsZWN0b3I7XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9wdGlvbnM6IENvbXBvbmVudE9wdGlvbnMpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlKSA9PiB7XG4gICAgaWYgKCFvcHRpb25zLnByb2plY3QpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdPcHRpb24gKHByb2plY3QpIGlzIHJlcXVpcmVkLicpO1xuICAgIH1cbiAgICBjb25zdCBwcm9qZWN0ID0gZ2V0UHJvamVjdChob3N0LCBvcHRpb25zLnByb2plY3QpO1xuXG4gICAgaWYgKG9wdGlvbnMucGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRpb25zLnBhdGggPSBidWlsZERlZmF1bHRQYXRoKHByb2plY3QpO1xuICAgIH1cblxuICAgIG9wdGlvbnMubW9kdWxlID0gZmluZE1vZHVsZUZyb21PcHRpb25zKGhvc3QsIG9wdGlvbnMpO1xuXG4gICAgY29uc3QgcGFyc2VkUGF0aCA9IHBhcnNlTmFtZShvcHRpb25zLnBhdGgsIG9wdGlvbnMubmFtZSk7XG4gICAgb3B0aW9ucy5uYW1lID0gcGFyc2VkUGF0aC5uYW1lO1xuICAgIG9wdGlvbnMucGF0aCA9IHBhcnNlZFBhdGgucGF0aDtcbiAgICBvcHRpb25zLnNlbGVjdG9yID0gb3B0aW9ucy5zZWxlY3RvciB8fCBidWlsZFNlbGVjdG9yKG9wdGlvbnMsIHByb2plY3QucHJlZml4KTtcblxuICAgIC8vIHRvZG8gcmVtb3ZlIHRoZXNlIHdoZW4gd2UgcmVtb3ZlIHRoZSBkZXByZWNhdGlvbnNcbiAgICBvcHRpb25zLnN0eWxlID0gKFxuICAgICAgb3B0aW9ucy5zdHlsZSAmJiBvcHRpb25zLnN0eWxlICE9PSAnY3NzJ1xuICAgICAgICA/IG9wdGlvbnMuc3R5bGUgOiBvcHRpb25zLnN0eWxlZXh0XG4gICAgKSB8fCAnY3NzJztcbiAgICBvcHRpb25zLnNraXBUZXN0cyA9IG9wdGlvbnMuc2tpcFRlc3RzIHx8ICFvcHRpb25zLnNwZWM7XG5cbiAgICB2YWxpZGF0ZU5hbWUob3B0aW9ucy5uYW1lKTtcbiAgICB2YWxpZGF0ZUh0bWxTZWxlY3RvcihvcHRpb25zLnNlbGVjdG9yKTtcblxuICAgIGNvbnN0IHRlbXBsYXRlU291cmNlID0gYXBwbHkodXJsKCcuL2ZpbGVzJyksIFtcbiAgICAgIG9wdGlvbnMuc2tpcFRlc3RzID8gZmlsdGVyKHBhdGggPT4gIXBhdGguZW5kc1dpdGgoJy5zcGVjLnRzJykpIDogbm9vcCgpLFxuICAgICAgb3B0aW9ucy5pbmxpbmVTdHlsZSA/IGZpbHRlcihwYXRoID0+ICFwYXRoLmVuZHNXaXRoKCcuX19zdHlsZV9fJykpIDogbm9vcCgpLFxuICAgICAgb3B0aW9ucy5pbmxpbmVUZW1wbGF0ZSA/IGZpbHRlcihwYXRoID0+ICFwYXRoLmVuZHNXaXRoKCcuaHRtbCcpKSA6IG5vb3AoKSxcbiAgICAgIHRlbXBsYXRlKHtcbiAgICAgICAgLi4uc3RyaW5ncyxcbiAgICAgICAgJ2lmLWZsYXQnOiAoczogc3RyaW5nKSA9PiBvcHRpb25zLmZsYXQgPyAnJyA6IHMsXG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICB9KSxcbiAgICAgIG1vdmUocGFyc2VkUGF0aC5wYXRoKSxcbiAgICBdKTtcblxuICAgIHJldHVybiBjaGFpbihbXG4gICAgICBicmFuY2hBbmRNZXJnZShjaGFpbihbXG4gICAgICAgIGFkZERlY2xhcmF0aW9uVG9OZ01vZHVsZShvcHRpb25zKSxcbiAgICAgICAgbWVyZ2VXaXRoKHRlbXBsYXRlU291cmNlKSxcbiAgICAgIF0pKSxcbiAgICAgIG9wdGlvbnMubGludEZpeCA/IGFwcGx5TGludEZpeChvcHRpb25zLnBhdGgpIDogbm9vcCgpLFxuICAgIF0pO1xuICB9O1xufVxuIl19