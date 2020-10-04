/**
 * React Static Boilerplate
 * https://github.com/koistya/react-static-boilerplate
 *
 * Copyright © 2015-2016 Konstantin Tarkus (@koistya)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const ncp = require("ncp").ncp,
    shell = require("shelljs"),
    fs = require("fs"),
    del = require("del"),
    webpack = require("webpack"),
    createConfigure = require("./webpack.config.js");

process.traceDeprecation = true;

function copy(basePath, targetPath) {
    return new Promise((resolve) => {
        const sourceFolder = basePath + "src/static/";

        ncp(sourceFolder, targetPath, {}, () => {
            shell.exec(
                'html-minifier --input-dir "' +
                    targetPath +
                    '"  --output-dir "' +
                    targetPath +
                    '" --file-ext html --collapse-whitespace --remove-comments'
            );

            resolve();
        });
    });
}

function bundle(config) {
    return new Promise((resolve, reject) => {
        const bundler = webpack(config);

        const run = (err, stats) => {
            if (err) {
                reject(err);
            } else {
                console.log("finish bundle:" + stats.toString(config.stats));
                resolve();
            }
        };

        bundler.run(run);
    });
}

function build(webpackConfig, sourceMapPath, CNAME) {
    const outputPath = webpackConfig.output.path,
        basePath = webpackConfig.context;

    return copy(basePath, outputPath)
        .then(() => createCNAME(outputPath, CNAME))
        .then(() => bundle(webpackConfig))
        .then(() => {
            if (sourceMapPath) {
                console.info("copy sourcemap files to:" + sourceMapPath);

                shell.config.silent = true;

                shell.cp(webpackConfig.output.path + "*.map", sourceMapPath);

                shell.rm(webpackConfig.output.path + "*.map");

                shell.config.silent = false;
            }
        });
}

function createCNAME(path, CNAME) {
    if (CNAME) fs.writeFileSync(path + "CNAME", CNAME);
}

function createBuildConfigure(params, isForDebug) {
    // Build the project in RELEASE mode which
    // generates optimized and minimized bundles
    if (!isForDebug) {
        if (!process.argv.includes("-r")) process.argv.push("-r");
    }

    const config = createConfigure(params),
        outputPath = config.output.path,
        pathAry = [outputPath + "*"];

    if (params.sourceMapPath) {
        shell.mkdir("-p", params.sourceMapPath);

        pathAry.push(params.sourceMapPath + "*");
    }

    console.info("current path:" + shell.pwd());

    console.info("clear the files:" + pathAry);

    del.sync(pathAry, { dot: true });

    return config;
}

module.exports = { build: build, createBuildConfigure: createBuildConfigure };
