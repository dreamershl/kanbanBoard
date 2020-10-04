/**
 * React Static Boilerplate
 * https://github.com/koistya/react-static-boilerplate
 *
 * Copyright © 2015-2016 Konstantin Tarkus (@koistya)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const browserSync = require("browser-sync"),
    webpack = require("webpack"),
    webpackDevMiddleware = require("webpack-dev-middleware"),
    webpackHotMiddleware = require("webpack-hot-middleware"),
    task = require("./task");

task(
    "start",
    () =>
        new Promise((resolve) => {
            const params = {
                endpoint: process.env.endpoint,
            };

            const config = require("./webpack.config")(params);

            config.plugins.push(new webpack.HotModuleReplacementPlugin());

            const bundler = webpack(config);

            browserSync({
                ghostMode: false,
                server: {
                    baseDir: "src/static",

                    middleware: [
                        webpackDevMiddleware(bundler, {
                            // IMPORTANT: dev middleware can't access config, so we should
                            // provide publicPath by ourselves
                            publicPath: config.output.publicPath,

                            // pretty colored output
                            stats: config.stats,

                            // for other settings see
                            // http://webpack.github.io/docs/webpack-dev-middleware.html
                        }),

                        // bundler should be the same as above
                        webpackHotMiddleware(bundler),

                        // Serve index.html for all unknown requests
                        (req, res, next) => {
                            if (req.headers.accept && req.headers.accept.startsWith("text/html")) {
                                req.url = "/index.html"; // eslint-disable-line
                                // no-param-reassign
                            }
                            next();
                        },
                    ],
                },

                cors: true,
                localOnly: true,
                online: true,

                // no need to watch '*.js' here, webpack will take care of it for us,
                // including full page reloads if HMR won't work
                files: ["build/**/*.css", "build/**/*.html"],
            });

            resolve();
        })
);
