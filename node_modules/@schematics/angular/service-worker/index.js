"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const ts = require("typescript");
const ast_utils_1 = require("../utility/ast-utils");
const config_1 = require("../utility/config");
const dependencies_1 = require("../utility/dependencies");
const ng_ast_utils_1 = require("../utility/ng-ast-utils");
const project_targets_1 = require("../utility/project-targets");
function getProjectConfiguration(workspace, options) {
    const projectTargets = project_targets_1.getProjectTargets(workspace, options.project);
    if (!projectTargets[options.target]) {
        throw new Error(`Target is not defined for this project.`);
    }
    const target = projectTargets[options.target];
    let applyTo = target.options;
    if (options.configuration &&
        target.configurations &&
        target.configurations[options.configuration]) {
        applyTo = target.configurations[options.configuration];
    }
    return applyTo;
}
function updateConfigFile(options) {
    return (host, context) => {
        context.logger.debug('updating config file.');
        const workspace = config_1.getWorkspace(host);
        const config = getProjectConfiguration(workspace, options);
        config.serviceWorker = true;
        return config_1.updateWorkspace(workspace);
    };
}
function addDependencies() {
    return (host, context) => {
        const packageName = '@angular/service-worker';
        context.logger.debug(`adding dependency (${packageName})`);
        const coreDep = dependencies_1.getPackageJsonDependency(host, '@angular/core');
        if (coreDep === null) {
            throw new schematics_1.SchematicsException('Could not find version.');
        }
        const serviceWorkerDep = Object.assign({}, coreDep, { name: packageName });
        dependencies_1.addPackageJsonDependency(host, serviceWorkerDep);
        return host;
    };
}
function updateAppModule(options) {
    return (host, context) => {
        context.logger.debug('Updating appmodule');
        // find app module
        const projectTargets = project_targets_1.getProjectTargets(host, options.project);
        if (!projectTargets.build) {
            throw project_targets_1.targetBuildNotFoundError();
        }
        const mainPath = projectTargets.build.options.main;
        const modulePath = ng_ast_utils_1.getAppModulePath(host, mainPath);
        context.logger.debug(`module path: ${modulePath}`);
        // add import
        let moduleSource = getTsSourceFile(host, modulePath);
        let importModule = 'ServiceWorkerModule';
        let importPath = '@angular/service-worker';
        if (!ast_utils_1.isImported(moduleSource, importModule, importPath)) {
            const change = ast_utils_1.insertImport(moduleSource, modulePath, importModule, importPath);
            if (change) {
                const recorder = host.beginUpdate(modulePath);
                recorder.insertLeft(change.pos, change.toAdd);
                host.commitUpdate(recorder);
            }
        }
        // add import for environments
        // import { environment } from '../environments/environment';
        moduleSource = getTsSourceFile(host, modulePath);
        importModule = 'environment';
        // TODO: dynamically find environments relative path
        importPath = '../environments/environment';
        if (!ast_utils_1.isImported(moduleSource, importModule, importPath)) {
            const change = ast_utils_1.insertImport(moduleSource, modulePath, importModule, importPath);
            if (change) {
                const recorder = host.beginUpdate(modulePath);
                recorder.insertLeft(change.pos, change.toAdd);
                host.commitUpdate(recorder);
            }
        }
        // register SW in app module
        const importText = `ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })`;
        moduleSource = getTsSourceFile(host, modulePath);
        const metadataChanges = ast_utils_1.addSymbolToNgModuleMetadata(moduleSource, modulePath, 'imports', importText);
        if (metadataChanges) {
            const recorder = host.beginUpdate(modulePath);
            metadataChanges.forEach((change) => {
                recorder.insertRight(change.pos, change.toAdd);
            });
            host.commitUpdate(recorder);
        }
        return host;
    };
}
function getTsSourceFile(host, path) {
    const buffer = host.read(path);
    if (!buffer) {
        throw new schematics_1.SchematicsException(`Could not read file (${path}).`);
    }
    const content = buffer.toString();
    const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
    return source;
}
function default_1(options) {
    return (host, context) => {
        const workspace = config_1.getWorkspace(host);
        if (!options.project) {
            throw new schematics_1.SchematicsException('Option "project" is required.');
        }
        const project = workspace.projects[options.project];
        if (!project) {
            throw new schematics_1.SchematicsException(`Invalid project name (${options.project})`);
        }
        if (project.projectType !== 'application') {
            throw new schematics_1.SchematicsException(`Service worker requires a project type of "application".`);
        }
        let { resourcesOutputPath = '' } = getProjectConfiguration(workspace, options);
        if (resourcesOutputPath) {
            resourcesOutputPath = '/' + resourcesOutputPath.split('/').filter(x => !!x).join('/');
        }
        const templateSource = schematics_1.apply(schematics_1.url('./files'), [
            schematics_1.template(Object.assign({}, options, { resourcesOutputPath })),
            schematics_1.move(project.root),
        ]);
        context.addTask(new tasks_1.NodePackageInstallTask());
        return schematics_1.chain([
            schematics_1.mergeWith(templateSource),
            updateConfigFile(options),
            addDependencies(),
            updateAppModule(options),
        ]);
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3NjaGVtYXRpY3MvYW5ndWxhci9zZXJ2aWNlLXdvcmtlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILDJEQVlvQztBQUNwQyw0REFBMEU7QUFDMUUsaUNBQWlDO0FBQ2pDLG9EQUE2RjtBQUU3Riw4Q0FBa0U7QUFDbEUsMERBQTZGO0FBQzdGLDBEQUEyRDtBQUMzRCxnRUFBeUY7QUFRekYsU0FBUyx1QkFBdUIsQ0FDOUIsU0FBMEIsRUFDMUIsT0FBNkI7SUFFN0IsTUFBTSxjQUFjLEdBQUcsbUNBQWlCLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyRSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNuQyxNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7S0FDNUQ7SUFFRCxNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBeUIsQ0FBQztJQUN0RSxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBRTdCLElBQUksT0FBTyxDQUFDLGFBQWE7UUFDdkIsTUFBTSxDQUFDLGNBQWM7UUFDckIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7UUFDOUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBMEIsQ0FBQztLQUNqRjtJQUVELE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLE9BQTZCO0lBQ3JELE9BQU8sQ0FBQyxJQUFVLEVBQUUsT0FBeUIsRUFBRSxFQUFFO1FBQy9DLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDOUMsTUFBTSxTQUFT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TSxjQUFjLEdBQUcsa0JBQUssQ0FBQyxnQkFBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzNDLHFCQUFRLG1CQUFNLE9BQU8sSUFBRSxtQkFBbUIsSUFBRztZQUM3QyxpQkFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7U0FDbkIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLDhCQUFzQixFQUFFLENBQUMsQ0FBQztRQUU5QyxPQUFPLGtCQUFLLENBQUM7WUFDWCxzQkFBUyxDQUFDLGNBQWMsQ0FBQztZQUN6QixnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7WUFDekIsZUFBZSxFQUFFO1lBQ2pCLGVBQWUsQ0FBQyxPQUFPLENBQUM7U0FDekIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWpDRCw0QkFpQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBSdWxlLFxuICBTY2hlbWF0aWNDb250ZXh0LFxuICBTY2hlbWF0aWNzRXhjZXB0aW9uLFxuICBUcmVlLFxuICBVcGRhdGVSZWNvcmRlcixcbiAgYXBwbHksXG4gIGNoYWluLFxuICBtZXJnZVdpdGgsXG4gIG1vdmUsXG4gIHRlbXBsYXRlLFxuICB1cmwsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2sgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90YXNrcyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7IGFkZFN5bWJvbFRvTmdNb2R1bGVNZXRhZGF0YSwgaW5zZXJ0SW1wb3J0LCBpc0ltcG9ydGVkIH0gZnJvbSAnLi4vdXRpbGl0eS9hc3QtdXRpbHMnO1xuaW1wb3J0IHsgSW5zZXJ0Q2hhbmdlIH0gZnJvbSAnLi4vdXRpbGl0eS9jaGFuZ2UnO1xuaW1wb3J0IHsgZ2V0V29ya3NwYWNlLCB1cGRhdGVXb3Jrc3BhY2UgfSBmcm9tICcuLi91dGlsaXR5L2NvbmZpZyc7XG5pbXBvcnQgeyBhZGRQYWNrYWdlSnNvbkRlcGVuZGVuY3ksIGdldFBhY2thZ2VKc29uRGVwZW5kZW5jeSB9IGZyb20gJy4uL3V0aWxpdHkvZGVwZW5kZW5jaWVzJztcbmltcG9ydCB7IGdldEFwcE1vZHVsZVBhdGggfSBmcm9tICcuLi91dGlsaXR5L25nLWFzdC11dGlscyc7XG5pbXBvcnQgeyBnZXRQcm9qZWN0VGFyZ2V0cywgdGFyZ2V0QnVpbGROb3RGb3VuZEVycm9yIH0gZnJvbSAnLi4vdXRpbGl0eS9wcm9qZWN0LXRhcmdldHMnO1xuaW1wb3J0IHtcbiAgQnJvd3NlckJ1aWxkZXJPcHRpb25zLFxuICBCcm93c2VyQnVpbGRlclRhcmdldCxcbiAgV29ya3NwYWNlU2NoZW1hLFxufSBmcm9tICcuLi91dGlsaXR5L3dvcmtzcGFjZS1tb2RlbHMnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFNlcnZpY2VXb3JrZXJPcHRpb25zIH0gZnJvbSAnLi9zY2hlbWEnO1xuXG5mdW5jdGlvbiBnZXRQcm9qZWN0Q29uZmlndXJhdGlvbihcbiAgd29ya3NwYWNlOiBXb3Jrc3BhY2VTY2hlbWEsXG4gIG9wdGlvbnM6IFNlcnZpY2VXb3JrZXJPcHRpb25zLFxuKTogQnJvd3NlckJ1aWxkZXJPcHRpb25zIHtcbiAgY29uc3QgcHJvamVjdFRhcmdldHMgPSBnZXRQcm9qZWN0VGFyZ2V0cyh3b3Jrc3BhY2UsIG9wdGlvbnMucHJvamVjdCk7XG4gIGlmICghcHJvamVjdFRhcmdldHNbb3B0aW9ucy50YXJnZXRdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBUYXJnZXQgaXMgbm90IGRlZmluZWQgZm9yIHRoaXMgcHJvamVjdC5gKTtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldCA9IHByb2plY3RUYXJnZXRzW29wdGlvbnMudGFyZ2V0XSBhcyBCcm93c2VyQnVpbGRlclRhcmdldDtcbiAgbGV0IGFwcGx5VG8gPSB0YXJnZXQub3B0aW9ucztcblxuICBpZiAob3B0aW9ucy5jb25maWd1cmF0aW9uICYmXG4gICAgdGFyZ2V0LmNvbmZpZ3VyYXRpb25zICYmXG4gICAgdGFyZ2V0LmNvbmZpZ3VyYXRpb25zW29wdGlvbnMuY29uZmlndXJhdGlvbl0pIHtcbiAgICBhcHBseVRvID0gdGFyZ2V0LmNvbmZpZ3VyYXRpb25zW29wdGlvbnMuY29uZmlndXJhdGlvbl0gYXMgQnJvd3NlckJ1aWxkZXJPcHRpb25zO1xuICB9XG5cbiAgcmV0dXJuIGFwcGx5VG87XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvbmZpZ0ZpbGUob3B0aW9uczogU2VydmljZVdvcmtlck9wdGlvbnMpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgY29udGV4dC5sb2dnZXIuZGVidWcoJ3VwZGF0aW5nIGNvbmZpZyBmaWxlLicpO1xuICAgIGNvbnN0IHdvcmtzcGFjZSA9IGdldFdvcmtzcGFjZShob3N0KTtcblxuICAgIGNvbnN0IGNvbmZpZyA9IGdldFByb2plY3RDb25maWd1cmF0aW9uKHdvcmtzcGFjZSwgb3B0aW9ucyk7XG4gICAgY29uZmlnLnNlcnZpY2VXb3JrZXIgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHVwZGF0ZVdvcmtzcGFjZSh3b3Jrc3BhY2UpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhZGREZXBlbmRlbmNpZXMoKTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHBhY2thZ2VOYW1lID0gJ0Bhbmd1bGFyL3NlcnZpY2Utd29ya2VyJztcbiAgICBjb250ZXh0LmxvZ2dlci5kZWJ1ZyhgYWRkaW5nIGRlcGVuZGVuY3kgKCR7cGFja2FnZU5hbWV9KWApO1xuICAgIGNvbnN0IGNvcmVEZXAgPSBnZXRQYWNrYWdlSnNvbkRlcGVuZGVuY3koaG9zdCwgJ0Bhbmd1bGFyL2NvcmUnKTtcbiAgICBpZiAoY29yZURlcCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ0NvdWxkIG5vdCBmaW5kIHZlcnNpb24uJyk7XG4gICAgfVxuICAgIGNvbnN0IHNlcnZpY2VXb3JrZXJEZXAgPSB7XG4gICAgICAuLi5jb3JlRGVwLFxuICAgICAgbmFtZTogcGFja2FnZU5hbWUsXG4gICAgfTtcbiAgICBhZGRQYWNrYWdlSnNvbkRlcGVuZGVuY3koaG9zdCwgc2VydmljZVdvcmtlckRlcCk7XG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQXBwTW9kdWxlKG9wdGlvbnM6IFNlcnZpY2VXb3JrZXJPcHRpb25zKTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGNvbnRleHQubG9nZ2VyLmRlYnVnKCdVcGRhdGluZyBhcHBtb2R1bGUnKTtcblxuICAgIC8vIGZpbmQgYXBwIG1vZHVsZVxuICAgIGNvbnN0IHByb2plY3RUYXJnZXRzID0gZ2V0UHJvamVjdFRhcmdldHMoaG9zdCwgb3B0aW9ucy5wcm9qZWN0KTtcbiAgICBpZiAoIXByb2plY3RUYXJnZXRzLmJ1aWxkKSB7XG4gICAgICB0aHJvdyB0YXJnZXRCdWlsZE5vdEZvdW5kRXJyb3IoKTtcbiAgICB9XG5cbiAgICBjb25zdCBtYWluUGF0aCA9IHByb2plY3RUYXJnZXRzLmJ1aWxkLm9wdGlvbnMubWFpbjtcbiAgICBjb25zdCBtb2R1bGVQYXRoID0gZ2V0QXBwTW9kdWxlUGF0aChob3N0LCBtYWluUGF0aCk7XG4gICAgY29udGV4dC5sb2dnZXIuZGVidWcoYG1vZHVsZSBwYXRoOiAke21vZHVsZVBhdGh9YCk7XG5cbiAgICAvLyBhZGQgaW1wb3J0XG4gICAgbGV0IG1vZHVsZVNvdXJjZSA9IGdldFRzU291cmNlRmlsZShob3N0LCBtb2R1bGVQYXRoKTtcbiAgICBsZXQgaW1wb3J0TW9kdWxlID0gJ1NlcnZpY2VXb3JrZXJNb2R1bGUnO1xuICAgIGxldCBpbXBvcnRQYXRoID0gJ0Bhbmd1bGFyL3NlcnZpY2Utd29ya2VyJztcbiAgICBpZiAoIWlzSW1wb3J0ZWQobW9kdWxlU291cmNlLCBpbXBvcnRNb2R1bGUsIGltcG9ydFBhdGgpKSB7XG4gICAgICBjb25zdCBjaGFuZ2UgPSBpbnNlcnRJbXBvcnRcbiAgICAgIChtb2R1bGVTb3VyY2UsIG1vZHVsZVBhdGgsIGltcG9ydE1vZHVsZSwgaW1wb3J0UGF0aCk7XG4gICAgICBpZiAoY2hhbmdlKSB7XG4gICAgICAgIGNvbnN0IHJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShtb2R1bGVQYXRoKTtcbiAgICAgICAgcmVjb3JkZXIuaW5zZXJ0TGVmdCgoY2hhbmdlIGFzIEluc2VydENoYW5nZSkucG9zLCAoY2hhbmdlIGFzIEluc2VydENoYW5nZSkudG9BZGQpO1xuICAgICAgICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYWRkIGltcG9ydCBmb3IgZW52aXJvbm1lbnRzXG4gICAgLy8gaW1wb3J0IHsgZW52aXJvbm1lbnQgfSBmcm9tICcuLi9lbnZpcm9ubWVudHMvZW52aXJvbm1lbnQnO1xuICAgIG1vZHVsZVNvdXJjZSA9IGdldFRzU291cmNlRmlsZShob3N0LCBtb2R1bGVQYXRoKTtcbiAgICBpbXBvcnRNb2R1bGUgPSAnZW52aXJvbm1lbnQnO1xuICAgIC8vIFRPRE86IGR5bmFtaWNhbGx5IGZpbmQgZW52aXJvbm1lbnRzIHJlbGF0aXZlIHBhdGhcbiAgICBpbXBvcnRQYXRoID0gJy4uL2Vudmlyb25tZW50cy9lbnZpcm9ubWVudCc7XG4gICAgaWYgKCFpc0ltcG9ydGVkKG1vZHVsZVNvdXJjZSwgaW1wb3J0TW9kdWxlLCBpbXBvcnRQYXRoKSkge1xuICAgICAgY29uc3QgY2hhbmdlID0gaW5zZXJ0SW1wb3J0XG4gICAgICAobW9kdWxlU291cmNlLCBtb2R1bGVQYXRoLCBpbXBvcnRNb2R1bGUsIGltcG9ydFBhdGgpO1xuICAgICAgaWYgKGNoYW5nZSkge1xuICAgICAgICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUobW9kdWxlUGF0aCk7XG4gICAgICAgIHJlY29yZGVyLmluc2VydExlZnQoKGNoYW5nZSBhcyBJbnNlcnRDaGFuZ2UpLnBvcywgKGNoYW5nZSBhcyBJbnNlcnRDaGFuZ2UpLnRvQWRkKTtcbiAgICAgICAgaG9zdC5jb21taXRVcGRhdGUocmVjb3JkZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJlZ2lzdGVyIFNXIGluIGFwcCBtb2R1bGVcbiAgICBjb25zdCBpbXBvcnRUZXh0ID1cbiAgICAgIGBTZXJ2aWNlV29ya2VyTW9kdWxlLnJlZ2lzdGVyKCduZ3N3LXdvcmtlci5qcycsIHsgZW5hYmxlZDogZW52aXJvbm1lbnQucHJvZHVjdGlvbiB9KWA7XG4gICAgbW9kdWxlU291cmNlID0gZ2V0VHNTb3VyY2VGaWxlKGhvc3QsIG1vZHVsZVBhdGgpO1xuICAgIGNvbnN0IG1ldGFkYXRhQ2hhbmdlcyA9IGFkZFN5bWJvbFRvTmdNb2R1bGVNZXRhZGF0YShcbiAgICAgIG1vZHVsZVNvdXJjZSwgbW9kdWxlUGF0aCwgJ2ltcG9ydHMnLCBpbXBvcnRUZXh0KTtcbiAgICBpZiAobWV0YWRhdGFDaGFuZ2VzKSB7XG4gICAgICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUobW9kdWxlUGF0aCk7XG4gICAgICBtZXRhZGF0YUNoYW5nZXMuZm9yRWFjaCgoY2hhbmdlOiBJbnNlcnRDaGFuZ2UpID0+IHtcbiAgICAgICAgcmVjb3JkZXIuaW5zZXJ0UmlnaHQoY2hhbmdlLnBvcywgY2hhbmdlLnRvQWRkKTtcbiAgICAgIH0pO1xuICAgICAgaG9zdC5jb21taXRVcGRhdGUocmVjb3JkZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBob3N0O1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRUc1NvdXJjZUZpbGUoaG9zdDogVHJlZSwgcGF0aDogc3RyaW5nKTogdHMuU291cmNlRmlsZSB7XG4gIGNvbnN0IGJ1ZmZlciA9IGhvc3QucmVhZChwYXRoKTtcbiAgaWYgKCFidWZmZXIpIHtcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgQ291bGQgbm90IHJlYWQgZmlsZSAoJHtwYXRofSkuYCk7XG4gIH1cbiAgY29uc3QgY29udGVudCA9IGJ1ZmZlci50b1N0cmluZygpO1xuICBjb25zdCBzb3VyY2UgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKHBhdGgsIGNvbnRlbnQsIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsIHRydWUpO1xuXG4gIHJldHVybiBzb3VyY2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChvcHRpb25zOiBTZXJ2aWNlV29ya2VyT3B0aW9ucyk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBnZXRXb3Jrc3BhY2UoaG9zdCk7XG4gICAgaWYgKCFvcHRpb25zLnByb2plY3QpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdPcHRpb24gXCJwcm9qZWN0XCIgaXMgcmVxdWlyZWQuJyk7XG4gICAgfVxuICAgIGNvbnN0IHByb2plY3QgPSB3b3Jrc3BhY2UucHJvamVjdHNbb3B0aW9ucy5wcm9qZWN0XTtcbiAgICBpZiAoIXByb2plY3QpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBJbnZhbGlkIHByb2plY3QgbmFtZSAoJHtvcHRpb25zLnByb2plY3R9KWApO1xuICAgIH1cbiAgICBpZiAocHJvamVjdC5wcm9qZWN0VHlwZSAhPT0gJ2FwcGxpY2F0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYFNlcnZpY2Ugd29ya2VyIHJlcXVpcmVzIGEgcHJvamVjdCB0eXBlIG9mIFwiYXBwbGljYXRpb25cIi5gKTtcbiAgICB9XG5cbiAgICBsZXQgeyByZXNvdXJjZXNPdXRwdXRQYXRoID0gJycgfSA9IGdldFByb2plY3RDb25maWd1cmF0aW9uKHdvcmtzcGFjZSwgb3B0aW9ucyk7XG4gICAgaWYgKHJlc291cmNlc091dHB1dFBhdGgpIHtcbiAgICAgIHJlc291cmNlc091dHB1dFBhdGggPSAnLycgKyByZXNvdXJjZXNPdXRwdXRQYXRoLnNwbGl0KCcvJykuZmlsdGVyKHggPT4gISF4KS5qb2luKCcvJyk7XG4gICAgfVxuXG4gICAgY29uc3QgdGVtcGxhdGVTb3VyY2UgPSBhcHBseSh1cmwoJy4vZmlsZXMnKSwgW1xuICAgICAgdGVtcGxhdGUoeyAuLi5vcHRpb25zLCByZXNvdXJjZXNPdXRwdXRQYXRoIH0pLFxuICAgICAgbW92ZShwcm9qZWN0LnJvb3QpLFxuICAgIF0pO1xuXG4gICAgY29udGV4dC5hZGRUYXNrKG5ldyBOb2RlUGFja2FnZUluc3RhbGxUYXNrKCkpO1xuXG4gICAgcmV0dXJuIGNoYWluKFtcbiAgICAgIG1lcmdlV2l0aCh0ZW1wbGF0ZVNvdXJjZSksXG4gICAgICB1cGRhdGVDb25maWdGaWxlKG9wdGlvbnMpLFxuICAgICAgYWRkRGVwZW5kZW5jaWVzKCksXG4gICAgICB1cGRhdGVBcHBNb2R1bGUob3B0aW9ucyksXG4gICAgXSk7XG4gIH07XG59XG4iXX0=