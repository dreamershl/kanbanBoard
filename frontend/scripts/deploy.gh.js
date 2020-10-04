/**
 * React Static Boilerplate
 * https://github.com/koistya/react-static-boilerplate
 *
 * Copyright © 2015-2016 Konstantin Tarkus (@koistya)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const shell = require("shelljs"),
    task = require("./task"),
    build = require("./build");

function deploy(params) {
    const webPackConfig = build.createBuildConfigure(params, false),
        buildPromise = task("build", () =>
            build.build(webPackConfig, params.sourceMapPath, params.CNAME)
        );

    return buildPromise.then(() => {
        if (!params.build)
            return task("commit", () => {
                const targetFolder = webPackConfig.output.path;
                shell.exec(`echo commit ${webPackConfig.output.path} to ${params.url}`);

                shell.cd(targetFolder);
                shell.exec("git init");
                shell.exec("git add -A . ");
                shell.exec(
                    `git commit -m "deploy github pages on ${new Date().toISOString()}" -- ${targetFolder}`
                );
                shell.exec(`git remote add -f origin ${params.url}`);
                shell.exec("git push -f origin master:gh-pages");
            });
    });
}

/**
 * Deploy the contents of the `/build` folder to GitHub Pages.
 */

module.exports = deploy;
