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
const tasks_1 = require("@angular-devkit/schematics/tasks");
const config_1 = require("../utility/config");
const dependencies_1 = require("../utility/dependencies");
const latest_versions_1 = require("../utility/latest-versions");
const lint_fix_1 = require("../utility/lint-fix");
const validation_1 = require("../utility/validation");
const workspace_models_1 = require("../utility/workspace-models");
// TODO: use JsonAST
// function appendPropertyInAstObject(
//   recorder: UpdateRecorder,
//   node: JsonAstObject,
//   propertyName: string,
//   value: JsonValue,
//   indent = 4,
// ) {
//   const indentStr = '\n' + new Array(indent + 1).join(' ');
//   if (node.properties.length > 0) {
//     // Insert comma.
//     const last = node.properties[node.properties.length - 1];
//     recorder.insertRight(last.start.offset + last.text.replace(/\s+$/, '').length, ',');
//   }
//   recorder.insertLeft(
//     node.end.offset - 1,
//     '  '
//     + `"${propertyName}": ${JSON.stringify(value, null, 2).replace(/\n/g, indentStr)}`
//     + indentStr.slice(0, -2),
//   );
// }
function addDependenciesToPackageJson(options) {
    return (host, context) => {
        [
            {
                type: dependencies_1.NodeDependencyType.Dev,
                name: '@angular/compiler-cli',
                version: latest_versions_1.latestVersions.Angular,
            },
            {
                type: dependencies_1.NodeDependencyType.Dev,
                name: '@angular-devkit/build-angular',
                version: latest_versions_1.latestVersions.DevkitBuildAngular,
            },
            {
                type: dependencies_1.NodeDependencyType.Dev,
                name: 'typescript',
                version: latest_versions_1.latestVersions.TypeScript,
            },
        ].forEach(dependency => dependencies_1.addPackageJsonDependency(host, dependency));
        if (!options.skipInstall) {
            context.addTask(new tasks_1.NodePackageInstallTask());
        }
        return host;
    };
}
function addAppToWorkspaceFile(options, workspace) {
    // TODO: use JsonAST
    // const workspacePath = '/angular.json';
    // const workspaceBuffer = host.read(workspacePath);
    // if (workspaceBuffer === null) {
    //   throw new SchematicsException(`Configuration file (${workspacePath}) not found.`);
    // }
    // const workspaceJson = parseJson(workspaceBuffer.toString());
    // if (workspaceJson.value === null) {
    //   throw new SchematicsException(`Unable to parse configuration file (${workspacePath}).`);
    // }
    let projectRoot = options.projectRoot !== undefined
        ? options.projectRoot
        : `${workspace.newProjectRoot}/${options.name}`;
    if (projectRoot !== '' && !projectRoot.endsWith('/')) {
        projectRoot += '/';
    }
    const rootFilesRoot = options.projectRoot === undefined
        ? projectRoot
        : projectRoot + 'src/';
    const schematics = {};
    if (options.inlineTemplate === true
        || options.inlineStyle === true
        || options.style !== 'css') {
        schematics['@schematics/angular:component'] = {};
        if (options.inlineTemplate === true) {
            schematics['@schematics/angular:component'].inlineTemplate = true;
        }
        if (options.inlineStyle === true) {
            schematics['@schematics/angular:component'].inlineStyle = true;
        }
        if (options.style && options.style !== 'css') {
            schematics['@schematics/angular:component'].styleext = options.style;
        }
    }
    if (options.skipTests === true) {
        ['class', 'component', 'directive', 'guard', 'module', 'pipe', 'service'].forEach((type) => {
            if (!(`@schematics/angular:${type}` in schematics)) {
                schematics[`@schematics/angular:${type}`] = {};
            }
            schematics[`@schematics/angular:${type}`].skipTests = true;
        });
    }
    const project = {
        root: projectRoot,
        sourceRoot: core_1.join(core_1.normalize(projectRoot), 'src'),
        projectType: workspace_models_1.ProjectType.Application,
        prefix: options.prefix || 'app',
        schematics,
        architect: {
            build: {
                builder: workspace_models_1.Builders.Browser,
                options: {
                    outputPath: `dist/${options.name}`,
                    index: `${projectRoot}src/index.html`,
                    main: `${projectRoot}src/main.ts`,
                    polyfills: `${projectRoot}src/polyfills.ts`,
                    tsConfig: `${rootFilesRoot}tsconfig.app.json`,
                    assets: [
                        core_1.join(core_1.normalize(projectRoot), 'src', 'favicon.ico'),
                        core_1.join(core_1.normalize(projectRoot), 'src', 'assets'),
                    ],
                    styles: [
                        `${projectRoot}src/styles.${options.style}`,
                    ],
                    scripts: [],
                },
                configurations: {
                    production: {
                        fileReplacements: [{
                                replace: `${projectRoot}src/environments/environment.ts`,
                                with: `${projectRoot}src/environments/environment.prod.ts`,
                            }],
                        optimization: true,
                        outputHashing: 'all',
                        sourceMap: false,
                        extractCss: true,
                        namedChunks: false,
                        aot: true,
                        extractLicenses: true,
                        vendorChunk: false,
                        buildOptimizer: true,
                        budgets: [{
                                type: 'initial',
                                maximumWarning: '2mb',
                                maximumError: '5mb',
                            }],
                    },
                },
            },
            serve: {
                builder: workspace_models_1.Builders.DevServer,
                options: {
                    browserTarget: `${options.name}:build`,
                },
                configurations: {
                    production: {
                        browserTarget: `${options.name}:build:production`,
                    },
                },
            },
            'extract-i18n': {
                builder: workspace_models_1.Builders.ExtractI18n,
                options: {
                    browserTarget: `${options.name}:build`,
                },
            },
            test: {
                builder: workspace_models_1.Builders.Karma,
                options: {
                    main: `${projectRoot}src/test.ts`,
                    polyfills: `${projectRoot}src/polyfills.ts`,
                    tsConfig: `${rootFilesRoot}tsconfig.spec.json`,
                    karmaConfig: `${rootFilesRoot}karma.conf.js`,
                    styles: [
                        `${projectRoot}src/styles.${options.style}`,
                    ],
                    scripts: [],
                    assets: [
                        core_1.join(core_1.normalize(projectRoot), 'src', 'favicon.ico'),
                        core_1.join(core_1.normalize(projectRoot), 'src', 'assets'),
                    ],
                },
            },
            lint: {
                builder: workspace_models_1.Builders.TsLint,
                options: {
                    tsConfig: [
                        `${rootFilesRoot}tsconfig.app.json`,
                        `${rootFilesRoot}tsconfig.spec.json`,
                    ],
                    exclude: [
                        '**/node_modules/**',
                    ],
                },
            },
        },
    };
    // tslint:disable-next-line:no-any
    // const projects: JsonObject = (<any> workspaceAst.value).projects || {};
    // tslint:disable-next-line:no-any
    // if (!(<any> workspaceAst.value).projects) {
    //   // tslint:disable-next-line:no-any
    //   (<any> workspaceAst.value).projects = projects;
    // }
    return config_1.addProjectToWorkspace(workspace, options.name, project);
}
function minimalPathFilter(path) {
    const toRemoveList = /(test.ts|tsconfig.spec.json|karma.conf.js)$/;
    return !toRemoveList.test(path);
}
function default_1(options) {
    return (host, context) => {
        if (!options.name) {
            throw new schematics_1.SchematicsException(`Invalid options, "name" is required.`);
        }
        validation_1.validateProjectName(options.name);
        const prefix = options.prefix || 'app';
        const appRootSelector = `${prefix}-root`;
        const componentOptions = !options.minimal ?
            {
                inlineStyle: options.inlineStyle,
                inlineTemplate: options.inlineTemplate,
                skipTests: options.skipTests,
                style: options.style,
                viewEncapsulation: options.viewEncapsulation,
            } :
            {
                inlineStyle: true,
                inlineTemplate: true,
                skipTests: true,
                style: options.style,
            };
        const workspace = config_1.getWorkspace(host);
        let newProjectRoot = workspace.newProjectRoot;
        let appDir = `${newProjectRoot}/${options.name}`;
        let sourceRoot = `${appDir}/src`;
        let sourceDir = `${sourceRoot}/app`;
        let relativePathToWorkspaceRoot = appDir.split('/').map(x => '..').join('/');
        const rootInSrc = options.projectRoot !== undefined;
        if (options.projectRoot !== undefined) {
            newProjectRoot = options.projectRoot;
            appDir = `${newProjectRoot}/src`;
            sourceRoot = appDir;
            sourceDir = `${sourceRoot}/app`;
            relativePathToWorkspaceRoot = core_1.relative(core_1.normalize('/' + sourceRoot), core_1.normalize('/'));
            if (relativePathToWorkspaceRoot === '') {
                relativePathToWorkspaceRoot = '.';
            }
        }
        const tsLintRoot = appDir;
        const e2eOptions = {
            name: `${options.name}-e2e`,
            relatedAppName: options.name,
            rootSelector: appRootSelector,
            projectRoot: newProjectRoot ? `${newProjectRoot}/${options.name}-e2e` : 'e2e',
        };
        return schematics_1.chain([
            addAppToWorkspaceFile(options, workspace),
            schematics_1.mergeWith(schematics_1.apply(schematics_1.url('./files/src'), [
                options.minimal ? schematics_1.filter(minimalPathFilter) : schematics_1.noop(),
                schematics_1.template(Object.assign({ utils: core_1.strings }, options, { 'dot': '.', relativePathToWorkspaceRoot })),
                schematics_1.move(sourceRoot),
            ])),
            schematics_1.mergeWith(schematics_1.apply(schematics_1.url('./files/root'), [
                options.minimal ? schematics_1.filter(minimalPathFilter) : schematics_1.noop(),
                schematics_1.template(Object.assign({ utils: core_1.strings }, options, { 'dot': '.', relativePathToWorkspaceRoot,
                    rootInSrc })),
                schematics_1.move(appDir),
            ])),
            options.minimal ? schematics_1.noop() : schematics_1.mergeWith(schematics_1.apply(schematics_1.url('./files/lint'), [
                schematics_1.template(Object.assign({ utils: core_1.strings }, options, { tsLintRoot,
                    relativePathToWorkspaceRoot,
                    prefix })),
            ])),
            schematics_1.schematic('module', {
                name: 'app',
                commonModule: false,
                flat: true,
                routing: options.routing,
                routingScope: 'Root',
                path: sourceDir,
                project: options.name,
            }),
            schematics_1.schematic('component', Object.assign({ name: 'app', selector: appRootSelector, flat: true, path: sourceDir, skipImport: true, project: options.name }, componentOptions)),
            schematics_1.mergeWith(schematics_1.apply(schematics_1.url('./other-files'), [
                componentOptions.inlineTemplate ? schematics_1.filter(path => !path.endsWith('.html')) : schematics_1.noop(),
                componentOptions.skipTests ? schematics_1.filter(path => !/[.|-]spec.ts$/.test(path)) : schematics_1.noop(),
                schematics_1.template(Object.assign({ utils: core_1.strings }, options, { selector: appRootSelector }, componentOptions)),
                schematics_1.move(sourceDir),
            ]), schematics_1.MergeStrategy.Overwrite),
            options.minimal ? schematics_1.noop() : schematics_1.schematic('e2e', e2eOptions),
            options.skipPackageJson ? schematics_1.noop() : addDependenciesToPackageJson(options),
            options.lintFix ? lint_fix_1.applyLintFix(sourceDir) : schematics_1.noop(),
        ]);
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3NjaGVtYXRpY3MvYW5ndWxhci9hcHBsaWNhdGlvbi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQUFzRjtBQUN0RiwyREFlb0M7QUFDcEMsNERBQTBFO0FBRzFFLDhDQUcyQjtBQUMzQiwwREFBdUY7QUFDdkYsZ0VBQTREO0FBQzVELGtEQUFtRDtBQUNuRCxzREFBNEQ7QUFDNUQsa0VBS3FDO0FBSXJDLG9CQUFvQjtBQUNwQixzQ0FBc0M7QUFDdEMsOEJBQThCO0FBQzlCLHlCQUF5QjtBQUN6QiwwQkFBMEI7QUFDMUIsc0JBQXNCO0FBQ3RCLGdCQUFnQjtBQUNoQixNQUFNO0FBQ04sOERBQThEO0FBRTlELHNDQUFzQztBQUN0Qyx1QkFBdUI7QUFDdkIsZ0VBQWdFO0FBQ2hFLDJGQUEyRjtBQUMzRixNQUFNO0FBRU4seUJBQXlCO0FBQ3pCLDJCQUEyQjtBQUMzQixXQUFXO0FBQ1gseUZBQXlGO0FBQ3pGLGdDQUFnQztBQUNoQyxPQUFPO0FBQ1AsSUFBSTtBQUVKLFNBQVMsNEJBQTRCLENBQUMsT0FBMkI7SUFDL0QsT0FBTyxDQUFDLElBQVUsRUFBRSxPQUF5QixFQUFFLEVBQUU7UUFDL0M7WUFDRTtnQkFDRSxJQUFJLEVBQUUsaUNBQWtCLENBQUMsR0FBRztnQkFDNUIsSUFBSSxFQUFFLHVCQUF1QjtnQkFDN0IsT0FBTyxFQUFFLGdDQUFjLENBQUMsT0FBTzthQUNoQztZQUNEO2dCQUNFLElBQUksRUFBRSxpQ0FBa0IsQ0FBQyxHQUFHO2dCQUM1QixJQUFJLEVBQUUsK0JBQStCO2dCQUNyQyxPQUFPLEVBQUUsZ0NBQWMsQ0FBQyxrQkFBa0I7YUFDM0M7WUFDRDtnQkFDRSxJQUFJLEVBQUUsaUNBQWtCLENBQUMsR0FBRztnQkFDNUIsSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLE9BQU8sRUFBRSxnQ0FBYyxDQUFDLFVBQVU7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QixnQkFBZ0IsRUFDbkI7Z0JBQ0YsaUJBQUksQ0FBQyxTQUFTLENBQUM7YUFDaEIsQ0FBQyxFQUFFLDBCQUFhLENBQUMsU0FBUyxDQUFDO1lBQzlCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGlCQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsc0JBQVMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDO1lBQ3ZELE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGlCQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsT0FBTyxDQUFDO1lBQ3hFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHVCQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFJLEVBQUU7U0FDbkQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQTNIRCw0QkEySEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBKc29uT2JqZWN0LCBqb2luLCBub3JtYWxpemUsIHJlbGF0aXZlLCBzdHJpbmdzIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHtcbiAgTWVyZ2VTdHJhdGVneSxcbiAgUnVsZSxcbiAgU2NoZW1hdGljQ29udGV4dCxcbiAgU2NoZW1hdGljc0V4Y2VwdGlvbixcbiAgVHJlZSxcbiAgYXBwbHksXG4gIGNoYWluLFxuICBmaWx0ZXIsXG4gIG1lcmdlV2l0aCxcbiAgbW92ZSxcbiAgbm9vcCxcbiAgc2NoZW1hdGljLFxuICB0ZW1wbGF0ZSxcbiAgdXJsLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyBOb2RlUGFja2FnZUluc3RhbGxUYXNrIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdGFza3MnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIENvbXBvbmVudE9wdGlvbnMgfSBmcm9tICcuLi9jb21wb25lbnQvc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSBhcyBFMmVPcHRpb25zIH0gZnJvbSAnLi4vZTJlL3NjaGVtYSc7XG5pbXBvcnQge1xuICBhZGRQcm9qZWN0VG9Xb3Jrc3BhY2UsXG4gIGdldFdvcmtzcGFjZSxcbn0gZnJvbSAnLi4vdXRpbGl0eS9jb25maWcnO1xuaW1wb3J0IHsgTm9kZURlcGVuZGVuY3lUeXBlLCBhZGRQYWNrYWdlSnNvbkRlcGVuZGVuY3kgfSBmcm9tICcuLi91dGlsaXR5L2RlcGVuZGVuY2llcyc7XG5pbXBvcnQgeyBsYXRlc3RWZXJzaW9ucyB9IGZyb20gJy4uL3V0aWxpdHkvbGF0ZXN0LXZlcnNpb25zJztcbmltcG9ydCB7IGFwcGx5TGludEZpeCB9IGZyb20gJy4uL3V0aWxpdHkvbGludC1maXgnO1xuaW1wb3J0IHsgdmFsaWRhdGVQcm9qZWN0TmFtZSB9IGZyb20gJy4uL3V0aWxpdHkvdmFsaWRhdGlvbic7XG5pbXBvcnQge1xuICBCdWlsZGVycyxcbiAgUHJvamVjdFR5cGUsXG4gIFdvcmtzcGFjZVByb2plY3QsXG4gIFdvcmtzcGFjZVNjaGVtYSxcbn0gZnJvbSAnLi4vdXRpbGl0eS93b3Jrc3BhY2UtbW9kZWxzJztcbmltcG9ydCB7IFNjaGVtYSBhcyBBcHBsaWNhdGlvbk9wdGlvbnMgfSBmcm9tICcuL3NjaGVtYSc7XG5cblxuLy8gVE9ETzogdXNlIEpzb25BU1Rcbi8vIGZ1bmN0aW9uIGFwcGVuZFByb3BlcnR5SW5Bc3RPYmplY3QoXG4vLyAgIHJlY29yZGVyOiBVcGRhdGVSZWNvcmRlcixcbi8vICAgbm9kZTogSnNvbkFzdE9iamVjdCxcbi8vICAgcHJvcGVydHlOYW1lOiBzdHJpbmcsXG4vLyAgIHZhbHVlOiBKc29uVmFsdWUsXG4vLyAgIGluZGVudCA9IDQsXG4vLyApIHtcbi8vICAgY29uc3QgaW5kZW50U3RyID0gJ1xcbicgKyBuZXcgQXJyYXkoaW5kZW50ICsgMSkuam9pbignICcpO1xuXG4vLyAgIGlmIChub2RlLnByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xuLy8gICAgIC8vIEluc2VydCBjb21tYS5cbi8vICAgICBjb25zdCBsYXN0ID0gbm9kZS5wcm9wZXJ0aWVzW25vZGUucHJvcGVydGllcy5sZW5ndGggLSAxXTtcbi8vICAgICByZWNvcmRlci5pbnNlcnRSaWdodChsYXN0LnN0YXJ0Lm9mZnNldCArIGxhc3QudGV4dC5yZXBsYWNlKC9cXHMrJC8sICcnKS5sZW5ndGgsICcsJyk7XG4vLyAgIH1cblxuLy8gICByZWNvcmRlci5pbnNlcnRMZWZ0KFxuLy8gICAgIG5vZGUuZW5kLm9mZnNldCAtIDEsXG4vLyAgICAgJyAgJ1xuLy8gICAgICsgYFwiJHtwcm9wZXJ0eU5hbWV9XCI6ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIDIpLnJlcGxhY2UoL1xcbi9nLCBpbmRlbnRTdHIpfWBcbi8vICAgICArIGluZGVudFN0ci5zbGljZSgwLCAtMiksXG4vLyAgICk7XG4vLyB9XG5cbmZ1bmN0aW9uIGFkZERlcGVuZGVuY2llc1RvUGFja2FnZUpzb24ob3B0aW9uczogQXBwbGljYXRpb25PcHRpb25zKSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogTm9kZURlcGVuZGVuY3lUeXBlLkRldixcbiAgICAgICAgbmFtZTogJ0Bhbmd1bGFyL2NvbXBpbGVyLWNsaScsXG4gICAgICAgIHZlcnNpb246IGxhdGVzdFZlcnNpb25zLkFuZ3VsYXIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0eXBlOiBOb2RlRGVwZW5kZW5jeVR5cGUuRGV2LFxuICAgICAgICBuYW1lOiAnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXInLFxuICAgICAgICB2ZXJzaW9uOiBsYXRlc3RWZXJzaW9ucy5EZXZraXRCdWlsZEFuZ3VsYXIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0eXBlOiBOb2RlRGVwZW5kZW5jeVR5cGUuRGV2LFxuICAgICAgICBuYW1lOiAndHlwZXNjcmlwdCcsXG4gICAgICAgIHZlcnNpb246IGxhdGVzdFZlcnNpb25zLlR5cGVTY3JpcHQsXG4gICAgICB9LFxuICAgIF0uZm9yRWFjaChkZXBlbmRlbmN5ID0+IGFkZFBhY2thZ2VKc29uRGVwZW5kZW5jeShob3N0LCBkZXBlbmRlbmN5KSk7XG5cbiAgICBpZiAoIW9wdGlvbnMuc2tpcEluc3RhbGwpIHtcbiAgICAgIGNvbnRleHQuYWRkVGFzayhuZXcgTm9kZVBhY2thZ2VJbnN0YWxsVGFzaygpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkQXBwVG9Xb3Jrc3BhY2VGaWxlKG9wdGlvbnM6IEFwcGxpY2F0aW9uT3B0aW9ucywgd29ya3NwYWNlOiBXb3Jrc3BhY2VTY2hlbWEpOiBSdWxlIHtcbiAgLy8gVE9ETzogdXNlIEpzb25BU1RcbiAgLy8gY29uc3Qgd29ya3NwYWNlUGF0aCA9ICcvYW5ndWxhci5qc29uJztcbiAgLy8gY29uc3Qgd29ya3NwYWNlQnVmZmVyID0gaG9zdC5yZWFkKHdvcmtzcGFjZVBhdGgpO1xuICAvLyBpZiAod29ya3NwYWNlQnVmZmVyID09PSBudWxsKSB7XG4gIC8vICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYENvbmZpZ3VyYXRpb24gZmlsZSAoJHt3b3Jrc3BhY2VQYXRofSkgbm90IGZvdW5kLmApO1xuICAvLyB9XG4gIC8vIGNvbnN0IHdvcmtzcGFjZUpzb24gPSBwYXJzZUpzb24od29ya3NwYWNlQnVmZmVyLnRvU3RyaW5nKCkpO1xuICAvLyBpZiAod29ya3NwYWNlSnNvbi52YWx1ZSA9PT0gbnVsbCkge1xuICAvLyAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBVbmFibGUgdG8gcGFyc2UgY29uZmlndXJhdGlvbiBmaWxlICgke3dvcmtzcGFjZVBhdGh9KS5gKTtcbiAgLy8gfVxuICBsZXQgcHJvamVjdFJvb3QgPSBvcHRpb25zLnByb2plY3RSb290ICE9PSB1bmRlZmluZWRcbiAgICA/IG9wdGlvbnMucHJvamVjdFJvb3RcbiAgICA6IGAke3dvcmtzcGFjZS5uZXdQcm9qZWN0Um9vdH0vJHtvcHRpb25zLm5hbWV9YDtcbiAgaWYgKHByb2plY3RSb290ICE9PSAnJyAmJiAhcHJvamVjdFJvb3QuZW5kc1dpdGgoJy8nKSkge1xuICAgIHByb2plY3RSb290ICs9ICcvJztcbiAgfVxuICBjb25zdCByb290RmlsZXNSb290ID0gb3B0aW9ucy5wcm9qZWN0Um9vdCA9PT0gdW5kZWZpbmVkXG4gICAgPyBwcm9qZWN0Um9vdFxuICAgIDogcHJvamVjdFJvb3QgKyAnc3JjLyc7XG5cbiAgY29uc3Qgc2NoZW1hdGljczogSnNvbk9iamVjdCA9IHt9O1xuXG4gIGlmIChvcHRpb25zLmlubGluZVRlbXBsYXRlID09PSB0cnVlXG4gICAgfHwgb3B0aW9ucy5pbmxpbmVTdHlsZSA9PT0gdHJ1ZVxuICAgIHx8IG9wdGlvbnMuc3R5bGUgIT09ICdjc3MnKSB7XG4gICAgc2NoZW1hdGljc1snQHNjaGVtYXRpY3MvYW5ndWxhcjpjb21wb25lbnQnXSA9IHt9O1xuICAgIGlmIChvcHRpb25zLmlubGluZVRlbXBsYXRlID09PSB0cnVlKSB7XG4gICAgICAoc2NoZW1hdGljc1snQHNjaGVtYXRpY3MvYW5ndWxhcjpjb21wb25lbnQnXSBhcyBKc29uT2JqZWN0KS5pbmxpbmVUZW1wbGF0ZSA9IHRydWU7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmlubGluZVN0eWxlID09PSB0cnVlKSB7XG4gICAgICAoc2NoZW1hdGljc1snQHNjaGVtYXRpY3MvYW5ndWxhcjpjb21wb25lbnQnXSBhcyBKc29uT2JqZWN0KS5pbmxpbmVTdHlsZSA9IHRydWU7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLnN0eWxlICYmIG9wdGlvbnMuc3R5bGUgIT09ICdjc3MnKSB7XG4gICAgICAoc2NoZW1hdGljc1snQHNjaGVtYXRpY3MvYW5ndWxhcjpjb21wb25lbnQnXSBhcyBKc29uT2JqZWN0KS5zdHlsZWV4dCA9IG9wdGlvbnMuc3R5bGU7XG4gICAgfVxuICB9XG5cbiAgaWYgKG9wdGlvbnMuc2tpcFRlc3RzID09PSB0cnVlKSB7XG4gICAgWydjbGFzcycsICdjb21wb25lbnQnLCAnZGlyZWN0aXZlJywgJ2d1YXJkJywgJ21vZHVsZScsICdwaXBlJywgJ3NlcnZpY2UnXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBpZiAoIShgQHNjaGVtYXRpY3MvYW5ndWxhcjoke3R5cGV9YCBpbiBzY2hlbWF0aWNzKSkge1xuICAgICAgICBzY2hlbWF0aWNzW2BAc2NoZW1hdGljcy9hbmd1bGFyOiR7dHlwZX1gXSA9IHt9O1xuICAgICAgfVxuICAgICAgKHNjaGVtYXRpY3NbYEBzY2hlbWF0aWNzL2FuZ3VsYXI6JHt0eXBlfWBdIGFzIEpzb25PYmplY3QpLnNraXBUZXN0cyA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICBjb25zdCBwcm9qZWN0OiBXb3Jrc3BhY2VQcm9qZWN0ID0ge1xuICAgIHJvb3Q6IHByb2plY3RSb290LFxuICAgIHNvdXJjZVJvb3Q6IGpvaW4obm9ybWFsaXplKHByb2plY3RSb290KSwgJ3NyYycpLFxuICAgIHByb2plY3RUeXBlOiBQcm9qZWN0VHlwZS5BcHBsaWNhdGlvbixcbiAgICBwcmVmaXg6IG9wdGlvbnMucHJlZml4IHx8ICdhcHAnLFxuICAgIHNjaGVtYXRpY3MsXG4gICAgYXJjaGl0ZWN0OiB7XG4gICAgICBidWlsZDoge1xuICAgICAgICBidWlsZGVyOiBCdWlsZGVycy5Ccm93c2VyLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgb3V0cHV0UGF0aDogYGRpc3QvJHtvcHRpb25zLm5hbWV9YCxcbiAgICAgICAgICBpbmRleDogYCR7cHJvamVjdFJvb3R9c3JjL2luZGV4Lmh0bWxgLFxuICAgICAgICAgIG1haW46IGAke3Byb2plY3RSb290fXNyYy9tYWluLnRzYCxcbiAgICAgICAgICBwb2x5ZmlsbHM6IGAke3Byb2plY3RSb290fXNyYy9wb2x5ZmlsbHMudHNgLFxuICAgICAgICAgIHRzQ29uZmlnOiBgJHtyb290RmlsZXNSb290fXRzY29uZmlnLmFwcC5qc29uYCxcbiAgICAgICAgICBhc3NldHM6IFtcbiAgICAgICAgICAgIGpvaW4obm9ybWFsaXplKHByb2plY3RSb290KSwgJ3NyYycsICdmYXZpY29uLmljbycpLFxuICAgICAgICAgICAgam9pbihub3JtYWxpemUocHJvamVjdFJvb3QpLCAnc3JjJywgJ2Fzc2V0cycpLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgc3R5bGVzOiBbXG4gICAgICAgICAgICBgJHtwcm9qZWN0Um9vdH1zcmMvc3R5bGVzLiR7b3B0aW9ucy5zdHlsZX1gLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgc2NyaXB0czogW10sXG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyYXRpb25zOiB7XG4gICAgICAgICAgcHJvZHVjdGlvbjoge1xuICAgICAgICAgICAgZmlsZVJlcGxhY2VtZW50czogW3tcbiAgICAgICAgICAgICAgcmVwbGFjZTogYCR7cHJvamVjdFJvb3R9c3JjL2Vudmlyb25tZW50cy9lbnZpcm9ubWVudC50c2AsXG4gICAgICAgICAgICAgIHdpdGg6IGAke3Byb2plY3RSb290fXNyYy9lbnZpcm9ubWVudHMvZW52aXJvbm1lbnQucHJvZC50c2AsXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIG9wdGltaXphdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIG91dHB1dEhhc2hpbmc6ICdhbGwnLFxuICAgICAgICAgICAgc291cmNlTWFwOiBmYWxzZSxcbiAgICAgICAgICAgIGV4dHJhY3RDc3M6IHRydWUsXG4gICAgICAgICAgICBuYW1lZENodW5rczogZmFsc2UsXG4gICAgICAgICAgICBhb3Q6IHRydWUsXG4gICAgICAgICAgICBleHRyYWN0TGljZW5zZXM6IHRydWUsXG4gICAgICAgICAgICB2ZW5kb3JDaHVuazogZmFsc2UsXG4gICAgICAgICAgICBidWlsZE9wdGltaXplcjogdHJ1ZSxcbiAgICAgICAgICAgIGJ1ZGdldHM6IFt7XG4gICAgICAgICAgICAgIHR5cGU6ICdpbml0aWFsJyxcbiAgICAgICAgICAgICAgbWF4aW11bVdhcm5pbmc6ICcybWInLFxuICAgICAgICAgICAgICBtYXhpbXVtRXJyb3I6ICc1bWInLFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBzZXJ2ZToge1xuICAgICAgICBidWlsZGVyOiBCdWlsZGVycy5EZXZTZXJ2ZXIsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBicm93c2VyVGFyZ2V0OiBgJHtvcHRpb25zLm5hbWV9OmJ1aWxkYCxcbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJhdGlvbnM6IHtcbiAgICAgICAgICBwcm9kdWN0aW9uOiB7XG4gICAgICAgICAgICBicm93c2VyVGFyZ2V0OiBgJHtvcHRpb25zLm5hbWV9OmJ1aWxkOnByb2R1Y3Rpb25gLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgJ2V4dHJhY3QtaTE4bic6IHtcbiAgICAgICAgYnVpbGRlcjogQnVpbGRlcnMuRXh0cmFjdEkxOG4sXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBicm93c2VyVGFyZ2V0OiBgJHtvcHRpb25zLm5hbWV9OmJ1aWxkYCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0ZXN0OiB7XG4gICAgICAgIGJ1aWxkZXI6IEJ1aWxkZXJzLkthcm1hLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgbWFpbjogYCR7cHJvamVjdFJvb3R9c3JjL3Rlc3QudHNgLFxuICAgICAgICAgIHBvbHlmaWxsczogYCR7cHJvamVjdFJvb3R9c3JjL3BvbHlmaWxscy50c2AsXG4gICAgICAgICAgdHNDb25maWc6IGAke3Jvb3RGaWxlc1Jvb3R9dHNjb25maWcuc3BlYy5qc29uYCxcbiAgICAgICAgICBrYXJtYUNvbmZpZzogYCR7cm9vdEZpbGVzUm9vdH1rYXJtYS5jb25mLmpzYCxcbiAgICAgICAgICBzdHlsZXM6IFtcbiAgICAgICAgICAgIGAke3Byb2plY3RSb290fXNyYy9zdHlsZXMuJHtvcHRpb25zLnN0eWxlfWAsXG4gICAgICAgICAgXSxcbiAgICAgICAgICBzY3JpcHRzOiBbXSxcbiAgICAgICAgICBhc3NldHM6IFtcbiAgICAgICAgICAgIGpvaW4obm9ybWFsaXplKHByb2plY3RSb290KSwgJ3NyYycsICdmYXZpY29uLmljbycpLFxuICAgICAgICAgICAgam9pbihub3JtYWxpemUocHJvamVjdFJvb3QpLCAnc3JjJywgJ2Fzc2V0cycpLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgbGludDoge1xuICAgICAgICBidWlsZGVyOiBCdWlsZGVycy5Uc0xpbnQsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICB0c0NvbmZpZzogW1xuICAgICAgICAgICAgYCR7cm9vdEZpbGVzUm9vdH10c2NvbmZpZy5hcHAuanNvbmAsXG4gICAgICAgICAgICBgJHtyb290RmlsZXNSb290fXRzY29uZmlnLnNwZWMuanNvbmAsXG4gICAgICAgICAgXSxcbiAgICAgICAgICBleGNsdWRlOiBbXG4gICAgICAgICAgICAnKiovbm9kZV9tb2R1bGVzLyoqJyxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tYW55XG4gIC8vIGNvbnN0IHByb2plY3RzOiBKc29uT2JqZWN0ID0gKDxhbnk+IHdvcmtzcGFjZUFzdC52YWx1ZSkucHJvamVjdHMgfHwge307XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgLy8gaWYgKCEoPGFueT4gd29ya3NwYWNlQXN0LnZhbHVlKS5wcm9qZWN0cykge1xuICAvLyAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1hbnlcbiAgLy8gICAoPGFueT4gd29ya3NwYWNlQXN0LnZhbHVlKS5wcm9qZWN0cyA9IHByb2plY3RzO1xuICAvLyB9XG5cbiAgcmV0dXJuIGFkZFByb2plY3RUb1dvcmtzcGFjZSh3b3Jrc3BhY2UsIG9wdGlvbnMubmFtZSwgcHJvamVjdCk7XG59XG5cbmZ1bmN0aW9uIG1pbmltYWxQYXRoRmlsdGVyKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCB0b1JlbW92ZUxpc3QgPSAvKHRlc3QudHN8dHNjb25maWcuc3BlYy5qc29ufGthcm1hLmNvbmYuanMpJC87XG5cbiAgcmV0dXJuICF0b1JlbW92ZUxpc3QudGVzdChwYXRoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9wdGlvbnM6IEFwcGxpY2F0aW9uT3B0aW9ucyk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBpZiAoIW9wdGlvbnMubmFtZSkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYEludmFsaWQgb3B0aW9ucywgXCJuYW1lXCIgaXMgcmVxdWlyZWQuYCk7XG4gICAgfVxuICAgIHZhbGlkYXRlUHJvamVjdE5hbWUob3B0aW9ucy5uYW1lKTtcbiAgICBjb25zdCBwcmVmaXggPSBvcHRpb25zLnByZWZpeCB8fCAnYXBwJztcbiAgICBjb25zdCBhcHBSb290U2VsZWN0b3IgPSBgJHtwcmVmaXh9LXJvb3RgO1xuICAgIGNvbnN0IGNvbXBvbmVudE9wdGlvbnM6IFBhcnRpYWw8Q29tcG9uZW50T3B0aW9ucz4gPSAhb3B0aW9ucy5taW5pbWFsID9cbiAgICAgIHtcbiAgICAgICAgaW5saW5lU3R5bGU6IG9wdGlvbnMuaW5saW5lU3R5bGUsXG4gICAgICAgIGlubGluZVRlbXBsYXRlOiBvcHRpb25zLmlubGluZVRlbXBsYXRlLFxuICAgICAgICBza2lwVGVzdHM6IG9wdGlvbnMuc2tpcFRlc3RzLFxuICAgICAgICBzdHlsZTogb3B0aW9ucy5zdHlsZSxcbiAgICAgICAgdmlld0VuY2Fwc3VsYXRpb246IG9wdGlvbnMudmlld0VuY2Fwc3VsYXRpb24sXG4gICAgICB9IDpcbiAgICAgIHtcbiAgICAgICAgaW5saW5lU3R5bGU6IHRydWUsXG4gICAgICAgIGlubGluZVRlbXBsYXRlOiB0cnVlLFxuICAgICAgICBza2lwVGVzdHM6IHRydWUsXG4gICAgICAgIHN0eWxlOiBvcHRpb25zLnN0eWxlLFxuICAgICAgfTtcblxuICAgIGNvbnN0IHdvcmtzcGFjZSA9IGdldFdvcmtzcGFjZShob3N0KTtcbiAgICBsZXQgbmV3UHJvamVjdFJvb3QgPSB3b3Jrc3BhY2UubmV3UHJvamVjdFJvb3Q7XG4gICAgbGV0IGFwcERpciA9IGAke25ld1Byb2plY3RSb290fS8ke29wdGlvbnMubmFtZX1gO1xuICAgIGxldCBzb3VyY2VSb290ID0gYCR7YXBwRGlyfS9zcmNgO1xuICAgIGxldCBzb3VyY2VEaXIgPSBgJHtzb3VyY2VSb290fS9hcHBgO1xuICAgIGxldCByZWxhdGl2ZVBhdGhUb1dvcmtzcGFjZVJvb3QgPSBhcHBEaXIuc3BsaXQoJy8nKS5tYXAoeCA9PiAnLi4nKS5qb2luKCcvJyk7XG4gICAgY29uc3Qgcm9vdEluU3JjID0gb3B0aW9ucy5wcm9qZWN0Um9vdCAhPT0gdW5kZWZpbmVkO1xuICAgIGlmIChvcHRpb25zLnByb2plY3RSb290ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG5ld1Byb2plY3RSb290ID0gb3B0aW9ucy5wcm9qZWN0Um9vdDtcbiAgICAgIGFwcERpciA9IGAke25ld1Byb2plY3RSb290fS9zcmNgO1xuICAgICAgc291cmNlUm9vdCA9IGFwcERpcjtcbiAgICAgIHNvdXJjZURpciA9IGAke3NvdXJjZVJvb3R9L2FwcGA7XG4gICAgICByZWxhdGl2ZVBhdGhUb1dvcmtzcGFjZVJvb3QgPSByZWxhdGl2ZShub3JtYWxpemUoJy8nICsgc291cmNlUm9vdCksIG5vcm1hbGl6ZSgnLycpKTtcbiAgICAgIGlmIChyZWxhdGl2ZVBhdGhUb1dvcmtzcGFjZVJvb3QgPT09ICcnKSB7XG4gICAgICAgIHJlbGF0aXZlUGF0aFRvV29ya3NwYWNlUm9vdCA9ICcuJztcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgdHNMaW50Um9vdCA9IGFwcERpcjtcblxuICAgIGNvbnN0IGUyZU9wdGlvbnM6IEUyZU9wdGlvbnMgPSB7XG4gICAgICBuYW1lOiBgJHtvcHRpb25zLm5hbWV9LWUyZWAsXG4gICAgICByZWxhdGVkQXBwTmFtZTogb3B0aW9ucy5uYW1lLFxuICAgICAgcm9vdFNlbGVjdG9yOiBhcHBSb290U2VsZWN0b3IsXG4gICAgICBwcm9qZWN0Um9vdDogbmV3UHJvamVjdFJvb3QgPyBgJHtuZXdQcm9qZWN0Um9vdH0vJHtvcHRpb25zLm5hbWV9LWUyZWAgOiAnZTJlJyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGNoYWluKFtcbiAgICAgIGFkZEFwcFRvV29ya3NwYWNlRmlsZShvcHRpb25zLCB3b3Jrc3BhY2UpLFxuICAgICAgbWVyZ2VXaXRoKFxuICAgICAgICBhcHBseSh1cmwoJy4vZmlsZXMvc3JjJyksIFtcbiAgICAgICAgICBvcHRpb25zLm1pbmltYWwgPyBmaWx0ZXIobWluaW1hbFBhdGhGaWx0ZXIpIDogbm9vcCgpLFxuICAgICAgICAgIHRlbXBsYXRlKHtcbiAgICAgICAgICAgIHV0aWxzOiBzdHJpbmdzLFxuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgICdkb3QnOiAnLicsXG4gICAgICAgICAgICByZWxhdGl2ZVBhdGhUb1dvcmtzcGFjZVJvb3QsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbW92ZShzb3VyY2VSb290KSxcbiAgICAgICAgXSkpLFxuICAgICAgbWVyZ2VXaXRoKFxuICAgICAgICBhcHBseSh1cmwoJy4vZmlsZXMvcm9vdCcpLCBbXG4gICAgICAgICAgb3B0aW9ucy5taW5pbWFsID8gZmlsdGVyKG1pbmltYWxQYXRoRmlsdGVyKSA6IG5vb3AoKSxcbiAgICAgICAgICB0ZW1wbGF0ZSh7XG4gICAgICAgICAgICB1dGlsczogc3RyaW5ncyxcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICAnZG90JzogJy4nLFxuICAgICAgICAgICAgcmVsYXRpdmVQYXRoVG9Xb3Jrc3BhY2VSb290LFxuICAgICAgICAgICAgcm9vdEluU3JjLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG1vdmUoYXBwRGlyKSxcbiAgICAgICAgXSkpLFxuICAgICAgb3B0aW9ucy5taW5pbWFsID8gbm9vcCgpIDogbWVyZ2VXaXRoKFxuICAgICAgICBhcHBseSh1cmwoJy4vZmlsZXMvbGludCcpLCBbXG4gICAgICAgICAgdGVtcGxhdGUoe1xuICAgICAgICAgICAgdXRpbHM6IHN0cmluZ3MsXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgdHNMaW50Um9vdCxcbiAgICAgICAgICAgIHJlbGF0aXZlUGF0aFRvV29ya3NwYWNlUm9vdCxcbiAgICAgICAgICAgIHByZWZpeCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICAvLyBUT0RPOiBNb3Zpbmcgc2hvdWxkIHdvcmsgYnV0IGlzIGJ1Z2dlZCByaWdodCBub3cuXG4gICAgICAgICAgLy8gVGhlIF9fdHNMaW50Um9vdF9fIGlzIGJlaW5nIHVzZWQgbWVhbndoaWxlLlxuICAgICAgICAgIC8vIE90aGVyd2lzZSB0aGUgdHNsaW50Lmpzb24gZmlsZSBjb3VsZCBiZSBpbnNpZGUgb2YgdGhlIHJvb3QgZm9sZGVyIGFuZFxuICAgICAgICAgIC8vIHRoaXMgYmxvY2sgYW5kIHRoZSBsaW50IGZvbGRlciBjb3VsZCBiZSByZW1vdmVkLlxuICAgICAgICBdKSksXG4gICAgICBzY2hlbWF0aWMoJ21vZHVsZScsIHtcbiAgICAgICAgbmFtZTogJ2FwcCcsXG4gICAgICAgIGNvbW1vbk1vZHVsZTogZmFsc2UsXG4gICAgICAgIGZsYXQ6IHRydWUsXG4gICAgICAgIHJvdXRpbmc6IG9wdGlvbnMucm91dGluZyxcbiAgICAgICAgcm91dGluZ1Njb3BlOiAnUm9vdCcsXG4gICAgICAgIHBhdGg6IHNvdXJjZURpcixcbiAgICAgICAgcHJvamVjdDogb3B0aW9ucy5uYW1lLFxuICAgICAgfSksXG4gICAgICBzY2hlbWF0aWMoJ2NvbXBvbmVudCcsIHtcbiAgICAgICAgbmFtZTogJ2FwcCcsXG4gICAgICAgIHNlbGVjdG9yOiBhcHBSb290U2VsZWN0b3IsXG4gICAgICAgIGZsYXQ6IHRydWUsXG4gICAgICAgIHBhdGg6IHNvdXJjZURpcixcbiAgICAgICAgc2tpcEltcG9ydDogdHJ1ZSxcbiAgICAgICAgcHJvamVjdDogb3B0aW9ucy5uYW1lLFxuICAgICAgICAuLi5jb21wb25lbnRPcHRpb25zLFxuICAgICAgfSksXG4gICAgICBtZXJnZVdpdGgoXG4gICAgICAgIGFwcGx5KHVybCgnLi9vdGhlci1maWxlcycpLCBbXG4gICAgICAgICAgY29tcG9uZW50T3B0aW9ucy5pbmxpbmVUZW1wbGF0ZSA/IGZpbHRlcihwYXRoID0+ICFwYXRoLmVuZHNXaXRoKCcuaHRtbCcpKSA6IG5vb3AoKSxcbiAgICAgICAgICBjb21wb25lbnRPcHRpb25zLnNraXBUZXN0cyA/IGZpbHRlcihwYXRoID0+ICEvWy58LV1zcGVjLnRzJC8udGVzdChwYXRoKSkgOiBub29wKCksXG4gICAgICAgICAgdGVtcGxhdGUoe1xuICAgICAgICAgICAgdXRpbHM6IHN0cmluZ3MsXG4gICAgICAgICAgICAuLi5vcHRpb25zIGFzIGFueSwgIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm8tYW55XG4gICAgICAgICAgICBzZWxlY3RvcjogYXBwUm9vdFNlbGVjdG9yLFxuICAgICAgICAgICAgLi4uY29tcG9uZW50T3B0aW9ucyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBtb3ZlKHNvdXJjZURpciksXG4gICAgICAgIF0pLCBNZXJnZVN0cmF0ZWd5Lk92ZXJ3cml0ZSksXG4gICAgICBvcHRpb25zLm1pbmltYWwgPyBub29wKCkgOiBzY2hlbWF0aWMoJ2UyZScsIGUyZU9wdGlvbnMpLFxuICAgICAgb3B0aW9ucy5za2lwUGFja2FnZUpzb24gPyBub29wKCkgOiBhZGREZXBlbmRlbmNpZXNUb1BhY2thZ2VKc29uKG9wdGlvbnMpLFxuICAgICAgb3B0aW9ucy5saW50Rml4ID8gYXBwbHlMaW50Rml4KHNvdXJjZURpcikgOiBub29wKCksXG4gICAgXSk7XG4gIH07XG59XG4iXX0=