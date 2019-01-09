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
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const semver = require("semver");
const npm_1 = require("./npm");
// Angular guarantees that a major is compatible with its following major (so packages that depend
// on Angular 5 are also compatible with Angular 6). This is, in code, represented by verifying
// that all other packages that have a peer dependency of `"@angular/core": "^5.0.0"` actually
// supports 6.0, by adding that compatibility to the range, so it is `^5.0.0 || ^6.0.0`.
// We export it to allow for testing.
function angularMajorCompatGuarantee(range) {
    range = semver.validRange(range);
    let major = 1;
    while (!semver.gtr(major + '.0.0', range)) {
        major++;
        if (major >= 99) {
            // Use original range if it supports a major this high
            // Range is most likely unbounded (e.g., >=5.0.0)
            return range;
        }
    }
    // Add the major version as compatible with the angular compatible, with all minors. This is
    // already one major above the greatest supported, because we increment `major` before checking.
    // We add minors like this because a minor beta is still compatible with a minor non-beta.
    let newRange = range;
    for (let minor = 0; minor < 20; minor++) {
        newRange += ` || ^${major}.${minor}.0-alpha.0 `;
    }
    return semver.validRange(newRange) || range;
}
exports.angularMajorCompatGuarantee = angularMajorCompatGuarantee;
// This is a map of packageGroupName to range extending function. If it isn't found, the range is
// kept the same.
const peerCompatibleWhitelist = {
    '@angular/core': angularMajorCompatGuarantee,
};
function _updatePeerVersion(infoMap, name, range) {
    // Resolve packageGroupName.
    const maybePackageInfo = infoMap.get(name);
    if (!maybePackageInfo) {
        return range;
    }
    if (maybePackageInfo.target) {
        name = maybePackageInfo.target.updateMetadata.packageGroupName || name;
    }
    else {
        name = maybePackageInfo.installed.updateMetadata.packageGroupName || name;
    }
    const maybeTransform = peerCompatibleWhitelist[name];
    if (maybeTransform) {
        if (typeof maybeTransform == 'function') {
            return maybeTransform(range);
        }
        else {
            return maybeTransform;
        }
    }
    return range;
}
function _validateForwardPeerDependencies(name, infoMap, peers, logger) {
    for (const [peer, range] of Object.entries(peers)) {
        logger.debug(`Checking forward peer ${peer}...`);
        const maybePeerInfo = infoMap.get(peer);
        if (!maybePeerInfo) {
            logger.error([
                `Package ${JSON.stringify(name)} has a missing peer dependency of`,
                `${JSON.stringify(peer)} @ ${JSON.stringify(range)}.`,
            ].join(' '));
            return true;
        }
        const peerVersion = maybePeerInfo.target && maybePeerInfo.target.packageJson.version
            ? maybePeerInfo.target.packageJson.version
            : maybePeerInfo.installed.version;
        logger.debug(`  Range intersects(${range}, ${peerVersion})...`);
        if (!semver.satisfies(peerVersion, range)) {
            logger.error([
                `Package ${JSON.stringify(name)} has an incompatible peer dependency to`,
                `${JSON.stringify(peer)} (requires ${JSON.stringify(range)},`,
                `would install ${JSON.stringify(peerVersion)})`,
            ].join(' '));
            return true;
        }
    }
    return false;
}
function _validateReversePeerDependencies(name, version, infoMap, logger) {
    for (const [installed, installedInfo] of infoMap.entries()) {
        const installedLogger = logger.createChild(installed);
        installedLogger.debug(`${installed}...`);
        const peers = (installedInfo.target || installedInfo.installed).packageJson.peerDependencies;
        for (const [peer, range] of Object.entries(peers || {})) {
            if (peer != name) {
                // Only check peers to the packages we're updating. We don't care about peers
                // that are unmet but we have no effect on.
                continue;
            }
            // Override the peer version range if it's whitelisted.
            const extendedRange = _updatePeerVersion(infoMap, peer, range);
            if (!semver.satisfies(version, extendedRange)) {
                logger.error([
                    `Package ${JSON.stringify(installed)} has an incompatible peer dependency to`,
                    `${JSON.stringify(name)} (requires`,
                    `${JSON.stringify(range)}${extendedRange == range ? '' : ' (extended)'},`,
                    `would install ${JSON.stringify(version)}).`,
                ].join(' '));
                return true;
            }
        }
    }
    return false;
}
function _validateUpdatePackages(infoMap, force, logger) {
    logger.debug('Updating the following packages:');
    infoMap.forEach(info => {
        if (info.target) {
            logger.debug(`  ${info.name} => ${info.target.version}`);
        }
    });
    let peerErrors = false;
    infoMap.forEach(info => {
        const { name, target } = info;
        if (!target) {
            return;
        }
        const pkgLogger = logger.createChild(name);
        logger.debug(`${name}...`);
        const peers = target.packageJson.peerDependencies || {};
        peerErrors = _validateForwardPeerDependencies(name, infoMap, peers, pkgLogger) || peerErrors;
        peerErrors
            = _validateReversePeerDependencies(name, target.version, infoMap, pkgLogger)
                || peerErrors;
    });
    if (!force && peerErrors) {
        throw new schematics_1.SchematicsException(`Incompatible peer dependencies found. See above.`);
    }
}
function _performUpdate(tree, context, infoMap, logger, migrateOnly) {
    const packageJsonContent = tree.read('/package.json');
    if (!packageJsonContent) {
        throw new schematics_1.SchematicsException('Could not find a package.json. Are you in a Node project?');
    }
    let packageJson;
    try {
        packageJson = JSON.parse(packageJsonContent.toString());
    }
    catch (e) {
        throw new schematics_1.SchematicsException('package.json could not be parsed: ' + e.message);
    }
    const updateDependency = (deps, name, newVersion) => {
        const oldVersion = deps[name];
        // We only respect caret and tilde ranges on update.
        const execResult = /^[\^~]/.exec(oldVersion);
        deps[name] = `${execResult ? execResult[0] : ''}${newVersion}`;
    };
    const toInstall = [...infoMap.values()]
        .map(x => [x.name, x.target, x.installed])
        // tslint:disable-next-line:no-non-null-assertion
        .filter(([name, target, installed]) => {
        return !!name && !!target && !!installed;
    });
    toInstall.forEach(([name, target, installed]) => {
        logger.info(`Updating package.json with dependency ${name} `
            + `@ ${JSON.stringify(target.version)} (was ${JSON.stringify(installed.version)})...`);
        if (packageJson.dependencies && packageJson.dependencies[name]) {
            updateDependency(packageJson.dependencies, name, target.version);
            if (packageJson.devDependencies && packageJson.devDependencies[name]) {
                delete packageJson.devDependencies[name];
            }
            if (packageJson.peerDependencies && packageJson.peerDependencies[name]) {
                delete packageJson.peerDependencies[name];
            }
        }
        else if (packageJson.devDependencies && packageJson.devDependencies[name]) {
            updateDependency(packageJson.devDependencies, name, target.version);
            if (packageJson.peerDependencies && packageJson.peerDependencies[name]) {
                delete packageJson.peerDependencies[name];
            }
        }
        else if (packageJson.peerDependencies && packageJson.peerDependencies[name]) {
            updateDependency(packageJson.peerDependencies, name, target.version);
        }
        else {
            logger.warn(`Package ${name} was not found in dependencies.`);
        }
    });
    const newContent = JSON.stringify(packageJson, null, 2);
    if (packageJsonContent.toString() != newContent || migrateOnly) {
        let installTask = [];
        if (!migrateOnly) {
            // If something changed, also hook up the task.
            tree.overwrite('/package.json', JSON.stringify(packageJson, null, 2));
            installTask = [context.addTask(new tasks_1.NodePackageInstallTask())];
        }
        // Run the migrate schematics with the list of packages to use. The collection contains
        // version information and we need to do this post installation. Please note that the
        // migration COULD fail and leave side effects on disk.
        // Run the schematics task of those packages.
        toInstall.forEach(([name, target, installed]) => {
            if (!target.updateMetadata.migrations) {
                return;
            }
            const collection = (target.updateMetadata.migrations.match(/^[./]/)
                ? name + '/'
                : '') + target.updateMetadata.migrations;
            context.addTask(new tasks_1.RunSchematicTask('@schematics/update', 'migrate', {
                package: name,
                collection,
                from: installed.version,
                to: target.version,
            }), installTask);
        });
    }
    return rxjs_1.of(undefined);
}
function _migrateOnly(info, context, from, to) {
    if (!info) {
        return rxjs_1.of();
    }
    const target = info.installed;
    if (!target || !target.updateMetadata.migrations) {
        return rxjs_1.of(undefined);
    }
    const collection = (target.updateMetadata.migrations.match(/^[./]/)
        ? info.name + '/'
        : '') + target.updateMetadata.migrations;
    context.addTask(new tasks_1.RunSchematicTask('@schematics/update', 'migrate', {
        package: info.name,
        collection,
        from: from,
        to: to || target.version,
    }));
    return rxjs_1.of(undefined);
}
function _getUpdateMetadata(packageJson, logger) {
    const metadata = packageJson['ng-update'];
    const result = {
        packageGroup: {},
        requirements: {},
    };
    if (!metadata || typeof metadata != 'object' || Array.isArray(metadata)) {
        return result;
    }
    if (metadata['packageGroup']) {
        const packageGroup = metadata['packageGroup'];
        // Verify that packageGroup is an array of strings or an map of versions. This is not an error
        // but we still warn the user and ignore the packageGroup keys.
        if (Array.isArray(packageGroup) && packageGroup.every(x => typeof x == 'string')) {
            result.packageGroup = packageGroup.reduce((group, name) => {
                group[name] = packageJson.version;
                return group;
            }, result.packageGroup);
        }
        else if (typeof packageGroup == 'object' && packageGroup
            && Object.values(packageGroup).every(x => typeof x == 'string')) {
            result.packageGroup = packageGroup;
        }
        else {
            logger.warn(`packageGroup metadata of package ${packageJson.name} is malformed. Ignoring.`);
        }
        result.packageGroupName = Object.keys(result.packageGroup)[0];
    }
    if (typeof metadata['packageGroupName'] == 'string') {
        result.packageGroupName = metadata['packageGroupName'];
    }
    if (metadata['requirements']) {
        const requirements = metadata['requirements'];
        // Verify that requirements are
        if (typeof requirements != 'object'
            || Array.isArray(requirements)
            || Object.keys(requirements).some(name => typeof requirements[name] != 'string')) {
            logger.warn(`requirements metadata of package ${packageJson.name} is malformed. Ignoring.`);
        }
        else {
            result.requirements = requirements;
        }
    }
    if (metadata['migrations']) {
        const migrations = metadata['migrations'];
        if (typeof migrations != 'string') {
            logger.warn(`migrations metadata of package ${packageJson.name} is malformed. Ignoring.`);
        }
        else {
            result.migrations = migrations;
        }
    }
    return result;
}
function _usageMessage(options, infoMap, logger) {
    const packageGroups = new Map();
    const packagesToUpdate = [...infoMap.entries()]
        .map(([name, info]) => {
        const tag = options.next
            ? (info.npmPackageJson['dist-tags']['next'] ? 'next' : 'latest') : 'latest';
        const version = info.npmPackageJson['dist-tags'][tag];
        const target = info.npmPackageJson.versions[version];
        return {
            name,
            info,
            version,
            tag,
            target,
        };
    })
        .filter(({ name, info, version, target }) => {
        return (target && semver.compare(info.installed.version, version) < 0);
    })
        .filter(({ target }) => {
        return target['ng-update'];
    })
        .map(({ name, info, version, tag, target }) => {
        // Look for packageGroup.
        if (target['ng-update'] && target['ng-update']['packageGroup']) {
            const packageGroup = target['ng-update']['packageGroup'];
            const packageGroupName = target['ng-update']['packageGroupName']
                || target['ng-update']['packageGroup'][0];
            if (packageGroupName) {
                if (packageGroups.has(name)) {
                    return null;
                }
                packageGroup.forEach((x) => packageGroups.set(x, packageGroupName));
                packageGroups.set(packageGroupName, packageGroupName);
                name = packageGroupName;
            }
        }
        let command = `ng update ${name}`;
        if (tag == 'next') {
            command += ' --next';
        }
        return [name, `${info.installed.version} -> ${version}`, command];
    })
        .filter(x => x !== null)
        .sort((a, b) => a && b ? a[0].localeCompare(b[0]) : 0);
    if (packagesToUpdate.length == 0) {
        logger.info('We analyzed your package.json and everything seems to be in order. Good work!');
        return rxjs_1.of(undefined);
    }
    logger.info('We analyzed your package.json, there are some packages to update:\n');
    // Find the largest name to know the padding needed.
    let namePad = Math.max(...[...infoMap.keys()].map(x => x.length)) + 2;
    if (!Number.isFinite(namePad)) {
        namePad = 30;
    }
    const pads = [namePad, 25, 0];
    logger.info('  '
        + ['Name', 'Version', 'Command to update'].map((x, i) => x.padEnd(pads[i])).join(''));
    logger.info(' ' + '-'.repeat(pads.reduce((s, x) => s += x, 0) + 20));
    packagesToUpdate.forEach(fields => {
        if (!fields) {
            return;
        }
        logger.info('  ' + fields.map((x, i) => x.padEnd(pads[i])).join(''));
    });
    logger.info('\n');
    logger.info('There might be additional packages that are outdated.');
    logger.info('Run "ng update --all" to try to update all at the same time.\n');
    return rxjs_1.of(undefined);
}
function _buildPackageInfo(tree, packages, allDependencies, npmPackageJson, logger) {
    const name = npmPackageJson.name;
    const packageJsonRange = allDependencies.get(name);
    if (!packageJsonRange) {
        throw new schematics_1.SchematicsException(`Package ${JSON.stringify(name)} was not found in package.json.`);
    }
    // Find out the currently installed version. Either from the package.json or the node_modules/
    // TODO: figure out a way to read package-lock.json and/or yarn.lock.
    let installedVersion;
    const packageContent = tree.read(`/node_modules/${name}/package.json`);
    if (packageContent) {
        const content = JSON.parse(packageContent.toString());
        installedVersion = content.version;
    }
    if (!installedVersion) {
        // Find the version from NPM that fits the range to max.
        installedVersion = semver.maxSatisfying(Object.keys(npmPackageJson.versions), packageJsonRange);
    }
    const installedPackageJson = npmPackageJson.versions[installedVersion] || packageContent;
    if (!installedPackageJson) {
        throw new schematics_1.SchematicsException(`An unexpected error happened; package ${name} has no version ${installedVersion}.`);
    }
    let targetVersion = packages.get(name);
    if (targetVersion) {
        if (npmPackageJson['dist-tags'][targetVersion]) {
            targetVersion = npmPackageJson['dist-tags'][targetVersion];
        }
        else if (targetVersion == 'next') {
            targetVersion = npmPackageJson['dist-tags']['latest'];
        }
        else {
            targetVersion = semver.maxSatisfying(Object.keys(npmPackageJson.versions), targetVersion);
        }
    }
    if (targetVersion && semver.lte(targetVersion, installedVersion)) {
        logger.debug(`Package ${name} already satisfied by package.json (${packageJsonRange}).`);
        targetVersion = undefined;
    }
    const target = targetVersion
        ? {
            version: targetVersion,
            packageJson: npmPackageJson.versions[targetVersion],
            updateMetadata: _getUpdateMetadata(npmPackageJson.versions[targetVersion], logger),
        }
        : undefined;
    // Check if there's an installed version.
    return {
        name,
        npmPackageJson,
        installed: {
            version: installedVersion,
            packageJson: installedPackageJson,
            updateMetadata: _getUpdateMetadata(installedPackageJson, logger),
        },
        target,
        packageJsonRange,
    };
}
function _buildPackageList(options, projectDeps, logger) {
    // Parse the packages options to set the targeted version.
    const packages = new Map();
    const commandLinePackages = (options.packages && options.packages.length > 0)
        ? options.packages
        : (options.all ? projectDeps.keys() : []);
    for (const pkg of commandLinePackages) {
        // Split the version asked on command line.
        const m = pkg.match(/^((?:@[^/]{1,100}\/)?[^@]{1,100})(?:@(.{1,100}))?$/);
        if (!m) {
            logger.warn(`Invalid package argument: ${JSON.stringify(pkg)}. Skipping.`);
            continue;
        }
        const [, npmName, maybeVersion] = m;
        const version = projectDeps.get(npmName);
        if (!version) {
            logger.warn(`Package not installed: ${JSON.stringify(npmName)}. Skipping.`);
            continue;
        }
        // Verify that people have an actual version in the package.json, otherwise (label or URL or
        // gist or ...) we don't update it.
        if (version.startsWith('http:') // HTTP
            || version.startsWith('file:') // Local folder
            || version.startsWith('git:') // GIT url
            || version.match(/^\w{1,100}\/\w{1,100}/) // GitHub's "user/repo"
            || version.match(/^(?:\.{0,2}\/)\w{1,100}/) // Local folder, maybe relative.
        ) {
            // We only do that for --all. Otherwise we have the installed version and the user specified
            // it on the command line.
            if (options.all) {
                logger.warn(`Package ${JSON.stringify(npmName)} has a custom version: `
                    + `${JSON.stringify(version)}. Skipping.`);
                continue;
            }
        }
        packages.set(npmName, (maybeVersion || (options.next ? 'next' : 'latest')));
    }
    return packages;
}
function _addPackageGroup(tree, packages, allDependencies, npmPackageJson, logger) {
    const maybePackage = packages.get(npmPackageJson.name);
    if (!maybePackage) {
        return;
    }
    const info = _buildPackageInfo(tree, packages, allDependencies, npmPackageJson, logger);
    const version = (info.target && info.target.version)
        || npmPackageJson['dist-tags'][maybePackage]
        || maybePackage;
    if (!npmPackageJson.versions[version]) {
        return;
    }
    const ngUpdateMetadata = npmPackageJson.versions[version]['ng-update'];
    if (!ngUpdateMetadata) {
        return;
    }
    let packageGroup = ngUpdateMetadata['packageGroup'];
    if (!packageGroup) {
        return;
    }
    if (Array.isArray(packageGroup) && !packageGroup.some(x => typeof x != 'string')) {
        packageGroup = packageGroup.reduce((acc, curr) => {
            acc[curr] = maybePackage;
            return acc;
        }, {});
    }
    // Only need to check if it's an object because we set it right the time before.
    if (typeof packageGroup != 'object'
        || packageGroup === null
        || Object.values(packageGroup).some(v => typeof v != 'string')) {
        logger.warn(`packageGroup metadata of package ${npmPackageJson.name} is malformed.`);
        return;
    }
    Object.keys(packageGroup)
        .filter(name => !packages.has(name)) // Don't override names from the command line.
        .filter(name => allDependencies.has(name)) // Remove packages that aren't installed.
        .forEach(name => {
        packages.set(name, packageGroup[name]);
    });
}
/**
 * Add peer dependencies of packages on the command line to the list of packages to update.
 * We don't do verification of the versions here as this will be done by a later step (and can
 * be ignored by the --force flag).
 * @private
 */
function _addPeerDependencies(tree, packages, allDependencies, npmPackageJson, logger) {
    const maybePackage = packages.get(npmPackageJson.name);
    if (!maybePackage) {
        return;
    }
    const info = _buildPackageInfo(tree, packages, allDependencies, npmPackageJson, logger);
    const version = (info.target && info.target.version)
        || npmPackageJson['dist-tags'][maybePackage]
        || maybePackage;
    if (!npmPackageJson.versions[version]) {
        return;
    }
    const packageJson = npmPackageJson.versions[version];
    const error = false;
    for (const [peer, range] of Object.entries(packageJson.peerDependencies || {})) {
        if (!packages.has(peer)) {
            packages.set(peer, range);
        }
    }
    if (error) {
        throw new schematics_1.SchematicsException('An error occured, see above.');
    }
}
function _getAllDependencies(tree) {
    const packageJsonContent = tree.read('/package.json');
    if (!packageJsonContent) {
        throw new schematics_1.SchematicsException('Could not find a package.json. Are you in a Node project?');
    }
    let packageJson;
    try {
        packageJson = JSON.parse(packageJsonContent.toString());
    }
    catch (e) {
        throw new schematics_1.SchematicsException('package.json could not be parsed: ' + e.message);
    }
    return new Map([
        ...Object.entries(packageJson.peerDependencies || {}),
        ...Object.entries(packageJson.devDependencies || {}),
        ...Object.entries(packageJson.dependencies || {}),
    ]);
}
function _formatVersion(version) {
    if (version === undefined) {
        return undefined;
    }
    if (!version.match(/^\d{1,30}\.\d{1,30}\.\d{1,30}/)) {
        version += '.0';
    }
    if (!version.match(/^\d{1,30}\.\d{1,30}\.\d{1,30}/)) {
        version += '.0';
    }
    if (!semver.valid(version)) {
        throw new schematics_1.SchematicsException(`Invalid migration version: ${JSON.stringify(version)}`);
    }
    return version;
}
function default_1(options) {
    if (!options.packages) {
        // We cannot just return this because we need to fetch the packages from NPM still for the
        // help/guide to show.
        options.packages = [];
    }
    else {
        // We split every packages by commas to allow people to pass in multiple and make it an array.
        options.packages = options.packages.reduce((acc, curr) => {
            return acc.concat(curr.split(','));
        }, []);
    }
    if (options.migrateOnly && options.from) {
        if (options.packages.length !== 1) {
            throw new schematics_1.SchematicsException('--from requires that only a single package be passed.');
        }
    }
    options.from = _formatVersion(options.from);
    options.to = _formatVersion(options.to);
    return (tree, context) => {
        const logger = context.logger;
        const allDependencies = _getAllDependencies(tree);
        const packages = _buildPackageList(options, allDependencies, logger);
        const usingYarn = options.packageManager === 'yarn';
        return rxjs_1.from([...allDependencies.keys()]).pipe(
        // Grab all package.json from the npm repository. This requires a lot of HTTP calls so we
        // try to parallelize as many as possible.
        operators_1.mergeMap(depName => npm_1.getNpmPackageJson(depName, logger, { registryUrl: options.registry, usingYarn, verbose: options.verbose })), 
        // Build a map of all dependencies and their packageJson.
        operators_1.reduce((acc, npmPackageJson) => {
            // If the package was not found on the registry. It could be private, so we will just
            // ignore. If the package was part of the list, we will error out, but will simply ignore
            // if it's either not requested (so just part of package.json. silently) or if it's a
            // `--all` situation. There is an edge case here where a public package peer depends on a
            // private one, but it's rare enough.
            if (!npmPackageJson.name) {
                if (packages.has(npmPackageJson.requestedName)) {
                    if (options.all) {
                        logger.warn(`Package ${JSON.stringify(npmPackageJson.requestedName)} was not `
                            + 'found on the registry. Skipping.');
                    }
                    else {
                        throw new schematics_1.SchematicsException(`Package ${JSON.stringify(npmPackageJson.requestedName)} was not found on the `
                            + 'registry. Cannot continue as this may be an error.');
                    }
                }
            }
            else {
                acc.set(npmPackageJson.name, npmPackageJson);
            }
            return acc;
        }, new Map()), operators_1.map(npmPackageJsonMap => {
            // Augment the command line package list with packageGroups and forward peer dependencies.
            // Each added package may uncover new package groups and peer dependencies, so we must
            // repeat this process until the package list stabilizes.
            let lastPackagesSize;
            do {
                lastPackagesSize = packages.size;
                npmPackageJsonMap.forEach((npmPackageJson) => {
                    _addPackageGroup(tree, packages, allDependencies, npmPackageJson, logger);
                    _addPeerDependencies(tree, packages, allDependencies, npmPackageJson, logger);
                });
            } while (packages.size > lastPackagesSize);
            // Build the PackageInfo for each module.
            const packageInfoMap = new Map();
            npmPackageJsonMap.forEach((npmPackageJson) => {
                packageInfoMap.set(npmPackageJson.name, _buildPackageInfo(tree, packages, allDependencies, npmPackageJson, logger));
            });
            return packageInfoMap;
        }), operators_1.switchMap(infoMap => {
            // Now that we have all the information, check the flags.
            if (packages.size > 0) {
                if (options.migrateOnly && options.from && options.packages) {
                    return _migrateOnly(infoMap.get(options.packages[0]), context, options.from, options.to);
                }
                const sublog = new core_1.logging.LevelCapLogger('validation', logger.createChild(''), 'warn');
                _validateUpdatePackages(infoMap, !!options.force, sublog);
                return _performUpdate(tree, context, infoMap, logger, !!options.migrateOnly);
            }
            else {
                return _usageMessage(options, infoMap, logger);
            }
        }), operators_1.switchMap(() => rxjs_1.of(tree)));
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3NjaGVtYXRpY3MvdXBkYXRlL3VwZGF0ZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQUErQztBQUMvQywyREFNb0M7QUFDcEMsNERBQTRGO0FBQzVGLCtCQUE4RDtBQUM5RCw4Q0FBa0U7QUFDbEUsaUNBQWlDO0FBQ2pDLCtCQUEwQztBQVMxQyxrR0FBa0c7QUFDbEcsK0ZBQStGO0FBQy9GLDhGQUE4RjtBQUM5Rix3RkFBd0Y7QUFDeEYscUNBQXFDO0FBQ3JDLFNBQWdCLDJCQUEyQixDQUFDLEtBQWE7SUFDdkQsS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRTtRQUN6QyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksS0FBSyxJQUFJLEVBQUUsRUFBRTtZQUNmLHNEQUFzRDtZQUN0RCxpREFBaUQ7WUFDakQsT0FBTyxLQUFLLENBQUM7U0FDZDtLQUNGO0lBRUQsNEZBQTRGO0lBQzVGLGdHQUFnRztJQUNoRywwRkFBMEY7SUFDMUYsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDdkMsUUFBUSxJQUFJLFFBQVEsS0FBSyxJQUFJLEtBQUssYUFBYSxDQUFDO0tBQ2pEO0lBRUQsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQztBQUM5QyxDQUFDO0FBckJELGtFQXFCQztBQUdELGlHQUFpRztBQUNqRyxpQkFBaUI7QUFDakIsTUFBTSx1QkFB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ZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IGxvZ2dpbmcgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQge1xuICBSdWxlLFxuICBTY2hlbWF0aWNDb250ZXh0LFxuICBTY2hlbWF0aWNzRXhjZXB0aW9uLFxuICBUYXNrSWQsXG4gIFRyZWUsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2ssIFJ1blNjaGVtYXRpY1Rhc2sgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90YXNrcyc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBmcm9tIGFzIG9ic2VydmFibGVGcm9tLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgbWFwLCBtZXJnZU1hcCwgcmVkdWNlLCBzd2l0Y2hNYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7IGdldE5wbVBhY2thZ2VKc29uIH0gZnJvbSAnLi9ucG0nO1xuaW1wb3J0IHsgTnBtUmVwb3NpdG9yeVBhY2thZ2VKc29uIH0gZnJvbSAnLi9ucG0tcGFja2FnZS1qc29uJztcbmltcG9ydCB7IERlcGVuZGVuY3ksIEpzb25TY2hlbWFGb3JOcG1QYWNrYWdlSnNvbkZpbGVzIH0gZnJvbSAnLi9wYWNrYWdlLWpzb24nO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFVwZGF0ZVNjaGVtYSB9IGZyb20gJy4vc2NoZW1hJztcblxudHlwZSBWZXJzaW9uUmFuZ2UgPSBzdHJpbmcgJiB7IF9fVkVSU0lPTl9SQU5HRTogdm9pZDsgfTtcbnR5cGUgUGVlclZlcnNpb25UcmFuc2Zvcm0gPSBzdHJpbmcgfCAoKHJhbmdlOiBzdHJpbmcpID0+IHN0cmluZyk7XG5cblxuLy8gQW5ndWxhciBndWFyYW50ZWVzIHRoYXQgYSBtYWpvciBpcyBjb21wYXRpYmxlIHdpdGggaXRzIGZvbGxvd2luZyBtYWpvciAoc28gcGFja2FnZXMgdGhhdCBkZXBlbmRcbi8vIG9uIEFuZ3VsYXIgNSBhcmUgYWxzbyBjb21wYXRpYmxlIHdpdGggQW5ndWxhciA2KS4gVGhpcyBpcywgaW4gY29kZSwgcmVwcmVzZW50ZWQgYnkgdmVyaWZ5aW5nXG4vLyB0aGF0IGFsbCBvdGhlciBwYWNrYWdlcyB0aGF0IGhhdmUgYSBwZWVyIGRlcGVuZGVuY3kgb2YgYFwiQGFuZ3VsYXIvY29yZVwiOiBcIl41LjAuMFwiYCBhY3R1YWxseVxuLy8gc3VwcG9ydHMgNi4wLCBieSBhZGRpbmcgdGhhdCBjb21wYXRpYmlsaXR5IHRvIHRoZSByYW5nZSwgc28gaXQgaXMgYF41LjAuMCB8fCBeNi4wLjBgLlxuLy8gV2UgZXhwb3J0IGl0IHRvIGFsbG93IGZvciB0ZXN0aW5nLlxuZXhwb3J0IGZ1bmN0aW9uIGFuZ3VsYXJNYWpvckNvbXBhdEd1YXJhbnRlZShyYW5nZTogc3RyaW5nKSB7XG4gIHJhbmdlID0gc2VtdmVyLnZhbGlkUmFuZ2UocmFuZ2UpO1xuICBsZXQgbWFqb3IgPSAxO1xuICB3aGlsZSAoIXNlbXZlci5ndHIobWFqb3IgKyAnLjAuMCcsIHJhbmdlKSkge1xuICAgIG1ham9yKys7XG4gICAgaWYgKG1ham9yID49IDk5KSB7XG4gICAgICAvLyBVc2Ugb3JpZ2luYWwgcmFuZ2UgaWYgaXQgc3VwcG9ydHMgYSBtYWpvciB0aGlzIGhpZ2hcbiAgICAgIC8vIFJhbmdlIGlzIG1vc3QgbGlrZWx5IHVuYm91bmRlZCAoZS5nLiwgPj01LjAuMClcbiAgICAgIHJldHVybiByYW5nZTtcbiAgICB9XG4gIH1cblxuICAvLyBBZGQgdGhlIG1ham9yIHZlcnNpb24gYXMgY29tcGF0aWJsZSB3aXRoIHRoZSBhbmd1bGFyIGNvbXBhdGlibGUsIHdpdGggYWxsIG1pbm9ycy4gVGhpcyBpc1xuICAvLyBhbHJlYWR5IG9uZSBtYWpvciBhYm92ZSB0aGUgZ3JlYXRlc3Qgc3VwcG9ydGVkLCBiZWNhdXNlIHdlIGluY3JlbWVudCBgbWFqb3JgIGJlZm9yZSBjaGVja2luZy5cbiAgLy8gV2UgYWRkIG1pbm9ycyBsaWtlIHRoaXMgYmVjYXVzZSBhIG1pbm9yIGJldGEgaXMgc3RpbGwgY29tcGF0aWJsZSB3aXRoIGEgbWlub3Igbm9uLWJldGEuXG4gIGxldCBuZXdSYW5nZSA9IHJhbmdlO1xuICBmb3IgKGxldCBtaW5vciA9IDA7IG1pbm9yIDwgMjA7IG1pbm9yKyspIHtcbiAgICBuZXdSYW5nZSArPSBgIHx8IF4ke21ham9yfS4ke21pbm9yfS4wLWFscGhhLjAgYDtcbiAgfVxuXG4gIHJldHVybiBzZW12ZXIudmFsaWRSYW5nZShuZXdSYW5nZSkgfHwgcmFuZ2U7XG59XG5cblxuLy8gVGhpcyBpcyBhIG1hcCBvZiBwYWNrYWdlR3JvdXBOYW1lIHRvIHJhbmdlIGV4dGVuZGluZyBmdW5jdGlvbi4gSWYgaXQgaXNuJ3QgZm91bmQsIHRoZSByYW5nZSBpc1xuLy8ga2VwdCB0aGUgc2FtZS5cbmNvbnN0IHBlZXJDb21wYXRpYmxlV2hpdGVsaXN0OiB7IFtuYW1lOiBzdHJpbmddOiBQZWVyVmVyc2lvblRyYW5zZm9ybSB9ID0ge1xuICAnQGFuZ3VsYXIvY29yZSc6IGFuZ3VsYXJNYWpvckNvbXBhdEd1YXJhbnRlZSxcbn07XG5cbmludGVyZmFjZSBQYWNrYWdlVmVyc2lvbkluZm8ge1xuICB2ZXJzaW9uOiBWZXJzaW9uUmFuZ2U7XG4gIHBhY2thZ2VKc29uOiBKc29uU2NoZW1hRm9yTnBtUGFja2FnZUpzb25GaWxlcztcbiAgdXBkYXRlTWV0YWRhdGE6IFVwZGF0ZU1ldGFkYXRhO1xufVxuXG5pbnRlcmZhY2UgUGFja2FnZUluZm8ge1xuICBuYW1lOiBzdHJpbmc7XG4gIG5wbVBhY2thZ2VKc29uOiBOcG1SZXBvc2l0b3J5UGFja2FnZUpzb247XG4gIGluc3RhbGxlZDogUGFja2FnZVZlcnNpb25JbmZvO1xuICB0YXJnZXQ/OiBQYWNrYWdlVmVyc2lvbkluZm87XG4gIHBhY2thZ2VKc29uUmFuZ2U6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIFVwZGF0ZU1ldGFkYXRhIHtcbiAgcGFja2FnZUdyb3VwTmFtZT86IHN0cmluZztcbiAgcGFja2FnZUdyb3VwOiB7IFsgcGFja2FnZU5hbWU6IHN0cmluZyBdOiBzdHJpbmcgfTtcbiAgcmVxdWlyZW1lbnRzOiB7IFtwYWNrYWdlTmFtZTogc3RyaW5nXTogc3RyaW5nIH07XG4gIG1pZ3JhdGlvbnM/OiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIF91cGRhdGVQZWVyVmVyc2lvbihpbmZvTWFwOiBNYXA8c3RyaW5nLCBQYWNrYWdlSW5mbz4sIG5hbWU6IHN0cmluZywgcmFuZ2U6IHN0cmluZykge1xuICAvLyBSZXNvbHZlIHBhY2thZ2VHcm91cE5hbWUuXG4gIGNvbnN0IG1heWJlUGFja2FnZUluZm8gPSBpbmZvTWFwLmdldChuYW1lKTtcbiAgaWYgKCFtYXliZVBhY2thZ2VJbmZvKSB7XG4gICAgcmV0dXJuIHJhbmdlO1xuICB9XG4gIGlmIChtYXliZVBhY2thZ2VJbmZvLnRhcmdldCkge1xuICAgIG5hbWUgPSBtYXliZVBhY2thZ2VJbmZvLnRhcmdldC51cGRhdGVNZXRhZGF0YS5wYWNrYWdlR3JvdXBOYW1lIHx8IG5hbWU7XG4gIH0gZWxzZSB7XG4gICAgbmFtZSA9IG1heWJlUGFja2FnZUluZm8uaW5zdGFsbGVkLnVwZGF0ZU1ldGFkYXRhLnBhY2thZ2VHcm91cE5hbWUgfHwgbmFtZTtcbiAgfVxuXG4gIGNvbnN0IG1heWJlVHJhbnNmb3JtID0gcGVlckNvbXBhdGlibGVXaGl0ZWxpc3RbbmFtZV07XG4gIGlmIChtYXliZVRyYW5zZm9ybSkge1xuICAgIGlmICh0eXBlb2YgbWF5YmVUcmFuc2Zvcm0gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG1heWJlVHJhbnNmb3JtKHJhbmdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1heWJlVHJhbnNmb3JtO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByYW5nZTtcbn1cblxuZnVuY3Rpb24gX3ZhbGlkYXRlRm9yd2FyZFBlZXJEZXBlbmRlbmNpZXMoXG4gIG5hbWU6IHN0cmluZyxcbiAgaW5mb01hcDogTWFwPHN0cmluZywgUGFja2FnZUluZm8+LFxuICBwZWVyczoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9LFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKTogYm9vbGVhbiB7XG4gIGZvciAoY29uc3QgW3BlZXIsIHJhbmdlXSBvZiBPYmplY3QuZW50cmllcyhwZWVycykpIHtcbiAgICBsb2dnZXIuZGVidWcoYENoZWNraW5nIGZvcndhcmQgcGVlciAke3BlZXJ9Li4uYCk7XG4gICAgY29uc3QgbWF5YmVQZWVySW5mbyA9IGluZm9NYXAuZ2V0KHBlZXIpO1xuICAgIGlmICghbWF5YmVQZWVySW5mbykge1xuICAgICAgbG9nZ2VyLmVycm9yKFtcbiAgICAgICAgYFBhY2thZ2UgJHtKU09OLnN0cmluZ2lmeShuYW1lKX0gaGFzIGEgbWlzc2luZyBwZWVyIGRlcGVuZGVuY3kgb2ZgLFxuICAgICAgICBgJHtKU09OLnN0cmluZ2lmeShwZWVyKX0gQCAke0pTT04uc3RyaW5naWZ5KHJhbmdlKX0uYCxcbiAgICAgIF0uam9pbignICcpKTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgcGVlclZlcnNpb24gPSBtYXliZVBlZXJJbmZvLnRhcmdldCAmJiBtYXliZVBlZXJJbmZvLnRhcmdldC5wYWNrYWdlSnNvbi52ZXJzaW9uXG4gICAgICA/IG1heWJlUGVlckluZm8udGFyZ2V0LnBhY2thZ2VKc29uLnZlcnNpb25cbiAgICAgIDogbWF5YmVQZWVySW5mby5pbnN0YWxsZWQudmVyc2lvbjtcblxuICAgIGxvZ2dlci5kZWJ1ZyhgICBSYW5nZSBpbnRlcnNlY3RzKCR7cmFuZ2V9LCAke3BlZXJWZXJzaW9ufSkuLi5gKTtcbiAgICBpZiAoIXNlbXZlci5zYXRpc2ZpZXMocGVlclZlcnNpb24sIHJhbmdlKSkge1xuICAgICAgbG9nZ2VyLmVycm9yKFtcbiAgICAgICAgYFBhY2thZ2UgJHtKU09OLnN0cmluZ2lmeShuYW1lKX0gaGFzIGFuIGluY29tcGF0aWJsZSBwZWVyIGRlcGVuZGVuY3kgdG9gLFxuICAgICAgICBgJHtKU09OLnN0cmluZ2lmeShwZWVyKX0gKHJlcXVpcmVzICR7SlNPTi5zdHJpbmdpZnkocmFuZ2UpfSxgLFxuICAgICAgICBgd291bGQgaW5zdGFsbCAke0pTT04uc3RyaW5naWZ5KHBlZXJWZXJzaW9uKX0pYCxcbiAgICAgIF0uam9pbignICcpKTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmZ1bmN0aW9uIF92YWxpZGF0ZVJldmVyc2VQZWVyRGVwZW5kZW5jaWVzKFxuICBuYW1lOiBzdHJpbmcsXG4gIHZlcnNpb246IHN0cmluZyxcbiAgaW5mb01hcDogTWFwPHN0cmluZywgUGFja2FnZUluZm8+LFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKSB7XG4gIGZvciAoY29uc3QgW2luc3RhbGxlZCwgaW5zdGFsbGVkSW5mb10gb2YgaW5mb01hcC5lbnRyaWVzKCkpIHtcbiAgICBjb25zdCBpbnN0YWxsZWRMb2dnZXIgPSBsb2dnZXIuY3JlYXRlQ2hpbGQoaW5zdGFsbGVkKTtcbiAgICBpbnN0YWxsZWRMb2dnZXIuZGVidWcoYCR7aW5zdGFsbGVkfS4uLmApO1xuICAgIGNvbnN0IHBlZXJzID0gKGluc3RhbGxlZEluZm8udGFyZ2V0IHx8IGluc3RhbGxlZEluZm8uaW5zdGFsbGVkKS5wYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzO1xuXG4gICAgZm9yIChjb25zdCBbcGVlciwgcmFuZ2VdIG9mIE9iamVjdC5lbnRyaWVzKHBlZXJzIHx8IHt9KSkge1xuICAgICAgaWYgKHBlZXIgIT0gbmFtZSkge1xuICAgICAgICAvLyBPbmx5IGNoZWNrIHBlZXJzIHRvIHRoZSBwYWNrYWdlcyB3ZSdyZSB1cGRhdGluZy4gV2UgZG9uJ3QgY2FyZSBhYm91dCBwZWVyc1xuICAgICAgICAvLyB0aGF0IGFyZSB1bm1ldCBidXQgd2UgaGF2ZSBubyBlZmZlY3Qgb24uXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBPdmVycmlkZSB0aGUgcGVlciB2ZXJzaW9uIHJhbmdlIGlmIGl0J3Mgd2hpdGVsaXN0ZWQuXG4gICAgICBjb25zdCBleHRlbmRlZFJhbmdlID0gX3VwZGF0ZVBlZXJWZXJzaW9uKGluZm9NYXAsIHBlZXIsIHJhbmdlKTtcblxuICAgICAgaWYgKCFzZW12ZXIuc2F0aXNmaWVzKHZlcnNpb24sIGV4dGVuZGVkUmFuZ2UpKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihbXG4gICAgICAgICAgYFBhY2thZ2UgJHtKU09OLnN0cmluZ2lmeShpbnN0YWxsZWQpfSBoYXMgYW4gaW5jb21wYXRpYmxlIHBlZXIgZGVwZW5kZW5jeSB0b2AsXG4gICAgICAgICAgYCR7SlNPTi5zdHJpbmdpZnkobmFtZSl9IChyZXF1aXJlc2AsXG4gICAgICAgICAgYCR7SlNPTi5zdHJpbmdpZnkocmFuZ2UpfSR7ZXh0ZW5kZWRSYW5nZSA9PSByYW5nZSA/ICcnIDogJyAoZXh0ZW5kZWQpJ30sYCxcbiAgICAgICAgICBgd291bGQgaW5zdGFsbCAke0pTT04uc3RyaW5naWZ5KHZlcnNpb24pfSkuYCxcbiAgICAgICAgXS5qb2luKCcgJykpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gX3ZhbGlkYXRlVXBkYXRlUGFja2FnZXMoXG4gIGluZm9NYXA6IE1hcDxzdHJpbmcsIFBhY2thZ2VJbmZvPixcbiAgZm9yY2U6IGJvb2xlYW4sXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4pOiB2b2lkIHtcbiAgbG9nZ2VyLmRlYnVnKCdVcGRhdGluZyB0aGUgZm9sbG93aW5nIHBhY2thZ2VzOicpO1xuICBpbmZvTWFwLmZvckVhY2goaW5mbyA9PiB7XG4gICAgaWYgKGluZm8udGFyZ2V0KSB7XG4gICAgICBsb2dnZXIuZGVidWcoYCAgJHtpbmZvLm5hbWV9ID0+ICR7aW5mby50YXJnZXQudmVyc2lvbn1gKTtcbiAgICB9XG4gIH0pO1xuXG4gIGxldCBwZWVyRXJyb3JzID0gZmFsc2U7XG4gIGluZm9NYXAuZm9yRWFjaChpbmZvID0+IHtcbiAgICBjb25zdCB7bmFtZSwgdGFyZ2V0fSA9IGluZm87XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwa2dMb2dnZXIgPSBsb2dnZXIuY3JlYXRlQ2hpbGQobmFtZSk7XG4gICAgbG9nZ2VyLmRlYnVnKGAke25hbWV9Li4uYCk7XG5cbiAgICBjb25zdCBwZWVycyA9IHRhcmdldC5wYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzIHx8IHt9O1xuICAgIHBlZXJFcnJvcnMgPSBfdmFsaWRhdGVGb3J3YXJkUGVlckRlcGVuZGVuY2llcyhuYW1lLCBpbmZvTWFwLCBwZWVycywgcGtnTG9nZ2VyKSB8fCBwZWVyRXJyb3JzO1xuICAgIHBlZXJFcnJvcnNcbiAgICAgID0gX3ZhbGlkYXRlUmV2ZXJzZVBlZXJEZXBlbmRlbmNpZXMobmFtZSwgdGFyZ2V0LnZlcnNpb24sIGluZm9NYXAsIHBrZ0xvZ2dlcilcbiAgICAgIHx8IHBlZXJFcnJvcnM7XG4gIH0pO1xuXG4gIGlmICghZm9yY2UgJiYgcGVlckVycm9ycykge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBJbmNvbXBhdGlibGUgcGVlciBkZXBlbmRlbmNpZXMgZm91bmQuIFNlZSBhYm92ZS5gKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIF9wZXJmb3JtVXBkYXRlKFxuICB0cmVlOiBUcmVlLFxuICBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0LFxuICBpbmZvTWFwOiBNYXA8c3RyaW5nLCBQYWNrYWdlSW5mbz4sXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4gIG1pZ3JhdGVPbmx5OiBib29sZWFuLFxuKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gIGNvbnN0IHBhY2thZ2VKc29uQ29udGVudCA9IHRyZWUucmVhZCgnL3BhY2thZ2UuanNvbicpO1xuICBpZiAoIXBhY2thZ2VKc29uQ29udGVudCkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdDb3VsZCBub3QgZmluZCBhIHBhY2thZ2UuanNvbi4gQXJlIHlvdSBpbiBhIE5vZGUgcHJvamVjdD8nKTtcbiAgfVxuXG4gIGxldCBwYWNrYWdlSnNvbjogSnNvblNjaGVtYUZvck5wbVBhY2thZ2VKc29uRmlsZXM7XG4gIHRyeSB7XG4gICAgcGFja2FnZUpzb24gPSBKU09OLnBhcnNlKHBhY2thZ2VKc29uQ29udGVudC50b1N0cmluZygpKSBhcyBKc29uU2NoZW1hRm9yTnBtUGFja2FnZUpzb25GaWxlcztcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdwYWNrYWdlLmpzb24gY291bGQgbm90IGJlIHBhcnNlZDogJyArIGUubWVzc2FnZSk7XG4gIH1cblxuICBjb25zdCB1cGRhdGVEZXBlbmRlbmN5ID0gKGRlcHM6IERlcGVuZGVuY3ksIG5hbWU6IHN0cmluZywgbmV3VmVyc2lvbjogc3RyaW5nKSA9PiB7XG4gICAgY29uc3Qgb2xkVmVyc2lvbiA9IGRlcHNbbmFtZV07XG4gICAgLy8gV2Ugb25seSByZXNwZWN0IGNhcmV0IGFuZCB0aWxkZSByYW5nZXMgb24gdXBkYXRlLlxuICAgIGNvbnN0IGV4ZWNSZXN1bHQgPSAvXltcXF5+XS8uZXhlYyhvbGRWZXJzaW9uKTtcbiAgICBkZXBzW25hbWVdID0gYCR7ZXhlY1Jlc3VsdCA/IGV4ZWNSZXN1bHRbMF0gOiAnJ30ke25ld1ZlcnNpb259YDtcbiAgfTtcblxuICBjb25zdCB0b0luc3RhbGwgPSBbLi4uaW5mb01hcC52YWx1ZXMoKV1cbiAgICAgIC5tYXAoeCA9PiBbeC5uYW1lLCB4LnRhcmdldCwgeC5pbnN0YWxsZWRdKVxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgLmZpbHRlcigoW25hbWUsIHRhcmdldCwgaW5zdGFsbGVkXSkgPT4ge1xuICAgICAgICByZXR1cm4gISFuYW1lICYmICEhdGFyZ2V0ICYmICEhaW5zdGFsbGVkO1xuICAgICAgfSkgYXMgW3N0cmluZywgUGFja2FnZVZlcnNpb25JbmZvLCBQYWNrYWdlVmVyc2lvbkluZm9dW107XG5cbiAgdG9JbnN0YWxsLmZvckVhY2goKFtuYW1lLCB0YXJnZXQsIGluc3RhbGxlZF0pID0+IHtcbiAgICBsb2dnZXIuaW5mbyhcbiAgICAgIGBVcGRhdGluZyBwYWNrYWdlLmpzb24gd2l0aCBkZXBlbmRlbmN5ICR7bmFtZX0gYFxuICAgICAgKyBgQCAke0pTT04uc3RyaW5naWZ5KHRhcmdldC52ZXJzaW9uKX0gKHdhcyAke0pTT04uc3RyaW5naWZ5KGluc3RhbGxlZC52ZXJzaW9uKX0pLi4uYCxcbiAgICApO1xuXG4gICAgaWYgKHBhY2thZ2VKc29uLmRlcGVuZGVuY2llcyAmJiBwYWNrYWdlSnNvbi5kZXBlbmRlbmNpZXNbbmFtZV0pIHtcbiAgICAgIHVwZGF0ZURlcGVuZGVuY3kocGFja2FnZUpzb24uZGVwZW5kZW5jaWVzLCBuYW1lLCB0YXJnZXQudmVyc2lvbik7XG5cbiAgICAgIGlmIChwYWNrYWdlSnNvbi5kZXZEZXBlbmRlbmNpZXMgJiYgcGFja2FnZUpzb24uZGV2RGVwZW5kZW5jaWVzW25hbWVdKSB7XG4gICAgICAgIGRlbGV0ZSBwYWNrYWdlSnNvbi5kZXZEZXBlbmRlbmNpZXNbbmFtZV07XG4gICAgICB9XG4gICAgICBpZiAocGFja2FnZUpzb24ucGVlckRlcGVuZGVuY2llcyAmJiBwYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzW25hbWVdKSB7XG4gICAgICAgIGRlbGV0ZSBwYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzW25hbWVdO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocGFja2FnZUpzb24uZGV2RGVwZW5kZW5jaWVzICYmIHBhY2thZ2VKc29uLmRldkRlcGVuZGVuY2llc1tuYW1lXSkge1xuICAgICAgdXBkYXRlRGVwZW5kZW5jeShwYWNrYWdlSnNvbi5kZXZEZXBlbmRlbmNpZXMsIG5hbWUsIHRhcmdldC52ZXJzaW9uKTtcblxuICAgICAgaWYgKHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXMgJiYgcGFja2FnZUpzb24ucGVlckRlcGVuZGVuY2llc1tuYW1lXSkge1xuICAgICAgICBkZWxldGUgcGFja2FnZUpzb24ucGVlckRlcGVuZGVuY2llc1tuYW1lXTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXMgJiYgcGFja2FnZUpzb24ucGVlckRlcGVuZGVuY2llc1tuYW1lXSkge1xuICAgICAgdXBkYXRlRGVwZW5kZW5jeShwYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzLCBuYW1lLCB0YXJnZXQudmVyc2lvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci53YXJuKGBQYWNrYWdlICR7bmFtZX0gd2FzIG5vdCBmb3VuZCBpbiBkZXBlbmRlbmNpZXMuYCk7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCBuZXdDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkocGFja2FnZUpzb24sIG51bGwsIDIpO1xuICBpZiAocGFja2FnZUpzb25Db250ZW50LnRvU3RyaW5nKCkgIT0gbmV3Q29udGVudCB8fCBtaWdyYXRlT25seSkge1xuICAgIGxldCBpbnN0YWxsVGFzazogVGFza0lkW10gPSBbXTtcbiAgICBpZiAoIW1pZ3JhdGVPbmx5KSB7XG4gICAgICAvLyBJZiBzb21ldGhpbmcgY2hhbmdlZCwgYWxzbyBob29rIHVwIHRoZSB0YXNrLlxuICAgICAgdHJlZS5vdmVyd3JpdGUoJy9wYWNrYWdlLmpzb24nLCBKU09OLnN0cmluZ2lmeShwYWNrYWdlSnNvbiwgbnVsbCwgMikpO1xuICAgICAgaW5zdGFsbFRhc2sgPSBbY29udGV4dC5hZGRUYXNrKG5ldyBOb2RlUGFja2FnZUluc3RhbGxUYXNrKCkpXTtcbiAgICB9XG5cbiAgICAvLyBSdW4gdGhlIG1pZ3JhdGUgc2NoZW1hdGljcyB3aXRoIHRoZSBsaXN0IG9mIHBhY2thZ2VzIHRvIHVzZS4gVGhlIGNvbGxlY3Rpb24gY29udGFpbnNcbiAgICAvLyB2ZXJzaW9uIGluZm9ybWF0aW9uIGFuZCB3ZSBuZWVkIHRvIGRvIHRoaXMgcG9zdCBpbnN0YWxsYXRpb24uIFBsZWFzZSBub3RlIHRoYXQgdGhlXG4gICAgLy8gbWlncmF0aW9uIENPVUxEIGZhaWwgYW5kIGxlYXZlIHNpZGUgZWZmZWN0cyBvbiBkaXNrLlxuICAgIC8vIFJ1biB0aGUgc2NoZW1hdGljcyB0YXNrIG9mIHRob3NlIHBhY2thZ2VzLlxuICAgIHRvSW5zdGFsbC5mb3JFYWNoKChbbmFtZSwgdGFyZ2V0LCBpbnN0YWxsZWRdKSA9PiB7XG4gICAgICBpZiAoIXRhcmdldC51cGRhdGVNZXRhZGF0YS5taWdyYXRpb25zKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29sbGVjdGlvbiA9IChcbiAgICAgICAgdGFyZ2V0LnVwZGF0ZU1ldGFkYXRhLm1pZ3JhdGlvbnMubWF0Y2goL15bLi9dLylcbiAgICAgICAgPyBuYW1lICsgJy8nXG4gICAgICAgIDogJydcbiAgICAgICkgKyB0YXJnZXQudXBkYXRlTWV0YWRhdGEubWlncmF0aW9ucztcblxuICAgICAgY29udGV4dC5hZGRUYXNrKG5ldyBSdW5TY2hlbWF0aWNUYXNrKCdAc2NoZW1hdGljcy91cGRhdGUnLCAnbWlncmF0ZScsIHtcbiAgICAgICAgICBwYWNrYWdlOiBuYW1lLFxuICAgICAgICAgIGNvbGxlY3Rpb24sXG4gICAgICAgICAgZnJvbTogaW5zdGFsbGVkLnZlcnNpb24sXG4gICAgICAgICAgdG86IHRhcmdldC52ZXJzaW9uLFxuICAgICAgICB9KSxcbiAgICAgICAgaW5zdGFsbFRhc2ssXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIG9mPHZvaWQ+KHVuZGVmaW5lZCk7XG59XG5cbmZ1bmN0aW9uIF9taWdyYXRlT25seShcbiAgaW5mbzogUGFja2FnZUluZm8gfCB1bmRlZmluZWQsXG4gIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQsXG4gIGZyb206IHN0cmluZyxcbiAgdG8/OiBzdHJpbmcsXG4pIHtcbiAgaWYgKCFpbmZvKSB7XG4gICAgcmV0dXJuIG9mPHZvaWQ+KCk7XG4gIH1cblxuICBjb25zdCB0YXJnZXQgPSBpbmZvLmluc3RhbGxlZDtcbiAgaWYgKCF0YXJnZXQgfHwgIXRhcmdldC51cGRhdGVNZXRhZGF0YS5taWdyYXRpb25zKSB7XG4gICAgcmV0dXJuIG9mPHZvaWQ+KHVuZGVmaW5lZCk7XG4gIH1cblxuICBjb25zdCBjb2xsZWN0aW9uID0gKFxuICAgIHRhcmdldC51cGRhdGVNZXRhZGF0YS5taWdyYXRpb25zLm1hdGNoKC9eWy4vXS8pXG4gICAgICA/IGluZm8ubmFtZSArICcvJ1xuICAgICAgOiAnJ1xuICApICsgdGFyZ2V0LnVwZGF0ZU1ldGFkYXRhLm1pZ3JhdGlvbnM7XG5cbiAgY29udGV4dC5hZGRUYXNrKG5ldyBSdW5TY2hlbWF0aWNUYXNrKCdAc2NoZW1hdGljcy91cGRhdGUnLCAnbWlncmF0ZScsIHtcbiAgICAgIHBhY2thZ2U6IGluZm8ubmFtZSxcbiAgICAgIGNvbGxlY3Rpb24sXG4gICAgICBmcm9tOiBmcm9tLFxuICAgICAgdG86IHRvIHx8IHRhcmdldC52ZXJzaW9uLFxuICAgIH0pLFxuICApO1xuXG4gIHJldHVybiBvZjx2b2lkPih1bmRlZmluZWQpO1xufVxuXG5mdW5jdGlvbiBfZ2V0VXBkYXRlTWV0YWRhdGEoXG4gIHBhY2thZ2VKc29uOiBKc29uU2NoZW1hRm9yTnBtUGFja2FnZUpzb25GaWxlcyxcbiAgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSxcbik6IFVwZGF0ZU1ldGFkYXRhIHtcbiAgY29uc3QgbWV0YWRhdGEgPSBwYWNrYWdlSnNvblsnbmctdXBkYXRlJ107XG5cbiAgY29uc3QgcmVzdWx0OiBVcGRhdGVNZXRhZGF0YSA9IHtcbiAgICBwYWNrYWdlR3JvdXA6IHt9LFxuICAgIHJlcXVpcmVtZW50czoge30sXG4gIH07XG5cbiAgaWYgKCFtZXRhZGF0YSB8fCB0eXBlb2YgbWV0YWRhdGEgIT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShtZXRhZGF0YSkpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKG1ldGFkYXRhWydwYWNrYWdlR3JvdXAnXSkge1xuICAgIGNvbnN0IHBhY2thZ2VHcm91cCA9IG1ldGFkYXRhWydwYWNrYWdlR3JvdXAnXTtcbiAgICAvLyBWZXJpZnkgdGhhdCBwYWNrYWdlR3JvdXAgaXMgYW4gYXJyYXkgb2Ygc3RyaW5ncyBvciBhbiBtYXAgb2YgdmVyc2lvbnMuIFRoaXMgaXMgbm90IGFuIGVycm9yXG4gICAgLy8gYnV0IHdlIHN0aWxsIHdhcm4gdGhlIHVzZXIgYW5kIGlnbm9yZSB0aGUgcGFja2FnZUdyb3VwIGtleXMuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocGFja2FnZUdyb3VwKSAmJiBwYWNrYWdlR3JvdXAuZXZlcnkoeCA9PiB0eXBlb2YgeCA9PSAnc3RyaW5nJykpIHtcbiAgICAgIHJlc3VsdC5wYWNrYWdlR3JvdXAgPSBwYWNrYWdlR3JvdXAucmVkdWNlKChncm91cCwgbmFtZSkgPT4ge1xuICAgICAgICBncm91cFtuYW1lXSA9IHBhY2thZ2VKc29uLnZlcnNpb247XG5cbiAgICAgICAgcmV0dXJuIGdyb3VwO1xuICAgICAgfSwgcmVzdWx0LnBhY2thZ2VHcm91cCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGFja2FnZUdyb3VwID09ICdvYmplY3QnICYmIHBhY2thZ2VHcm91cFxuICAgICAgICAgICAgICAgJiYgT2JqZWN0LnZhbHVlcyhwYWNrYWdlR3JvdXApLmV2ZXJ5KHggPT4gdHlwZW9mIHggPT0gJ3N0cmluZycpKSB7XG4gICAgICByZXN1bHQucGFja2FnZUdyb3VwID0gcGFja2FnZUdyb3VwO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIud2FybihcbiAgICAgICAgYHBhY2thZ2VHcm91cCBtZXRhZGF0YSBvZiBwYWNrYWdlICR7cGFja2FnZUpzb24ubmFtZX0gaXMgbWFsZm9ybWVkLiBJZ25vcmluZy5gLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXN1bHQucGFja2FnZUdyb3VwTmFtZSA9IE9iamVjdC5rZXlzKHJlc3VsdC5wYWNrYWdlR3JvdXApWzBdO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBtZXRhZGF0YVsncGFja2FnZUdyb3VwTmFtZSddID09ICdzdHJpbmcnKSB7XG4gICAgcmVzdWx0LnBhY2thZ2VHcm91cE5hbWUgPSBtZXRhZGF0YVsncGFja2FnZUdyb3VwTmFtZSddO1xuICB9XG5cbiAgaWYgKG1ldGFkYXRhWydyZXF1aXJlbWVudHMnXSkge1xuICAgIGNvbnN0IHJlcXVpcmVtZW50cyA9IG1ldGFkYXRhWydyZXF1aXJlbWVudHMnXTtcbiAgICAvLyBWZXJpZnkgdGhhdCByZXF1aXJlbWVudHMgYXJlXG4gICAgaWYgKHR5cGVvZiByZXF1aXJlbWVudHMgIT0gJ29iamVjdCdcbiAgICAgICAgfHwgQXJyYXkuaXNBcnJheShyZXF1aXJlbWVudHMpXG4gICAgICAgIHx8IE9iamVjdC5rZXlzKHJlcXVpcmVtZW50cykuc29tZShuYW1lID0+IHR5cGVvZiByZXF1aXJlbWVudHNbbmFtZV0gIT0gJ3N0cmluZycpKSB7XG4gICAgICBsb2dnZXIud2FybihcbiAgICAgICAgYHJlcXVpcmVtZW50cyBtZXRhZGF0YSBvZiBwYWNrYWdlICR7cGFja2FnZUpzb24ubmFtZX0gaXMgbWFsZm9ybWVkLiBJZ25vcmluZy5gLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnJlcXVpcmVtZW50cyA9IHJlcXVpcmVtZW50cztcbiAgICB9XG4gIH1cblxuICBpZiAobWV0YWRhdGFbJ21pZ3JhdGlvbnMnXSkge1xuICAgIGNvbnN0IG1pZ3JhdGlvbnMgPSBtZXRhZGF0YVsnbWlncmF0aW9ucyddO1xuICAgIGlmICh0eXBlb2YgbWlncmF0aW9ucyAhPSAnc3RyaW5nJykge1xuICAgICAgbG9nZ2VyLndhcm4oYG1pZ3JhdGlvbnMgbWV0YWRhdGEgb2YgcGFja2FnZSAke3BhY2thZ2VKc29uLm5hbWV9IGlzIG1hbGZvcm1lZC4gSWdub3JpbmcuYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5taWdyYXRpb25zID0gbWlncmF0aW9ucztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5cbmZ1bmN0aW9uIF91c2FnZU1lc3NhZ2UoXG4gIG9wdGlvbnM6IFVwZGF0ZVNjaGVtYSxcbiAgaW5mb01hcDogTWFwPHN0cmluZywgUGFja2FnZUluZm8+LFxuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpLFxuKSB7XG4gIGNvbnN0IHBhY2thZ2VHcm91cHMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICBjb25zdCBwYWNrYWdlc1RvVXBkYXRlID0gWy4uLmluZm9NYXAuZW50cmllcygpXVxuICAgIC5tYXAoKFtuYW1lLCBpbmZvXSkgPT4ge1xuICAgICAgY29uc3QgdGFnID0gb3B0aW9ucy5uZXh0XG4gICAgICAgID8gKGluZm8ubnBtUGFja2FnZUpzb25bJ2Rpc3QtdGFncyddWyduZXh0J10gPyAnbmV4dCcgOiAnbGF0ZXN0JykgOiAnbGF0ZXN0JztcbiAgICAgIGNvbnN0IHZlcnNpb24gPSBpbmZvLm5wbVBhY2thZ2VKc29uWydkaXN0LXRhZ3MnXVt0YWddO1xuICAgICAgY29uc3QgdGFyZ2V0ID0gaW5mby5ucG1QYWNrYWdlSnNvbi52ZXJzaW9uc1t2ZXJzaW9uXTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgaW5mbyxcbiAgICAgICAgdmVyc2lvbixcbiAgICAgICAgdGFnLFxuICAgICAgICB0YXJnZXQsXG4gICAgICB9O1xuICAgIH0pXG4gICAgLmZpbHRlcigoeyBuYW1lLCBpbmZvLCB2ZXJzaW9uLCB0YXJnZXQgfSkgPT4ge1xuICAgICAgcmV0dXJuICh0YXJnZXQgJiYgc2VtdmVyLmNvbXBhcmUoaW5mby5pbnN0YWxsZWQudmVyc2lvbiwgdmVyc2lvbikgPCAwKTtcbiAgICB9KVxuICAgIC5maWx0ZXIoKHsgdGFyZ2V0IH0pID0+IHtcbiAgICAgIHJldHVybiB0YXJnZXRbJ25nLXVwZGF0ZSddO1xuICAgIH0pXG4gICAgLm1hcCgoeyBuYW1lLCBpbmZvLCB2ZXJzaW9uLCB0YWcsIHRhcmdldCB9KSA9PiB7XG4gICAgICAvLyBMb29rIGZvciBwYWNrYWdlR3JvdXAuXG4gICAgICBpZiAodGFyZ2V0WyduZy11cGRhdGUnXSAmJiB0YXJnZXRbJ25nLXVwZGF0ZSddWydwYWNrYWdlR3JvdXAnXSkge1xuICAgICAgICBjb25zdCBwYWNrYWdlR3JvdXAgPSB0YXJnZXRbJ25nLXVwZGF0ZSddWydwYWNrYWdlR3JvdXAnXTtcbiAgICAgICAgY29uc3QgcGFja2FnZUdyb3VwTmFtZSA9IHRhcmdldFsnbmctdXBkYXRlJ11bJ3BhY2thZ2VHcm91cE5hbWUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgdGFyZ2V0WyduZy11cGRhdGUnXVsncGFja2FnZUdyb3VwJ11bMF07XG4gICAgICAgIGlmIChwYWNrYWdlR3JvdXBOYW1lKSB7XG4gICAgICAgICAgaWYgKHBhY2thZ2VHcm91cHMuaGFzKG5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwYWNrYWdlR3JvdXAuZm9yRWFjaCgoeDogc3RyaW5nKSA9PiBwYWNrYWdlR3JvdXBzLnNldCh4LCBwYWNrYWdlR3JvdXBOYW1lKSk7XG4gICAgICAgICAgcGFja2FnZUdyb3Vwcy5zZXQocGFja2FnZUdyb3VwTmFtZSwgcGFja2FnZUdyb3VwTmFtZSk7XG4gICAgICAgICAgbmFtZSA9IHBhY2thZ2VHcm91cE5hbWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGNvbW1hbmQgPSBgbmcgdXBkYXRlICR7bmFtZX1gO1xuICAgICAgaWYgKHRhZyA9PSAnbmV4dCcpIHtcbiAgICAgICAgY29tbWFuZCArPSAnIC0tbmV4dCc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBbbmFtZSwgYCR7aW5mby5pbnN0YWxsZWQudmVyc2lvbn0gLT4gJHt2ZXJzaW9ufWAsIGNvbW1hbmRdO1xuICAgIH0pXG4gICAgLmZpbHRlcih4ID0+IHggIT09IG51bGwpXG4gICAgLnNvcnQoKGEsIGIpID0+IGEgJiYgYiA/IGFbMF0ubG9jYWxlQ29tcGFyZShiWzBdKSA6IDApO1xuXG4gIGlmIChwYWNrYWdlc1RvVXBkYXRlLmxlbmd0aCA9PSAwKSB7XG4gICAgbG9nZ2VyLmluZm8oJ1dlIGFuYWx5emVkIHlvdXIgcGFja2FnZS5qc29uIGFuZCBldmVyeXRoaW5nIHNlZW1zIHRvIGJlIGluIG9yZGVyLiBHb29kIHdvcmshJyk7XG5cbiAgICByZXR1cm4gb2Y8dm9pZD4odW5kZWZpbmVkKTtcbiAgfVxuXG4gIGxvZ2dlci5pbmZvKFxuICAgICdXZSBhbmFseXplZCB5b3VyIHBhY2thZ2UuanNvbiwgdGhlcmUgYXJlIHNvbWUgcGFja2FnZXMgdG8gdXBkYXRlOlxcbicsXG4gICk7XG5cbiAgLy8gRmluZCB0aGUgbGFyZ2VzdCBuYW1lIHRvIGtub3cgdGhlIHBhZGRpbmcgbmVlZGVkLlxuICBsZXQgbmFtZVBhZCA9IE1hdGgubWF4KC4uLlsuLi5pbmZvTWFwLmtleXMoKV0ubWFwKHggPT4geC5sZW5ndGgpKSArIDI7XG4gIGlmICghTnVtYmVyLmlzRmluaXRlKG5hbWVQYWQpKSB7XG4gICAgbmFtZVBhZCA9IDMwO1xuICB9XG4gIGNvbnN0IHBhZHMgPSBbbmFtZVBhZCwgMjUsIDBdO1xuXG4gIGxvZ2dlci5pbmZvKFxuICAgICcgICdcbiAgICArIFsnTmFtZScsICdWZXJzaW9uJywgJ0NvbW1hbmQgdG8gdXBkYXRlJ10ubWFwKCh4LCBpKSA9PiB4LnBhZEVuZChwYWRzW2ldKSkuam9pbignJyksXG4gICk7XG4gIGxvZ2dlci5pbmZvKCcgJyArICctJy5yZXBlYXQocGFkcy5yZWR1Y2UoKHMsIHgpID0+IHMgKz0geCwgMCkgKyAyMCkpO1xuXG4gIHBhY2thZ2VzVG9VcGRhdGUuZm9yRWFjaChmaWVsZHMgPT4ge1xuICAgIGlmICghZmllbGRzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbG9nZ2VyLmluZm8oJyAgJyArIGZpZWxkcy5tYXAoKHgsIGkpID0+IHgucGFkRW5kKHBhZHNbaV0pKS5qb2luKCcnKSk7XG4gIH0pO1xuXG4gIGxvZ2dlci5pbmZvKCdcXG4nKTtcbiAgbG9nZ2VyLmluZm8oJ1RoZXJlIG1pZ2h0IGJlIGFkZGl0aW9uYWwgcGFja2FnZXMgdGhhdCBhcmUgb3V0ZGF0ZWQuJyk7XG4gIGxvZ2dlci5pbmZvKCdSdW4gXCJuZyB1cGRhdGUgLS1hbGxcIiB0byB0cnkgdG8gdXBkYXRlIGFsbCBhdCB0aGUgc2FtZSB0aW1lLlxcbicpO1xuXG4gIHJldHVybiBvZjx2b2lkPih1bmRlZmluZWQpO1xufVxuXG5cbmZ1bmN0aW9uIF9idWlsZFBhY2thZ2VJbmZvKFxuICB0cmVlOiBUcmVlLFxuICBwYWNrYWdlczogTWFwPHN0cmluZywgVmVyc2lvblJhbmdlPixcbiAgYWxsRGVwZW5kZW5jaWVzOiBSZWFkb25seU1hcDxzdHJpbmcsIFZlcnNpb25SYW5nZT4sXG4gIG5wbVBhY2thZ2VKc29uOiBOcG1SZXBvc2l0b3J5UGFja2FnZUpzb24sXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4pOiBQYWNrYWdlSW5mbyB7XG4gIGNvbnN0IG5hbWUgPSBucG1QYWNrYWdlSnNvbi5uYW1lO1xuICBjb25zdCBwYWNrYWdlSnNvblJhbmdlID0gYWxsRGVwZW5kZW5jaWVzLmdldChuYW1lKTtcbiAgaWYgKCFwYWNrYWdlSnNvblJhbmdlKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oXG4gICAgICBgUGFja2FnZSAke0pTT04uc3RyaW5naWZ5KG5hbWUpfSB3YXMgbm90IGZvdW5kIGluIHBhY2thZ2UuanNvbi5gLFxuICAgICk7XG4gIH1cblxuICAvLyBGaW5kIG91dCB0aGUgY3VycmVudGx5IGluc3RhbGxlZCB2ZXJzaW9uLiBFaXRoZXIgZnJvbSB0aGUgcGFja2FnZS5qc29uIG9yIHRoZSBub2RlX21vZHVsZXMvXG4gIC8vIFRPRE86IGZpZ3VyZSBvdXQgYSB3YXkgdG8gcmVhZCBwYWNrYWdlLWxvY2suanNvbiBhbmQvb3IgeWFybi5sb2NrLlxuICBsZXQgaW5zdGFsbGVkVmVyc2lvbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBjb25zdCBwYWNrYWdlQ29udGVudCA9IHRyZWUucmVhZChgL25vZGVfbW9kdWxlcy8ke25hbWV9L3BhY2thZ2UuanNvbmApO1xuICBpZiAocGFja2FnZUNvbnRlbnQpIHtcbiAgICBjb25zdCBjb250ZW50ID0gSlNPTi5wYXJzZShwYWNrYWdlQ29udGVudC50b1N0cmluZygpKSBhcyBKc29uU2NoZW1hRm9yTnBtUGFja2FnZUpzb25GaWxlcztcbiAgICBpbnN0YWxsZWRWZXJzaW9uID0gY29udGVudC52ZXJzaW9uO1xuICB9XG4gIGlmICghaW5zdGFsbGVkVmVyc2lvbikge1xuICAgIC8vIEZpbmQgdGhlIHZlcnNpb24gZnJvbSBOUE0gdGhhdCBmaXRzIHRoZSByYW5nZSB0byBtYXguXG4gICAgaW5zdGFsbGVkVmVyc2lvbiA9IHNlbXZlci5tYXhTYXRpc2Z5aW5nKFxuICAgICAgT2JqZWN0LmtleXMobnBtUGFja2FnZUpzb24udmVyc2lvbnMpLFxuICAgICAgcGFja2FnZUpzb25SYW5nZSxcbiAgICApO1xuICB9XG5cbiAgY29uc3QgaW5zdGFsbGVkUGFja2FnZUpzb24gPSBucG1QYWNrYWdlSnNvbi52ZXJzaW9uc1tpbnN0YWxsZWRWZXJzaW9uXSB8fCBwYWNrYWdlQ29udGVudDtcbiAgaWYgKCFpbnN0YWxsZWRQYWNrYWdlSnNvbikge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKFxuICAgICAgYEFuIHVuZXhwZWN0ZWQgZXJyb3IgaGFwcGVuZWQ7IHBhY2thZ2UgJHtuYW1lfSBoYXMgbm8gdmVyc2lvbiAke2luc3RhbGxlZFZlcnNpb259LmAsXG4gICAgKTtcbiAgfVxuXG4gIGxldCB0YXJnZXRWZXJzaW9uOiBWZXJzaW9uUmFuZ2UgfCB1bmRlZmluZWQgPSBwYWNrYWdlcy5nZXQobmFtZSk7XG4gIGlmICh0YXJnZXRWZXJzaW9uKSB7XG4gICAgaWYgKG5wbVBhY2thZ2VKc29uWydkaXN0LXRhZ3MnXVt0YXJnZXRWZXJzaW9uXSkge1xuICAgICAgdGFyZ2V0VmVyc2lvbiA9IG5wbVBhY2thZ2VKc29uWydkaXN0LXRhZ3MnXVt0YXJnZXRWZXJzaW9uXSBhcyBWZXJzaW9uUmFuZ2U7XG4gICAgfSBlbHNlIGlmICh0YXJnZXRWZXJzaW9uID09ICduZXh0Jykge1xuICAgICAgdGFyZ2V0VmVyc2lvbiA9IG5wbVBhY2thZ2VKc29uWydkaXN0LXRhZ3MnXVsnbGF0ZXN0J10gYXMgVmVyc2lvblJhbmdlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXRWZXJzaW9uID0gc2VtdmVyLm1heFNhdGlzZnlpbmcoXG4gICAgICAgIE9iamVjdC5rZXlzKG5wbVBhY2thZ2VKc29uLnZlcnNpb25zKSxcbiAgICAgICAgdGFyZ2V0VmVyc2lvbixcbiAgICAgICkgYXMgVmVyc2lvblJhbmdlO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0YXJnZXRWZXJzaW9uICYmIHNlbXZlci5sdGUodGFyZ2V0VmVyc2lvbiwgaW5zdGFsbGVkVmVyc2lvbikpIHtcbiAgICBsb2dnZXIuZGVidWcoYFBhY2thZ2UgJHtuYW1lfSBhbHJlYWR5IHNhdGlzZmllZCBieSBwYWNrYWdlLmpzb24gKCR7cGFja2FnZUpzb25SYW5nZX0pLmApO1xuICAgIHRhcmdldFZlcnNpb24gPSB1bmRlZmluZWQ7XG4gIH1cblxuICBjb25zdCB0YXJnZXQ6IFBhY2thZ2VWZXJzaW9uSW5mbyB8IHVuZGVmaW5lZCA9IHRhcmdldFZlcnNpb25cbiAgICA/IHtcbiAgICAgIHZlcnNpb246IHRhcmdldFZlcnNpb24sXG4gICAgICBwYWNrYWdlSnNvbjogbnBtUGFja2FnZUpzb24udmVyc2lvbnNbdGFyZ2V0VmVyc2lvbl0sXG4gICAgICB1cGRhdGVNZXRhZGF0YTogX2dldFVwZGF0ZU1ldGFkYXRhKG5wbVBhY2thZ2VKc29uLnZlcnNpb25zW3RhcmdldFZlcnNpb25dLCBsb2dnZXIpLFxuICAgIH1cbiAgICA6IHVuZGVmaW5lZDtcblxuICAvLyBDaGVjayBpZiB0aGVyZSdzIGFuIGluc3RhbGxlZCB2ZXJzaW9uLlxuICByZXR1cm4ge1xuICAgIG5hbWUsXG4gICAgbnBtUGFja2FnZUpzb24sXG4gICAgaW5zdGFsbGVkOiB7XG4gICAgICB2ZXJzaW9uOiBpbnN0YWxsZWRWZXJzaW9uIGFzIFZlcnNpb25SYW5nZSxcbiAgICAgIHBhY2thZ2VKc29uOiBpbnN0YWxsZWRQYWNrYWdlSnNvbixcbiAgICAgIHVwZGF0ZU1ldGFkYXRhOiBfZ2V0VXBkYXRlTWV0YWRhdGEoaW5zdGFsbGVkUGFja2FnZUpzb24sIGxvZ2dlciksXG4gICAgfSxcbiAgICB0YXJnZXQsXG4gICAgcGFja2FnZUpzb25SYW5nZSxcbiAgfTtcbn1cblxuXG5mdW5jdGlvbiBfYnVpbGRQYWNrYWdlTGlzdChcbiAgb3B0aW9uczogVXBkYXRlU2NoZW1hLFxuICBwcm9qZWN0RGVwczogTWFwPHN0cmluZywgVmVyc2lvblJhbmdlPixcbiAgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSxcbik6IE1hcDxzdHJpbmcsIFZlcnNpb25SYW5nZT4ge1xuICAvLyBQYXJzZSB0aGUgcGFja2FnZXMgb3B0aW9ucyB0byBzZXQgdGhlIHRhcmdldGVkIHZlcnNpb24uXG4gIGNvbnN0IHBhY2thZ2VzID0gbmV3IE1hcDxzdHJpbmcsIFZlcnNpb25SYW5nZT4oKTtcbiAgY29uc3QgY29tbWFuZExpbmVQYWNrYWdlcyA9XG4gICAgKG9wdGlvbnMucGFja2FnZXMgJiYgb3B0aW9ucy5wYWNrYWdlcy5sZW5ndGggPiAwKVxuICAgID8gb3B0aW9ucy5wYWNrYWdlc1xuICAgIDogKG9wdGlvbnMuYWxsID8gcHJvamVjdERlcHMua2V5cygpIDogW10pO1xuXG4gIGZvciAoY29uc3QgcGtnIG9mIGNvbW1hbmRMaW5lUGFja2FnZXMpIHtcbiAgICAvLyBTcGxpdCB0aGUgdmVyc2lvbiBhc2tlZCBvbiBjb21tYW5kIGxpbmUuXG4gICAgY29uc3QgbSA9IHBrZy5tYXRjaCgvXigoPzpAW14vXXsxLDEwMH1cXC8pP1teQF17MSwxMDB9KSg/OkAoLnsxLDEwMH0pKT8kLyk7XG4gICAgaWYgKCFtKSB7XG4gICAgICBsb2dnZXIud2FybihgSW52YWxpZCBwYWNrYWdlIGFyZ3VtZW50OiAke0pTT04uc3RyaW5naWZ5KHBrZyl9LiBTa2lwcGluZy5gKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IFssIG5wbU5hbWUsIG1heWJlVmVyc2lvbl0gPSBtO1xuXG4gICAgY29uc3QgdmVyc2lvbiA9IHByb2plY3REZXBzLmdldChucG1OYW1lKTtcbiAgICBpZiAoIXZlcnNpb24pIHtcbiAgICAgIGxvZ2dlci53YXJuKGBQYWNrYWdlIG5vdCBpbnN0YWxsZWQ6ICR7SlNPTi5zdHJpbmdpZnkobnBtTmFtZSl9LiBTa2lwcGluZy5gKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIFZlcmlmeSB0aGF0IHBlb3BsZSBoYXZlIGFuIGFjdHVhbCB2ZXJzaW9uIGluIHRoZSBwYWNrYWdlLmpzb24sIG90aGVyd2lzZSAobGFiZWwgb3IgVVJMIG9yXG4gICAgLy8gZ2lzdCBvciAuLi4pIHdlIGRvbid0IHVwZGF0ZSBpdC5cbiAgICBpZiAoXG4gICAgICB2ZXJzaW9uLnN0YXJ0c1dpdGgoJ2h0dHA6JykgIC8vIEhUVFBcbiAgICAgIHx8IHZlcnNpb24uc3RhcnRzV2l0aCgnZmlsZTonKSAgLy8gTG9jYWwgZm9sZGVyXG4gICAgICB8fCB2ZXJzaW9uLnN0YXJ0c1dpdGgoJ2dpdDonKSAgLy8gR0lUIHVybFxuICAgICAgfHwgdmVyc2lvbi5tYXRjaCgvXlxcd3sxLDEwMH1cXC9cXHd7MSwxMDB9LykgIC8vIEdpdEh1YidzIFwidXNlci9yZXBvXCJcbiAgICAgIHx8IHZlcnNpb24ubWF0Y2goL14oPzpcXC57MCwyfVxcLylcXHd7MSwxMDB9LykgIC8vIExvY2FsIGZvbGRlciwgbWF5YmUgcmVsYXRpdmUuXG4gICAgKSB7XG4gICAgICAvLyBXZSBvbmx5IGRvIHRoYXQgZm9yIC0tYWxsLiBPdGhlcndpc2Ugd2UgaGF2ZSB0aGUgaW5zdGFsbGVkIHZlcnNpb24gYW5kIHRoZSB1c2VyIHNwZWNpZmllZFxuICAgICAgLy8gaXQgb24gdGhlIGNvbW1hbmQgbGluZS5cbiAgICAgIGlmIChvcHRpb25zLmFsbCkge1xuICAgICAgICBsb2dnZXIud2FybihcbiAgICAgICAgICBgUGFja2FnZSAke0pTT04uc3RyaW5naWZ5KG5wbU5hbWUpfSBoYXMgYSBjdXN0b20gdmVyc2lvbjogYFxuICAgICAgICAgICsgYCR7SlNPTi5zdHJpbmdpZnkodmVyc2lvbil9LiBTa2lwcGluZy5gLFxuICAgICAgICApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwYWNrYWdlcy5zZXQobnBtTmFtZSwgKG1heWJlVmVyc2lvbiB8fCAob3B0aW9ucy5uZXh0ID8gJ25leHQnIDogJ2xhdGVzdCcpKSBhcyBWZXJzaW9uUmFuZ2UpO1xuICB9XG5cbiAgcmV0dXJuIHBhY2thZ2VzO1xufVxuXG5cbmZ1bmN0aW9uIF9hZGRQYWNrYWdlR3JvdXAoXG4gIHRyZWU6IFRyZWUsXG4gIHBhY2thZ2VzOiBNYXA8c3RyaW5nLCBWZXJzaW9uUmFuZ2U+LFxuICBhbGxEZXBlbmRlbmNpZXM6IFJlYWRvbmx5TWFwPHN0cmluZywgVmVyc2lvblJhbmdlPixcbiAgbnBtUGFja2FnZUpzb246IE5wbVJlcG9zaXRvcnlQYWNrYWdlSnNvbixcbiAgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSxcbik6IHZvaWQge1xuICBjb25zdCBtYXliZVBhY2thZ2UgPSBwYWNrYWdlcy5nZXQobnBtUGFja2FnZUpzb24ubmFtZSk7XG4gIGlmICghbWF5YmVQYWNrYWdlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgaW5mbyA9IF9idWlsZFBhY2thZ2VJbmZvKHRyZWUsIHBhY2thZ2VzLCBhbGxEZXBlbmRlbmNpZXMsIG5wbVBhY2thZ2VKc29uLCBsb2dnZXIpO1xuXG4gIGNvbnN0IHZlcnNpb24gPSAoaW5mby50YXJnZXQgJiYgaW5mby50YXJnZXQudmVyc2lvbilcbiAgICAgICAgICAgICAgIHx8IG5wbVBhY2thZ2VKc29uWydkaXN0LXRhZ3MnXVttYXliZVBhY2thZ2VdXG4gICAgICAgICAgICAgICB8fCBtYXliZVBhY2thZ2U7XG4gIGlmICghbnBtUGFja2FnZUpzb24udmVyc2lvbnNbdmVyc2lvbl0pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgbmdVcGRhdGVNZXRhZGF0YSA9IG5wbVBhY2thZ2VKc29uLnZlcnNpb25zW3ZlcnNpb25dWyduZy11cGRhdGUnXTtcbiAgaWYgKCFuZ1VwZGF0ZU1ldGFkYXRhKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IHBhY2thZ2VHcm91cCA9IG5nVXBkYXRlTWV0YWRhdGFbJ3BhY2thZ2VHcm91cCddO1xuICBpZiAoIXBhY2thZ2VHcm91cCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShwYWNrYWdlR3JvdXApICYmICFwYWNrYWdlR3JvdXAuc29tZSh4ID0+IHR5cGVvZiB4ICE9ICdzdHJpbmcnKSkge1xuICAgIHBhY2thZ2VHcm91cCA9IHBhY2thZ2VHcm91cC5yZWR1Y2UoKGFjYywgY3VycikgPT4ge1xuICAgICAgYWNjW2N1cnJdID0gbWF5YmVQYWNrYWdlO1xuXG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIHt9IGFzIHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9KTtcbiAgfVxuXG4gIC8vIE9ubHkgbmVlZCB0byBjaGVjayBpZiBpdCdzIGFuIG9iamVjdCBiZWNhdXNlIHdlIHNldCBpdCByaWdodCB0aGUgdGltZSBiZWZvcmUuXG4gIGlmICh0eXBlb2YgcGFja2FnZUdyb3VwICE9ICdvYmplY3QnXG4gICAgICB8fCBwYWNrYWdlR3JvdXAgPT09IG51bGxcbiAgICAgIHx8IE9iamVjdC52YWx1ZXMocGFja2FnZUdyb3VwKS5zb21lKHYgPT4gdHlwZW9mIHYgIT0gJ3N0cmluZycpXG4gICkge1xuICAgIGxvZ2dlci53YXJuKGBwYWNrYWdlR3JvdXAgbWV0YWRhdGEgb2YgcGFja2FnZSAke25wbVBhY2thZ2VKc29uLm5hbWV9IGlzIG1hbGZvcm1lZC5gKTtcblxuICAgIHJldHVybjtcbiAgfVxuXG4gIE9iamVjdC5rZXlzKHBhY2thZ2VHcm91cClcbiAgICAuZmlsdGVyKG5hbWUgPT4gIXBhY2thZ2VzLmhhcyhuYW1lKSkgIC8vIERvbid0IG92ZXJyaWRlIG5hbWVzIGZyb20gdGhlIGNvbW1hbmQgbGluZS5cbiAgICAuZmlsdGVyKG5hbWUgPT4gYWxsRGVwZW5kZW5jaWVzLmhhcyhuYW1lKSkgIC8vIFJlbW92ZSBwYWNrYWdlcyB0aGF0IGFyZW4ndCBpbnN0YWxsZWQuXG4gICAgLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBwYWNrYWdlcy5zZXQobmFtZSwgcGFja2FnZUdyb3VwW25hbWVdKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBBZGQgcGVlciBkZXBlbmRlbmNpZXMgb2YgcGFja2FnZXMgb24gdGhlIGNvbW1hbmQgbGluZSB0byB0aGUgbGlzdCBvZiBwYWNrYWdlcyB0byB1cGRhdGUuXG4gKiBXZSBkb24ndCBkbyB2ZXJpZmljYXRpb24gb2YgdGhlIHZlcnNpb25zIGhlcmUgYXMgdGhpcyB3aWxsIGJlIGRvbmUgYnkgYSBsYXRlciBzdGVwIChhbmQgY2FuXG4gKiBiZSBpZ25vcmVkIGJ5IHRoZSAtLWZvcmNlIGZsYWcpLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX2FkZFBlZXJEZXBlbmRlbmNpZXMoXG4gIHRyZWU6IFRyZWUsXG4gIHBhY2thZ2VzOiBNYXA8c3RyaW5nLCBWZXJzaW9uUmFuZ2U+LFxuICBhbGxEZXBlbmRlbmNpZXM6IFJlYWRvbmx5TWFwPHN0cmluZywgVmVyc2lvblJhbmdlPixcbiAgbnBtUGFja2FnZUpzb246IE5wbVJlcG9zaXRvcnlQYWNrYWdlSnNvbixcbiAgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSxcbik6IHZvaWQge1xuICBjb25zdCBtYXliZVBhY2thZ2UgPSBwYWNrYWdlcy5nZXQobnBtUGFja2FnZUpzb24ubmFtZSk7XG4gIGlmICghbWF5YmVQYWNrYWdlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgaW5mbyA9IF9idWlsZFBhY2thZ2VJbmZvKHRyZWUsIHBhY2thZ2VzLCBhbGxEZXBlbmRlbmNpZXMsIG5wbVBhY2thZ2VKc29uLCBsb2dnZXIpO1xuXG4gIGNvbnN0IHZlcnNpb24gPSAoaW5mby50YXJnZXQgJiYgaW5mby50YXJnZXQudmVyc2lvbilcbiAgICAgICAgICAgICAgIHx8IG5wbVBhY2thZ2VKc29uWydkaXN0LXRhZ3MnXVttYXliZVBhY2thZ2VdXG4gICAgICAgICAgICAgICB8fCBtYXliZVBhY2thZ2U7XG4gIGlmICghbnBtUGFja2FnZUpzb24udmVyc2lvbnNbdmVyc2lvbl0pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBwYWNrYWdlSnNvbiA9IG5wbVBhY2thZ2VKc29uLnZlcnNpb25zW3ZlcnNpb25dO1xuICBjb25zdCBlcnJvciA9IGZhbHNlO1xuXG4gIGZvciAoY29uc3QgW3BlZXIsIHJhbmdlXSBvZiBPYmplY3QuZW50cmllcyhwYWNrYWdlSnNvbi5wZWVyRGVwZW5kZW5jaWVzIHx8IHt9KSkge1xuICAgIGlmICghcGFja2FnZXMuaGFzKHBlZXIpKSB7XG4gICAgICBwYWNrYWdlcy5zZXQocGVlciwgcmFuZ2UgYXMgVmVyc2lvblJhbmdlKTtcbiAgICB9XG4gIH1cblxuICBpZiAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbignQW4gZXJyb3Igb2NjdXJlZCwgc2VlIGFib3ZlLicpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gX2dldEFsbERlcGVuZGVuY2llcyh0cmVlOiBUcmVlKTogTWFwPHN0cmluZywgVmVyc2lvblJhbmdlPiB7XG4gIGNvbnN0IHBhY2thZ2VKc29uQ29udGVudCA9IHRyZWUucmVhZCgnL3BhY2thZ2UuanNvbicpO1xuICBpZiAoIXBhY2thZ2VKc29uQ29udGVudCkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdDb3VsZCBub3QgZmluZCBhIHBhY2thZ2UuanNvbi4gQXJlIHlvdSBpbiBhIE5vZGUgcHJvamVjdD8nKTtcbiAgfVxuXG4gIGxldCBwYWNrYWdlSnNvbjogSnNvblNjaGVtYUZvck5wbVBhY2thZ2VKc29uRmlsZXM7XG4gIHRyeSB7XG4gICAgcGFja2FnZUpzb24gPSBKU09OLnBhcnNlKHBhY2thZ2VKc29uQ29udGVudC50b1N0cmluZygpKSBhcyBKc29uU2NoZW1hRm9yTnBtUGFja2FnZUpzb25GaWxlcztcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdwYWNrYWdlLmpzb24gY291bGQgbm90IGJlIHBhcnNlZDogJyArIGUubWVzc2FnZSk7XG4gIH1cblxuICByZXR1cm4gbmV3IE1hcDxzdHJpbmcsIFZlcnNpb25SYW5nZT4oW1xuICAgIC4uLk9iamVjdC5lbnRyaWVzKHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXMgfHwge30pLFxuICAgIC4uLk9iamVjdC5lbnRyaWVzKHBhY2thZ2VKc29uLmRldkRlcGVuZGVuY2llcyB8fCB7fSksXG4gICAgLi4uT2JqZWN0LmVudHJpZXMocGFja2FnZUpzb24uZGVwZW5kZW5jaWVzIHx8IHt9KSxcbiAgXSBhcyBbc3RyaW5nLCBWZXJzaW9uUmFuZ2VdW10pO1xufVxuXG5mdW5jdGlvbiBfZm9ybWF0VmVyc2lvbih2ZXJzaW9uOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcbiAgaWYgKHZlcnNpb24gPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAoIXZlcnNpb24ubWF0Y2goL15cXGR7MSwzMH1cXC5cXGR7MSwzMH1cXC5cXGR7MSwzMH0vKSkge1xuICAgIHZlcnNpb24gKz0gJy4wJztcbiAgfVxuICBpZiAoIXZlcnNpb24ubWF0Y2goL15cXGR7MSwzMH1cXC5cXGR7MSwzMH1cXC5cXGR7MSwzMH0vKSkge1xuICAgIHZlcnNpb24gKz0gJy4wJztcbiAgfVxuICBpZiAoIXNlbXZlci52YWxpZCh2ZXJzaW9uKSkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBJbnZhbGlkIG1pZ3JhdGlvbiB2ZXJzaW9uOiAke0pTT04uc3RyaW5naWZ5KHZlcnNpb24pfWApO1xuICB9XG5cbiAgcmV0dXJuIHZlcnNpb247XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob3B0aW9uczogVXBkYXRlU2NoZW1hKTogUnVsZSB7XG4gIGlmICghb3B0aW9ucy5wYWNrYWdlcykge1xuICAgIC8vIFdlIGNhbm5vdCBqdXN0IHJldHVybiB0aGlzIGJlY2F1c2Ugd2UgbmVlZCB0byBmZXRjaCB0aGUgcGFja2FnZXMgZnJvbSBOUE0gc3RpbGwgZm9yIHRoZVxuICAgIC8vIGhlbHAvZ3VpZGUgdG8gc2hvdy5cbiAgICBvcHRpb25zLnBhY2thZ2VzID0gW107XG4gIH0gZWxzZSB7XG4gICAgLy8gV2Ugc3BsaXQgZXZlcnkgcGFja2FnZXMgYnkgY29tbWFzIHRvIGFsbG93IHBlb3BsZSB0byBwYXNzIGluIG11bHRpcGxlIGFuZCBtYWtlIGl0IGFuIGFycmF5LlxuICAgIG9wdGlvbnMucGFja2FnZXMgPSBvcHRpb25zLnBhY2thZ2VzLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiB7XG4gICAgICByZXR1cm4gYWNjLmNvbmNhdChjdXJyLnNwbGl0KCcsJykpO1xuICAgIH0sIFtdIGFzIHN0cmluZ1tdKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLm1pZ3JhdGVPbmx5ICYmIG9wdGlvbnMuZnJvbSkge1xuICAgIGlmIChvcHRpb25zLnBhY2thZ2VzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJy0tZnJvbSByZXF1aXJlcyB0aGF0IG9ubHkgYSBzaW5nbGUgcGFja2FnZSBiZSBwYXNzZWQuJyk7XG4gICAgfVxuICB9XG5cbiAgb3B0aW9ucy5mcm9tID0gX2Zvcm1hdFZlcnNpb24ob3B0aW9ucy5mcm9tKTtcbiAgb3B0aW9ucy50byA9IF9mb3JtYXRWZXJzaW9uKG9wdGlvbnMudG8pO1xuXG4gIHJldHVybiAodHJlZTogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGNvbnN0IGxvZ2dlciA9IGNvbnRleHQubG9nZ2VyO1xuICAgIGNvbnN0IGFsbERlcGVuZGVuY2llcyA9IF9nZXRBbGxEZXBlbmRlbmNpZXModHJlZSk7XG4gICAgY29uc3QgcGFja2FnZXMgPSBfYnVpbGRQYWNrYWdlTGlzdChvcHRpb25zLCBhbGxEZXBlbmRlbmNpZXMsIGxvZ2dlcik7XG4gICAgY29uc3QgdXNpbmdZYXJuID0gb3B0aW9ucy5wYWNrYWdlTWFuYWdlciA9PT0gJ3lhcm4nO1xuXG4gICAgcmV0dXJuIG9ic2VydmFibGVGcm9tKFsuLi5hbGxEZXBlbmRlbmNpZXMua2V5cygpXSkucGlwZShcbiAgICAgIC8vIEdyYWIgYWxsIHBhY2thZ2UuanNvbiBmcm9tIHRoZSBucG0gcmVwb3NpdG9yeS4gVGhpcyByZXF1aXJlcyBhIGxvdCBvZiBIVFRQIGNhbGxzIHNvIHdlXG4gICAgICAvLyB0cnkgdG8gcGFyYWxsZWxpemUgYXMgbWFueSBhcyBwb3NzaWJsZS5cbiAgICAgIG1lcmdlTWFwKGRlcE5hbWUgPT4gZ2V0TnBtUGFja2FnZUpzb24oXG4gICAgICAgIGRlcE5hbWUsXG4gICAgICAgIGxvZ2dlcixcbiAgICAgICAgeyByZWdpc3RyeVVybDogb3B0aW9ucy5yZWdpc3RyeSwgdXNpbmdZYXJuLCB2ZXJib3NlOiBvcHRpb25zLnZlcmJvc2UgfSxcbiAgICAgICkpLFxuXG4gICAgICAvLyBCdWlsZCBhIG1hcCBvZiBhbGwgZGVwZW5kZW5jaWVzIGFuZCB0aGVpciBwYWNrYWdlSnNvbi5cbiAgICAgIHJlZHVjZTxOcG1SZXBvc2l0b3J5UGFja2FnZUpzb24sIE1hcDxzdHJpbmcsIE5wbVJlcG9zaXRvcnlQYWNrYWdlSnNvbj4+KFxuICAgICAgICAoYWNjLCBucG1QYWNrYWdlSnNvbikgPT4ge1xuICAgICAgICAgIC8vIElmIHRoZSBwYWNrYWdlIHdhcyBub3QgZm91bmQgb24gdGhlIHJlZ2lzdHJ5LiBJdCBjb3VsZCBiZSBwcml2YXRlLCBzbyB3ZSB3aWxsIGp1c3RcbiAgICAgICAgICAvLyBpZ25vcmUuIElmIHRoZSBwYWNrYWdlIHdhcyBwYXJ0IG9mIHRoZSBsaXN0LCB3ZSB3aWxsIGVycm9yIG91dCwgYnV0IHdpbGwgc2ltcGx5IGlnbm9yZVxuICAgICAgICAgIC8vIGlmIGl0J3MgZWl0aGVyIG5vdCByZXF1ZXN0ZWQgKHNvIGp1c3QgcGFydCBvZiBwYWNrYWdlLmpzb24uIHNpbGVudGx5KSBvciBpZiBpdCdzIGFcbiAgICAgICAgICAvLyBgLS1hbGxgIHNpdHVhdGlvbi4gVGhlcmUgaXMgYW4gZWRnZSBjYXNlIGhlcmUgd2hlcmUgYSBwdWJsaWMgcGFja2FnZSBwZWVyIGRlcGVuZHMgb24gYVxuICAgICAgICAgIC8vIHByaXZhdGUgb25lLCBidXQgaXQncyByYXJlIGVub3VnaC5cbiAgICAgICAgICBpZiAoIW5wbVBhY2thZ2VKc29uLm5hbWUpIHtcbiAgICAgICAgICAgIGlmIChwYWNrYWdlcy5oYXMobnBtUGFja2FnZUpzb24ucmVxdWVzdGVkTmFtZSkpIHtcbiAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWxsKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFBhY2thZ2UgJHtKU09OLnN0cmluZ2lmeShucG1QYWNrYWdlSnNvbi5yZXF1ZXN0ZWROYW1lKX0gd2FzIG5vdCBgXG4gICAgICAgICAgICAgICAgICArICdmb3VuZCBvbiB0aGUgcmVnaXN0cnkuIFNraXBwaW5nLicpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKFxuICAgICAgICAgICAgICAgICAgYFBhY2thZ2UgJHtKU09OLnN0cmluZ2lmeShucG1QYWNrYWdlSnNvbi5yZXF1ZXN0ZWROYW1lKX0gd2FzIG5vdCBmb3VuZCBvbiB0aGUgYFxuICAgICAgICAgICAgICAgICAgKyAncmVnaXN0cnkuIENhbm5vdCBjb250aW51ZSBhcyB0aGlzIG1heSBiZSBhbiBlcnJvci4nKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY2Muc2V0KG5wbVBhY2thZ2VKc29uLm5hbWUsIG5wbVBhY2thZ2VKc29uKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9LFxuICAgICAgICBuZXcgTWFwPHN0cmluZywgTnBtUmVwb3NpdG9yeVBhY2thZ2VKc29uPigpLFxuICAgICAgKSxcblxuICAgICAgbWFwKG5wbVBhY2thZ2VKc29uTWFwID0+IHtcbiAgICAgICAgLy8gQXVnbWVudCB0aGUgY29tbWFuZCBsaW5lIHBhY2thZ2UgbGlzdCB3aXRoIHBhY2thZ2VHcm91cHMgYW5kIGZvcndhcmQgcGVlciBkZXBlbmRlbmNpZXMuXG4gICAgICAgIC8vIEVhY2ggYWRkZWQgcGFja2FnZSBtYXkgdW5jb3ZlciBuZXcgcGFja2FnZSBncm91cHMgYW5kIHBlZXIgZGVwZW5kZW5jaWVzLCBzbyB3ZSBtdXN0XG4gICAgICAgIC8vIHJlcGVhdCB0aGlzIHByb2Nlc3MgdW50aWwgdGhlIHBhY2thZ2UgbGlzdCBzdGFiaWxpemVzLlxuICAgICAgICBsZXQgbGFzdFBhY2thZ2VzU2l6ZTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgIGxhc3RQYWNrYWdlc1NpemUgPSBwYWNrYWdlcy5zaXplO1xuICAgICAgICAgIG5wbVBhY2thZ2VKc29uTWFwLmZvckVhY2goKG5wbVBhY2thZ2VKc29uKSA9PiB7XG4gICAgICAgICAgICBfYWRkUGFja2FnZUdyb3VwKHRyZWUsIHBhY2thZ2VzLCBhbGxEZXBlbmRlbmNpZXMsIG5wbVBhY2thZ2VKc29uLCBsb2dnZXIpO1xuICAgICAgICAgICAgX2FkZFBlZXJEZXBlbmRlbmNpZXModHJlZSwgcGFja2FnZXMsIGFsbERlcGVuZGVuY2llcywgbnBtUGFja2FnZUpzb24sIGxvZ2dlcik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gd2hpbGUgKHBhY2thZ2VzLnNpemUgPiBsYXN0UGFja2FnZXNTaXplKTtcblxuICAgICAgICAvLyBCdWlsZCB0aGUgUGFja2FnZUluZm8gZm9yIGVhY2ggbW9kdWxlLlxuICAgICAgICBjb25zdCBwYWNrYWdlSW5mb01hcCA9IG5ldyBNYXA8c3RyaW5nLCBQYWNrYWdlSW5mbz4oKTtcbiAgICAgICAgbnBtUGFja2FnZUpzb25NYXAuZm9yRWFjaCgobnBtUGFja2FnZUpzb24pID0+IHtcbiAgICAgICAgICBwYWNrYWdlSW5mb01hcC5zZXQoXG4gICAgICAgICAgICBucG1QYWNrYWdlSnNvbi5uYW1lLFxuICAgICAgICAgICAgX2J1aWxkUGFja2FnZUluZm8odHJlZSwgcGFja2FnZXMsIGFsbERlcGVuZGVuY2llcywgbnBtUGFja2FnZUpzb24sIGxvZ2dlciksXG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHBhY2thZ2VJbmZvTWFwO1xuICAgICAgfSksXG5cbiAgICAgIHN3aXRjaE1hcChpbmZvTWFwID0+IHtcbiAgICAgICAgLy8gTm93IHRoYXQgd2UgaGF2ZSBhbGwgdGhlIGluZm9ybWF0aW9uLCBjaGVjayB0aGUgZmxhZ3MuXG4gICAgICAgIGlmIChwYWNrYWdlcy5zaXplID4gMCkge1xuICAgICAgICAgIGlmIChvcHRpb25zLm1pZ3JhdGVPbmx5ICYmIG9wdGlvbnMuZnJvbSAmJiBvcHRpb25zLnBhY2thZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gX21pZ3JhdGVPbmx5KFxuICAgICAgICAgICAgICBpbmZvTWFwLmdldChvcHRpb25zLnBhY2thZ2VzWzBdKSxcbiAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgb3B0aW9ucy5mcm9tLFxuICAgICAgICAgICAgICBvcHRpb25zLnRvLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBzdWJsb2cgPSBuZXcgbG9nZ2luZy5MZXZlbENhcExvZ2dlcihcbiAgICAgICAgICAgICd2YWxpZGF0aW9uJyxcbiAgICAgICAgICAgIGxvZ2dlci5jcmVhdGVDaGlsZCgnJyksXG4gICAgICAgICAgICAnd2FybicsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBfdmFsaWRhdGVVcGRhdGVQYWNrYWdlcyhpbmZvTWFwLCAhIW9wdGlvbnMuZm9yY2UsIHN1YmxvZyk7XG5cbiAgICAgICAgICByZXR1cm4gX3BlcmZvcm1VcGRhdGUodHJlZSwgY29udGV4dCwgaW5mb01hcCwgbG9nZ2VyLCAhIW9wdGlvbnMubWlncmF0ZU9ubHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBfdXNhZ2VNZXNzYWdlKG9wdGlvbnMsIGluZm9NYXAsIGxvZ2dlcik7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuXG4gICAgICBzd2l0Y2hNYXAoKCkgPT4gb2YodHJlZSkpLFxuICAgICk7XG4gIH07XG59XG4iXX0=