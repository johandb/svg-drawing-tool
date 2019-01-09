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
const ts = require("typescript");
const ast_utils_1 = require("../utility/ast-utils");
const change_1 = require("../utility/change");
const config_1 = require("../utility/config");
const dependencies_1 = require("../utility/dependencies");
const ng_ast_utils_1 = require("../utility/ng-ast-utils");
const project_1 = require("../utility/project");
const project_targets_1 = require("../utility/project-targets");
const workspace_models_1 = require("../utility/workspace-models");
function getFileReplacements(target) {
    const fileReplacements = target.build &&
        target.build.configurations &&
        target.build.configurations.production &&
        target.build.configurations.production.fileReplacements;
    return fileReplacements || [];
}
function updateConfigFile(options, tsConfigDirectory) {
    return (host) => {
        const workspace = config_1.getWorkspace(host);
        const clientProject = project_1.getProject(workspace, options.clientProject);
        const projectTargets = project_targets_1.getProjectTargets(clientProject);
        projectTargets.server = {
            builder: workspace_models_1.Builders.Server,
            options: {
                outputPath: `dist/${options.clientProject}-server`,
                main: `${clientProject.root}src/main.server.ts`,
                tsConfig: core_1.join(tsConfigDirectory, `${options.tsconfigFileName}.json`),
            },
            configurations: {
                production: {
                    fileReplacements: getFileReplacements(projectTargets),
                    sourceMap: false,
                    optimization: {
                        scripts: false,
                        styles: true,
                    },
                },
            },
        };
        return config_1.updateWorkspace(workspace);
    };
}
function findBrowserModuleImport(host, modulePath) {
    const moduleBuffer = host.read(modulePath);
    if (!moduleBuffer) {
        throw new schematics_1.SchematicsException(`Module file (${modulePath}) not found`);
    }
    const moduleFileText = moduleBuffer.toString('utf-8');
    const source = ts.createSourceFile(modulePath, moduleFileText, ts.ScriptTarget.Latest, true);
    const decoratorMetadata = ast_utils_1.getDecoratorMetadata(source, 'NgModule', '@angular/core')[0];
    const browserModuleNode = ast_utils_1.findNode(decoratorMetadata, ts.SyntaxKind.Identifier, 'BrowserModule');
    if (browserModuleNode === null) {
        throw new schematics_1.SchematicsException(`Cannot find BrowserModule import in ${modulePath}`);
    }
    return browserModuleNode;
}
function wrapBootstrapCall(options) {
    return (host) => {
        const clientTargets = project_targets_1.getProjectTargets(host, options.clientProject);
        if (!clientTargets.build) {
            throw project_targets_1.targetBuildNotFoundError();
        }
        const mainPath = core_1.normalize('/' + clientTargets.build.options.main);
        let bootstrapCall = ng_ast_utils_1.findBootstrapModuleCall(host, mainPath);
        if (bootstrapCall === null) {
            throw new schematics_1.SchematicsException('Bootstrap module not found.');
        }
        let bootstrapCallExpression = null;
        let currentCall = bootstrapCall;
        while (bootstrapCallExpression === null && currentCall.parent) {
            currentCall = currentCall.parent;
            if (ts.isExpressionStatement(currentCall) || ts.isVariableStatement(currentCall)) {
                bootstrapCallExpression = currentCall;
            }
        }
        bootstrapCall = currentCall;
        // In case the bootstrap code is a variable statement
        // we need to determine it's usage
        if (bootstrapCallExpression && ts.isVariableStatement(bootstrapCallExpression)) {
            const declaration = bootstrapCallExpression.declarationList.declarations[0];
            const bootstrapVar = declaration.name.text;
            const sf = bootstrapCallExpression.getSourceFile();
            bootstrapCall = findCallExpressionNode(sf, bootstrapVar) || currentCall;
        }
        // indent contents
        const triviaWidth = bootstrapCall.getLeadingTriviaWidth();
        const beforeText = `document.addEventListener('DOMContentLoaded', () => {\n`
            + ' '.repeat(triviaWidth > 2 ? triviaWidth + 1 : triviaWidth);
        const afterText = `\n${triviaWidth > 2 ? ' '.repeat(triviaWidth - 1) : ''});`;
        // in some cases we need to cater for a trailing semicolon such as;
        // bootstrap().catch(err => console.log(err));
        const lastToken = bootstrapCall.parent.getLastToken();
        let endPos = bootstrapCall.getEnd();
        if (lastToken && lastToken.kind === ts.SyntaxKind.SemicolonToken) {
            endPos = lastToken.getEnd();
        }
        const recorder = host.beginUpdate(mainPath);
        recorder.insertLeft(bootstrapCall.getStart(), beforeText);
        recorder.insertRight(endPos, afterText);
        host.commitUpdate(recorder);
    };
}
function findCallExpressionNode(node, text) {
    if (ts.isCallExpression(node)
        && ts.isIdentifier(node.expression)
        && node.expression.text === text) {
        return node;
    }
    let foundNode = null;
    ts.forEachChild(node, childNode => {
        foundNode = findCallExpressionNode(childNode, text);
        if (foundNode) {
            return true;
        }
    });
    return foundNode;
}
function addServerTransition(options) {
    return (host) => {
        const clientProject = project_1.getProject(host, options.clientProject);
        const clientTargets = project_targets_1.getProjectTargets(clientProject);
        if (!clientTargets.build) {
            throw project_targets_1.targetBuildNotFoundError();
        }
        const mainPath = core_1.normalize('/' + clientTargets.build.options.main);
        const bootstrapModuleRelativePath = ng_ast_utils_1.findBootstrapModulePath(host, mainPath);
        const bootstrapModulePath = core_1.normalize(`/${clientProject.root}/src/${bootstrapModuleRelativePath}.ts`);
        const browserModuleImport = findBrowserModuleImport(host, bootstrapModulePath);
        const appId = options.appId;
        const transitionCall = `.withServerTransition({ appId: '${appId}' })`;
        const position = browserModuleImport.pos + browserModuleImport.getFullText().length;
        const transitionCallChange = new change_1.InsertChange(bootstrapModulePath, position, transitionCall);
        const transitionCallRecorder = host.beginUpdate(bootstrapModulePath);
        transitionCallRecorder.insertLeft(transitionCallChange.pos, transitionCallChange.toAdd);
        host.commitUpdate(transitionCallRecorder);
    };
}
function addDependencies() {
    return (host) => {
        const coreDep = dependencies_1.getPackageJsonDependency(host, '@angular/core');
        if (coreDep === null) {
            throw new schematics_1.SchematicsException('Could not find version.');
        }
        const platformServerDep = Object.assign({}, coreDep, { name: '@angular/platform-server' });
        const httpDep = Object.assign({}, coreDep, { name: '@angular/http' });
        dependencies_1.addPackageJsonDependency(host, platformServerDep);
        dependencies_1.addPackageJsonDependency(host, httpDep);
        return host;
    };
}
function getTsConfigOutDir(host, targets) {
    const tsConfigPath = targets.build.options.tsConfig;
    const tsConfigBuffer = host.read(tsConfigPath);
    if (!tsConfigBuffer) {
        throw new schematics_1.SchematicsException(`Could not read ${tsConfigPath}`);
    }
    const tsConfigContent = tsConfigBuffer.toString();
    const tsConfig = core_1.parseJson(tsConfigContent);
    if (tsConfig === null || typeof tsConfig !== 'object' || Array.isArray(tsConfig) ||
        tsConfig.compilerOptions === null || typeof tsConfig.compilerOptions !== 'object' ||
        Array.isArray(tsConfig.compilerOptions)) {
        throw new schematics_1.SchematicsException(`Invalid tsconfig - ${tsConfigPath}`);
    }
    const outDir = tsConfig.compilerOptions.outDir;
    return outDir;
}
function default_1(options) {
    return (host, context) => {
        const clientProject = project_1.getProject(host, options.clientProject);
        if (clientProject.projectType !== 'application') {
            throw new schematics_1.SchematicsException(`Universal requires a project type of "application".`);
        }
        const clientTargets = project_targets_1.getProjectTargets(clientProject);
        const outDir = getTsConfigOutDir(host, clientTargets);
        if (!clientTargets.build) {
            throw project_targets_1.targetBuildNotFoundError();
        }
        const tsConfigExtends = core_1.basename(core_1.normalize(clientTargets.build.options.tsConfig));
        const rootInSrc = clientProject.root === '';
        const tsConfigDirectory = core_1.join(core_1.normalize(clientProject.root), rootInSrc ? 'src' : '');
        if (!options.skipInstall) {
            context.addTask(new tasks_1.NodePackageInstallTask());
        }
        const templateSource = schematics_1.apply(schematics_1.url('./files/src'), [
            schematics_1.template(Object.assign({}, core_1.strings, options, { stripTsExtension: (s) => s.replace(/\.ts$/, '') })),
            schematics_1.move(core_1.join(core_1.normalize(clientProject.root), 'src')),
        ]);
        const rootSource = schematics_1.apply(schematics_1.url('./files/root'), [
            schematics_1.template(Object.assign({}, core_1.strings, options, { stripTsExtension: (s) => s.replace(/\.ts$/, ''), outDir,
                tsConfigExtends,
                rootInSrc })),
            schematics_1.move(tsConfigDirectory),
        ]);
        return schematics_1.chain([
            schematics_1.mergeWith(templateSource),
            schematics_1.mergeWith(rootSource),
            addDependencies(),
            updateConfigFile(options, tsConfigDirectory),
            wrapBootstrapCall(options),
            addServerTransition(options),
        ]);
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3NjaGVtYXRpY3MvYW5ndWxhci91bml2ZXJzYWwvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwrQ0FROEI7QUFDOUIsMkRBV29DO0FBQ3BDLDREQUUwQztBQUMxQyxpQ0FBaUM7QUFDakMsb0RBQXNFO0FBQ3RFLDhDQUFpRDtBQUNqRCw4Q0FBa0U7QUFDbEUsMERBQTZGO0FBQzdGLDBEQUEyRjtBQUMzRixnREFBZ0Q7QUFDaEQsZ0VBQXlGO0FBQ3pGLGtFQUF5RTtBQUl6RSxTQUFTLG1CQUFtQixDQUFDLE1BQXdCO0lBQ25ELE1BQU0sZ0JBQWdCLEdBQ3BCLE1BQU0sQ0FBQyxLQUFLO1FBQ1osTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjO1FBQzNCLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFVBQVU7UUFDdEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDO0lBRTFELE9BQU8sZ0JBQWdCLElBQUksRUFBRSxDQUFDO0FBQ2hDLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLE9BQXlCLEVBQUUsaUJBQXVCO0lBQzFFLE9BQU8sQ0FBQyxJQUFVLEVBQUUsRUFBRTtRQUNwQixNQUFNLFNBQVMsR0FBRyxxQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sYUFBYSxHQUFHLG9CQUFVLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNuRSxNQUFNLGNBQWMsR0FBRyxtQ0FBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV4RCxjQUFjLENBQUMsTUFBTSxHQUFHO1lBQ3RCLE9BQU8sRUFBRSwyQkFBUSxDQUFDLE1BQU07WUFDeEIsT0FBTyxFQUFFO2dCQUNQLFVBQVUsRUFBRSxRQUFRLE9BQU8sQ0FBQyxhQUFhLFNBQVM7Z0JBQ2xE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QUFFLEVBQUUsQ0FBQyxJQUN2RDtZQUNGLGlCQUFJLENBQUMsV0FBSSxDQUFDLGdCQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2pELENBQUMsQ0FBQztRQUVILE1BQU0sVUFBVSxHQUFHLGtCQUFLLENBQUMsZ0JBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUM1QyxxQkFBUSxtQkFDSCxjQUFPLEVBQ1AsT0FBaUIsSUFDcEIsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUN2RCxNQUFNO2dCQUNOLGVBQWU7Z0JBQ2YsU0FBUyxJQUNUO1lBQ0YsaUJBQUksQ0FBQyxpQkFBaUIsQ0FBQztTQUN4QixDQUFDLENBQUM7UUFFSCxPQUFPLGtCQUFLLENBQUM7WUFDWCxzQkFBUyxDQUFDLGNBQWMsQ0FBQztZQUN6QixzQkFBUyxDQUFDLFVBQVUsQ0FBQztZQUNyQixlQUFlLEVBQUU7WUFDakIsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDO1lBQzVDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztZQUMxQixtQkFBbUIsQ0FBQyxPQUFPLENBQUM7U0FDN0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWpERCw0QkFpREMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBQYXRoLFxuICBiYXNlbmFtZSxcbiAgZXhwZXJpbWVudGFsLFxuICBqb2luLFxuICBub3JtYWxpemUsXG4gIHBhcnNlSnNvbixcbiAgc3RyaW5ncyxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHtcbiAgUnVsZSxcbiAgU2NoZW1hdGljQ29udGV4dCxcbiAgU2NoZW1hdGljc0V4Y2VwdGlvbixcbiAgVHJlZSxcbiAgYXBwbHksXG4gIGNoYWluLFxuICBtZXJnZVdpdGgsXG4gIG1vdmUsXG4gIHRlbXBsYXRlLFxuICB1cmwsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7XG4gIE5vZGVQYWNrYWdlSW5zdGFsbFRhc2ssXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rhc2tzJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHsgZmluZE5vZGUsIGdldERlY29yYXRvck1ldGFkYXRhIH0gZnJvbSAnLi4vdXRpbGl0eS9hc3QtdXRpbHMnO1xuaW1wb3J0IHsgSW5zZXJ0Q2hhbmdlIH0gZnJvbSAnLi4vdXRpbGl0eS9jaGFuZ2UnO1xuaW1wb3J0IHsgZ2V0V29ya3NwYWNlLCB1cGRhdGVXb3Jrc3BhY2UgfSBmcm9tICcuLi91dGlsaXR5L2NvbmZpZyc7XG5pbXBvcnQgeyBhZGRQYWNrYWdlSnNvbkRlcGVuZGVuY3ksIGdldFBhY2thZ2VKc29uRGVwZW5kZW5jeSB9IGZyb20gJy4uL3V0aWxpdHkvZGVwZW5kZW5jaWVzJztcbmltcG9ydCB7IGZpbmRCb290c3RyYXBNb2R1bGVDYWxsLCBmaW5kQm9vdHN0cmFwTW9kdWxlUGF0aCB9IGZyb20gJy4uL3V0aWxpdHkvbmctYXN0LXV0aWxzJztcbmltcG9ydCB7IGdldFByb2plY3QgfSBmcm9tICcuLi91dGlsaXR5L3Byb2plY3QnO1xuaW1wb3J0IHsgZ2V0UHJvamVjdFRhcmdldHMsIHRhcmdldEJ1aWxkTm90Rm91bmRFcnJvciB9IGZyb20gJy4uL3V0aWxpdHkvcHJvamVjdC10YXJnZXRzJztcbmltcG9ydCB7IEJ1aWxkZXJzLCBXb3Jrc3BhY2VUYXJnZXRzIH0gZnJvbSAnLi4vdXRpbGl0eS93b3Jrc3BhY2UtbW9kZWxzJztcbmltcG9ydCB7IFNjaGVtYSBhcyBVbml2ZXJzYWxPcHRpb25zIH0gZnJvbSAnLi9zY2hlbWEnO1xuXG5cbmZ1bmN0aW9uIGdldEZpbGVSZXBsYWNlbWVudHModGFyZ2V0OiBXb3Jrc3BhY2VUYXJnZXRzKSB7XG4gIGNvbnN0IGZpbGVSZXBsYWNlbWVudHMgPVxuICAgIHRhcmdldC5idWlsZCAmJlxuICAgIHRhcmdldC5idWlsZC5jb25maWd1cmF0aW9ucyAmJlxuICAgIHRhcmdldC5idWlsZC5jb25maWd1cmF0aW9ucy5wcm9kdWN0aW9uICYmXG4gICAgdGFyZ2V0LmJ1aWxkLmNvbmZpZ3VyYXRpb25zLnByb2R1Y3Rpb24uZmlsZVJlcGxhY2VtZW50cztcblxuICByZXR1cm4gZmlsZVJlcGxhY2VtZW50cyB8fCBbXTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQ29uZmlnRmlsZShvcHRpb25zOiBVbml2ZXJzYWxPcHRpb25zLCB0c0NvbmZpZ0RpcmVjdG9yeTogUGF0aCk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBnZXRXb3Jrc3BhY2UoaG9zdCk7XG4gICAgY29uc3QgY2xpZW50UHJvamVjdCA9IGdldFByb2plY3Qod29ya3NwYWNlLCBvcHRpb25zLmNsaWVudFByb2plY3QpO1xuICAgIGNvbnN0IHByb2plY3RUYXJnZXRzID0gZ2V0UHJvamVjdFRhcmdldHMoY2xpZW50UHJvamVjdCk7XG5cbiAgICBwcm9qZWN0VGFyZ2V0cy5zZXJ2ZXIgPSB7XG4gICAgICBidWlsZGVyOiBCdWlsZGVycy5TZXJ2ZXIsXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIG91dHB1dFBhdGg6IGBkaXN0LyR7b3B0aW9ucy5jbGllbnRQcm9qZWN0fS1zZXJ2ZXJgLFxuICAgICAgICBtYWluOiBgJHtjbGllbnRQcm9qZWN0LnJvb3R9c3JjL21haW4uc2VydmVyLnRzYCxcbiAgICAgICAgdHNDb25maWc6IGpvaW4odHNDb25maWdEaXJlY3RvcnksIGAke29wdGlvbnMudHNjb25maWdGaWxlTmFtZX0uanNvbmApLFxuICAgICAgfSxcbiAgICAgIGNvbmZpZ3VyYXRpb25zOiB7XG4gICAgICAgIHByb2R1Y3Rpb246IHtcbiAgICAgICAgICBmaWxlUmVwbGFjZW1lbnRzOiBnZXRGaWxlUmVwbGFjZW1lbnRzKHByb2plY3RUYXJnZXRzKSxcbiAgICAgICAgICBzb3VyY2VNYXA6IGZhbHNlLFxuICAgICAgICAgIG9wdGltaXphdGlvbjoge1xuICAgICAgICAgICAgc2NyaXB0czogZmFsc2UsXG4gICAgICAgICAgICBzdHlsZXM6IHRydWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIHJldHVybiB1cGRhdGVXb3Jrc3BhY2Uod29ya3NwYWNlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZmluZEJyb3dzZXJNb2R1bGVJbXBvcnQoaG9zdDogVHJlZSwgbW9kdWxlUGF0aDogc3RyaW5nKTogdHMuTm9kZSB7XG4gIGNvbnN0IG1vZHVsZUJ1ZmZlciA9IGhvc3QucmVhZChtb2R1bGVQYXRoKTtcbiAgaWYgKCFtb2R1bGVCdWZmZXIpIHtcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgTW9kdWxlIGZpbGUgKCR7bW9kdWxlUGF0aH0pIG5vdCBmb3VuZGApO1xuICB9XG4gIGNvbnN0IG1vZHVsZUZpbGVUZXh0ID0gbW9kdWxlQnVmZmVyLnRvU3RyaW5nKCd1dGYtOCcpO1xuXG4gIGNvbnN0IHNvdXJjZSA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUobW9kdWxlUGF0aCwgbW9kdWxlRmlsZVRleHQsIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsIHRydWUpO1xuXG4gIGNvbnN0IGRlY29yYXRvck1ldGFkYXRhID0gZ2V0RGVjb3JhdG9yTWV0YWRhdGEoc291cmNlLCAnTmdNb2R1bGUnLCAnQGFuZ3VsYXIvY29yZScpWzBdO1xuICBjb25zdCBicm93c2VyTW9kdWxlTm9kZSA9IGZpbmROb2RlKGRlY29yYXRvck1ldGFkYXRhLCB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIsICdCcm93c2VyTW9kdWxlJyk7XG5cbiAgaWYgKGJyb3dzZXJNb2R1bGVOb2RlID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYENhbm5vdCBmaW5kIEJyb3dzZXJNb2R1bGUgaW1wb3J0IGluICR7bW9kdWxlUGF0aH1gKTtcbiAgfVxuXG4gIHJldHVybiBicm93c2VyTW9kdWxlTm9kZTtcbn1cblxuZnVuY3Rpb24gd3JhcEJvb3RzdHJhcENhbGwob3B0aW9uczogVW5pdmVyc2FsT3B0aW9ucyk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCBjbGllbnRUYXJnZXRzID0gZ2V0UHJvamVjdFRhcmdldHMoaG9zdCwgb3B0aW9ucy5jbGllbnRQcm9qZWN0KTtcbiAgICBpZiAoIWNsaWVudFRhcmdldHMuYnVpbGQpIHtcbiAgICAgIHRocm93IHRhcmdldEJ1aWxkTm90Rm91bmRFcnJvcigpO1xuICAgIH1cbiAgICBjb25zdCBtYWluUGF0aCA9IG5vcm1hbGl6ZSgnLycgKyBjbGllbnRUYXJnZXRzLmJ1aWxkLm9wdGlvbnMubWFpbik7XG4gICAgbGV0IGJvb3RzdHJhcENhbGw6IHRzLk5vZGUgfCBudWxsID0gZmluZEJvb3RzdHJhcE1vZHVsZUNhbGwoaG9zdCwgbWFpblBhdGgpO1xuICAgIGlmIChib290c3RyYXBDYWxsID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbignQm9vdHN0cmFwIG1vZHVsZSBub3QgZm91bmQuJyk7XG4gICAgfVxuXG4gICAgbGV0IGJvb3RzdHJhcENhbGxFeHByZXNzaW9uOiB0cy5Ob2RlIHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGN1cnJlbnRDYWxsID0gYm9vdHN0cmFwQ2FsbDtcbiAgICB3aGlsZSAoYm9vdHN0cmFwQ2FsbEV4cHJlc3Npb24gPT09IG51bGwgJiYgY3VycmVudENhbGwucGFyZW50KSB7XG4gICAgICBjdXJyZW50Q2FsbCA9IGN1cnJlbnRDYWxsLnBhcmVudDtcbiAgICAgIGlmICh0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQoY3VycmVudENhbGwpIHx8IHRzLmlzVmFyaWFibGVTdGF0ZW1lbnQoY3VycmVudENhbGwpKSB7XG4gICAgICAgIGJvb3RzdHJhcENhbGxFeHByZXNzaW9uID0gY3VycmVudENhbGw7XG4gICAgICB9XG4gICAgfVxuICAgIGJvb3RzdHJhcENhbGwgPSBjdXJyZW50Q2FsbDtcblxuICAgIC8vIEluIGNhc2UgdGhlIGJvb3RzdHJhcCBjb2RlIGlzIGEgdmFyaWFibGUgc3RhdGVtZW50XG4gICAgLy8gd2UgbmVlZCB0byBkZXRlcm1pbmUgaXQncyB1c2FnZVxuICAgIGlmIChib290c3RyYXBDYWxsRXhwcmVzc2lvbiAmJiB0cy5pc1ZhcmlhYmxlU3RhdGVtZW50KGJvb3RzdHJhcENhbGxFeHByZXNzaW9uKSkge1xuICAgICAgY29uc3QgZGVjbGFyYXRpb24gPSBib290c3RyYXBDYWxsRXhwcmVzc2lvbi5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zWzBdO1xuICAgICAgY29uc3QgYm9vdHN0cmFwVmFyID0gKGRlY2xhcmF0aW9uLm5hbWUgYXMgdHMuSWRlbnRpZmllcikudGV4dDtcbiAgICAgIGNvbnN0IHNmID0gYm9vdHN0cmFwQ2FsbEV4cHJlc3Npb24uZ2V0U291cmNlRmlsZSgpO1xuICAgICAgYm9vdHN0cmFwQ2FsbCA9IGZpbmRDYWxsRXhwcmVzc2lvbk5vZGUoc2YsIGJvb3RzdHJhcFZhcikgfHwgY3VycmVudENhbGw7XG4gICAgfVxuXG4gICAgLy8gaW5kZW50IGNvbnRlbnRzXG4gICAgY29uc3QgdHJpdmlhV2lkdGggPSBib290c3RyYXBDYWxsLmdldExlYWRpbmdUcml2aWFXaWR0aCgpO1xuICAgIGNvbnN0IGJlZm9yZVRleHQgPSBgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcXG5gXG4gICAgICArICcgJy5yZXBlYXQodHJpdmlhV2lkdGggPiAyID8gdHJpdmlhV2lkdGggKyAxIDogdHJpdmlhV2lkdGgpO1xuICAgIGNvbnN0IGFmdGVyVGV4dCA9IGBcXG4ke3RyaXZpYVdpZHRoID4gMiA/ICcgJy5yZXBlYXQodHJpdmlhV2lkdGggLSAxKSA6ICcnfSk7YDtcblxuICAgIC8vIGluIHNvbWUgY2FzZXMgd2UgbmVlZCB0byBjYXRlciBmb3IgYSB0cmFpbGluZyBzZW1pY29sb24gc3VjaCBhcztcbiAgICAvLyBib290c3RyYXAoKS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XG4gICAgY29uc3QgbGFzdFRva2VuID0gYm9vdHN0cmFwQ2FsbC5wYXJlbnQuZ2V0TGFzdFRva2VuKCk7XG4gICAgbGV0IGVuZFBvcyA9IGJvb3RzdHJhcENhbGwuZ2V0RW5kKCk7XG4gICAgaWYgKGxhc3RUb2tlbiAmJiBsYXN0VG9rZW4ua2luZCA9PT0gdHMuU3ludGF4S2luZC5TZW1pY29sb25Ub2tlbikge1xuICAgICAgZW5kUG9zID0gbGFzdFRva2VuLmdldEVuZCgpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShtYWluUGF0aCk7XG4gICAgcmVjb3JkZXIuaW5zZXJ0TGVmdChib290c3RyYXBDYWxsLmdldFN0YXJ0KCksIGJlZm9yZVRleHQpO1xuICAgIHJlY29yZGVyLmluc2VydFJpZ2h0KGVuZFBvcywgYWZ0ZXJUZXh0KTtcbiAgICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGZpbmRDYWxsRXhwcmVzc2lvbk5vZGUobm9kZTogdHMuTm9kZSwgdGV4dDogc3RyaW5nKTogdHMuTm9kZSB8IG51bGwge1xuICBpZiAoXG4gICAgdHMuaXNDYWxsRXhwcmVzc2lvbihub2RlKVxuICAgICYmIHRzLmlzSWRlbnRpZmllcihub2RlLmV4cHJlc3Npb24pXG4gICAgJiYgbm9kZS5leHByZXNzaW9uLnRleHQgPT09IHRleHRcbiAgKSB7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBsZXQgZm91bmROb2RlOiB0cy5Ob2RlIHwgbnVsbCA9IG51bGw7XG4gIHRzLmZvckVhY2hDaGlsZChub2RlLCBjaGlsZE5vZGUgPT4ge1xuICAgIGZvdW5kTm9kZSA9IGZpbmRDYWxsRXhwcmVzc2lvbk5vZGUoY2hpbGROb2RlLCB0ZXh0KTtcblxuICAgIGlmIChmb3VuZE5vZGUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGZvdW5kTm9kZTtcbn1cblxuZnVuY3Rpb24gYWRkU2VydmVyVHJhbnNpdGlvbihvcHRpb25zOiBVbml2ZXJzYWxPcHRpb25zKTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSkgPT4ge1xuICAgIGNvbnN0IGNsaWVudFByb2plY3QgPSBnZXRQcm9qZWN0KGhvc3QsIG9wdGlvbnMuY2xpZW50UHJvamVjdCk7XG4gICAgY29uc3QgY2xpZW50VGFyZ2V0cyA9IGdldFByb2plY3RUYXJnZXRzKGNsaWVudFByb2plY3QpO1xuICAgIGlmICghY2xpZW50VGFyZ2V0cy5idWlsZCkge1xuICAgICAgdGhyb3cgdGFyZ2V0QnVpbGROb3RGb3VuZEVycm9yKCk7XG4gICAgfVxuICAgIGNvbnN0IG1haW5QYXRoID0gbm9ybWFsaXplKCcvJyArIGNsaWVudFRhcmdldHMuYnVpbGQub3B0aW9ucy5tYWluKTtcblxuICAgIGNvbnN0IGJvb3RzdHJhcE1vZHVsZVJlbGF0aXZlUGF0aCA9IGZpbmRCb290c3RyYXBNb2R1bGVQYXRoKGhvc3QsIG1haW5QYXRoKTtcbiAgICBjb25zdCBib290c3RyYXBNb2R1bGVQYXRoID0gbm9ybWFsaXplKFxuICAgICAgYC8ke2NsaWVudFByb2plY3Qucm9vdH0vc3JjLyR7Ym9vdHN0cmFwTW9kdWxlUmVsYXRpdmVQYXRofS50c2ApO1xuXG4gICAgY29uc3QgYnJvd3Nlck1vZHVsZUltcG9ydCA9IGZpbmRCcm93c2VyTW9kdWxlSW1wb3J0KGhvc3QsIGJvb3RzdHJhcE1vZHVsZVBhdGgpO1xuICAgIGNvbnN0IGFwcElkID0gb3B0aW9ucy5hcHBJZDtcbiAgICBjb25zdCB0cmFuc2l0aW9uQ2FsbCA9IGAud2l0aFNlcnZlclRyYW5zaXRpb24oeyBhcHBJZDogJyR7YXBwSWR9JyB9KWA7XG4gICAgY29uc3QgcG9zaXRpb24gPSBicm93c2VyTW9kdWxlSW1wb3J0LnBvcyArIGJyb3dzZXJNb2R1bGVJbXBvcnQuZ2V0RnVsbFRleHQoKS5sZW5ndGg7XG4gICAgY29uc3QgdHJhbnNpdGlvbkNhbGxDaGFuZ2UgPSBuZXcgSW5zZXJ0Q2hhbmdlKFxuICAgICAgYm9vdHN0cmFwTW9kdWxlUGF0aCwgcG9zaXRpb24sIHRyYW5zaXRpb25DYWxsKTtcblxuICAgIGNvbnN0IHRyYW5zaXRpb25DYWxsUmVjb3JkZXIgPSBob3N0LmJlZ2luVXBkYXRlKGJvb3RzdHJhcE1vZHVsZVBhdGgpO1xuICAgIHRyYW5zaXRpb25DYWxsUmVjb3JkZXIuaW5zZXJ0TGVmdCh0cmFuc2l0aW9uQ2FsbENoYW5nZS5wb3MsIHRyYW5zaXRpb25DYWxsQ2hhbmdlLnRvQWRkKTtcbiAgICBob3N0LmNvbW1pdFVwZGF0ZSh0cmFuc2l0aW9uQ2FsbFJlY29yZGVyKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkRGVwZW5kZW5jaWVzKCk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCBjb3JlRGVwID0gZ2V0UGFja2FnZUpzb25EZXBlbmRlbmN5KGhvc3QsICdAYW5ndWxhci9jb3JlJyk7XG4gICAgaWYgKGNvcmVEZXAgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdDb3VsZCBub3QgZmluZCB2ZXJzaW9uLicpO1xuICAgIH1cbiAgICBjb25zdCBwbGF0Zm9ybVNlcnZlckRlcCA9IHtcbiAgICAgIC4uLmNvcmVEZXAsXG4gICAgICBuYW1lOiAnQGFuZ3VsYXIvcGxhdGZvcm0tc2VydmVyJyxcbiAgICB9O1xuICAgIGNvbnN0IGh0dHBEZXAgPSB7XG4gICAgICAuLi5jb3JlRGVwLFxuICAgICAgbmFtZTogJ0Bhbmd1bGFyL2h0dHAnLFxuICAgIH07XG4gICAgYWRkUGFja2FnZUpzb25EZXBlbmRlbmN5KGhvc3QsIHBsYXRmb3JtU2VydmVyRGVwKTtcbiAgICBhZGRQYWNrYWdlSnNvbkRlcGVuZGVuY3koaG9zdCwgaHR0cERlcCk7XG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0VHNDb25maWdPdXREaXIoaG9zdDogVHJlZSwgdGFyZ2V0czogZXhwZXJpbWVudGFsLndvcmtzcGFjZS5Xb3Jrc3BhY2VUb29sKTogc3RyaW5nIHtcbiAgY29uc3QgdHNDb25maWdQYXRoID0gdGFyZ2V0cy5idWlsZC5vcHRpb25zLnRzQ29uZmlnO1xuICBjb25zdCB0c0NvbmZpZ0J1ZmZlciA9IGhvc3QucmVhZCh0c0NvbmZpZ1BhdGgpO1xuICBpZiAoIXRzQ29uZmlnQnVmZmVyKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYENvdWxkIG5vdCByZWFkICR7dHNDb25maWdQYXRofWApO1xuICB9XG4gIGNvbnN0IHRzQ29uZmlnQ29udGVudCA9IHRzQ29uZmlnQnVmZmVyLnRvU3RyaW5nKCk7XG4gIGNvbnN0IHRzQ29uZmlnID0gcGFyc2VKc29uKHRzQ29uZmlnQ29udGVudCk7XG4gIGlmICh0c0NvbmZpZyA9PT0gbnVsbCB8fCB0eXBlb2YgdHNDb25maWcgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkodHNDb25maWcpIHx8XG4gICAgdHNDb25maWcuY29tcGlsZXJPcHRpb25zID09PSBudWxsIHx8IHR5cGVvZiB0c0NvbmZpZy5jb21waWxlck9wdGlvbnMgIT09ICdvYmplY3QnIHx8XG4gICAgQXJyYXkuaXNBcnJheSh0c0NvbmZpZy5jb21waWxlck9wdGlvbnMpKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYEludmFsaWQgdHNjb25maWcgLSAke3RzQ29uZmlnUGF0aH1gKTtcbiAgfVxuICBjb25zdCBvdXREaXIgPSB0c0NvbmZpZy5jb21waWxlck9wdGlvbnMub3V0RGlyO1xuXG4gIHJldHVybiBvdXREaXIgYXMgc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAob3B0aW9uczogVW5pdmVyc2FsT3B0aW9ucyk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCBjbGllbnRQcm9qZWN0ID0gZ2V0UHJvamVjdChob3N0LCBvcHRpb25zLmNsaWVudFByb2plY3QpO1xuICAgIGlmIChjbGllbnRQcm9qZWN0LnByb2plY3RUeXBlICE9PSAnYXBwbGljYXRpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgVW5pdmVyc2FsIHJlcXVpcmVzIGEgcHJvamVjdCB0eXBlIG9mIFwiYXBwbGljYXRpb25cIi5gKTtcbiAgICB9XG4gICAgY29uc3QgY2xpZW50VGFyZ2V0cyA9IGdldFByb2plY3RUYXJnZXRzKGNsaWVudFByb2plY3QpO1xuICAgIGNvbnN0IG91dERpciA9IGdldFRzQ29uZmlnT3V0RGlyKGhvc3QsIGNsaWVudFRhcmdldHMpO1xuICAgIGlmICghY2xpZW50VGFyZ2V0cy5idWlsZCkge1xuICAgICAgdGhyb3cgdGFyZ2V0QnVpbGROb3RGb3VuZEVycm9yKCk7XG4gICAgfVxuICAgIGNvbnN0IHRzQ29uZmlnRXh0ZW5kcyA9IGJhc2VuYW1lKG5vcm1hbGl6ZShjbGllbnRUYXJnZXRzLmJ1aWxkLm9wdGlvbnMudHNDb25maWcpKTtcbiAgICBjb25zdCByb290SW5TcmMgPSBjbGllbnRQcm9qZWN0LnJvb3QgPT09ICcnO1xuICAgIGNvbnN0IHRzQ29uZmlnRGlyZWN0b3J5ID0gam9pbihub3JtYWxpemUoY2xpZW50UHJvamVjdC5yb290KSwgcm9vdEluU3JjID8gJ3NyYycgOiAnJyk7XG5cbiAgICBpZiAoIW9wdGlvbnMuc2tpcEluc3RhbGwpIHtcbiAgICAgIGNvbnRleHQuYWRkVGFzayhuZXcgTm9kZVBhY2thZ2VJbnN0YWxsVGFzaygpKTtcbiAgICB9XG5cbiAgICBjb25zdCB0ZW1wbGF0ZVNvdXJjZSA9IGFwcGx5KHVybCgnLi9maWxlcy9zcmMnKSwgW1xuICAgICAgdGVtcGxhdGUoe1xuICAgICAgICAuLi5zdHJpbmdzLFxuICAgICAgICAuLi5vcHRpb25zIGFzIG9iamVjdCxcbiAgICAgICAgc3RyaXBUc0V4dGVuc2lvbjogKHM6IHN0cmluZykgPT4gcy5yZXBsYWNlKC9cXC50cyQvLCAnJyksXG4gICAgICB9KSxcbiAgICAgIG1vdmUoam9pbihub3JtYWxpemUoY2xpZW50UHJvamVjdC5yb290KSwgJ3NyYycpKSxcbiAgICBdKTtcblxuICAgIGNvbnN0IHJvb3RTb3VyY2UgPSBhcHBseSh1cmwoJy4vZmlsZXMvcm9vdCcpLCBbXG4gICAgICB0ZW1wbGF0ZSh7XG4gICAgICAgIC4uLnN0cmluZ3MsXG4gICAgICAgIC4uLm9wdGlvbnMgYXMgb2JqZWN0LFxuICAgICAgICBzdHJpcFRzRXh0ZW5zaW9uOiAoczogc3RyaW5nKSA9PiBzLnJlcGxhY2UoL1xcLnRzJC8sICcnKSxcbiAgICAgICAgb3V0RGlyLFxuICAgICAgICB0c0NvbmZpZ0V4dGVuZHMsXG4gICAgICAgIHJvb3RJblNyYyxcbiAgICAgIH0pLFxuICAgICAgbW92ZSh0c0NvbmZpZ0RpcmVjdG9yeSksXG4gICAgXSk7XG5cbiAgICByZXR1cm4gY2hhaW4oW1xuICAgICAgbWVyZ2VXaXRoKHRlbXBsYXRlU291cmNlKSxcbiAgICAgIG1lcmdlV2l0aChyb290U291cmNlKSxcbiAgICAgIGFkZERlcGVuZGVuY2llcygpLFxuICAgICAgdXBkYXRlQ29uZmlnRmlsZShvcHRpb25zLCB0c0NvbmZpZ0RpcmVjdG9yeSksXG4gICAgICB3cmFwQm9vdHN0cmFwQ2FsbChvcHRpb25zKSxcbiAgICAgIGFkZFNlcnZlclRyYW5zaXRpb24ob3B0aW9ucyksXG4gICAgXSk7XG4gIH07XG59XG4iXX0=