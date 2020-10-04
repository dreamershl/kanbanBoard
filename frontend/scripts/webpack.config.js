/**
 * React Static Boilerplate
 * https://github.com/koistya/react-static-boilerplate
 *
 * Copyright © 2015-2016 Konstantin Tarkus (@koistya)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const moment = require("moment");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");

const CompressionPlugin = require("compression-webpack-plugin");

const babelOptions = {
    babelrc: false,

    presets: [
        [
            "@babel/preset-env",
            {
                useBuiltIns: "usage",
                corejs: 3,
            },
        ],
        "@babel/preset-typescript",
        "@babel/preset-react",
    ],

    plugins: [
        "@babel/plugin-proposal-optional-chaining",
        "@babel/plugin-proposal-class-properties",
        [
            "@babel/plugin-syntax-object-rest-spread",
            {
                useBuiltIns: true,
            },
        ],
    ],
};

/**
 * Webpack configuration (core/main.js => build/bundle.js)
 * http://webpack.github.io/docs/configuration.html
 */
function createConfig(params) {
    params = params || {};

    const isDebug = !(process.argv.includes("--release") || process.argv.includes("-r")),
        isVerbose = process.argv.includes("--verbose") || process.argv.includes("-v"),
        analyzeBundle = params.analyzeBundle,
        baseFolder = path.resolve(__dirname, "../") + "/",
        bundleName = isDebug ? "bundle.js" : "[name].[chunkhash].js",
        cssFileName = isDebug ? "style.css" : "style.[md5:contenthash:hex:20].css",
        version = `2.${moment().format("YYYYMMDD")}`;

    const defines = {
        __XCEDER_VERSION__: JSON.stringify(version),
        __API_ENDPOINT__: JSON.stringify(params.endpoint),
        __RESOURCE_HOST__: JSON.stringify(params.endpoint),
        __DEV__: isDebug,
    };

    const config = {
        // The base directory
        context: baseFolder,

        // The entry point for the bundle
        entry: ["./src/index.tsx"],

        // Options affecting the output of the compilation
        output: {
            path: baseFolder + "build/",
            publicPath: "/",
            filename: bundleName,
            //chunkFilename: 'bundle.js',
            sourcePrefix: "  ",
            globalObject: `(() => {
            if (typeof self !== 'undefined') {
                return self;
            } else if (typeof window !== 'undefined') {
                return window;
            } else if (typeof global !== 'undefined') {
                return global;
            } else {
                return Function('return this')();
            }
        })()`,
        },

        // Developer tool to enhance debugging, source maps
        // http://webpack.github.io/docs/configuration.html#devtool
        devtool: "source-map",

        // What information should be printed to the console
        stats: isVerbose ? "normal" : "minimal",

        node: {
            fs: "empty",
        },

        resolve: {
            alias: {
                svgIcons: baseFolder + "src/svgIcons",
            },
            extensions: [".tsx", ".ts", ".js"],
        },

        // The list of plugins for Webpack compiler
        plugins: [
            new HtmlWebpackPlugin({
                filename: "index.html",
                template: "./src/static/index.html",
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                },
            }),

            new GenerateJsonPlugin("version.json", { version }),

            new ExtractTextPlugin(cssFileName),
            // Switch loaders to debug or release mode
            new webpack.LoaderOptionsPlugin({
                debug: isDebug,
            }),
            new BundleAnalyzerPlugin({ analyzerMode: analyzeBundle ? "static" : "disable" }),

            new webpack.DefinePlugin(defines),
        ],

        // Options affecting the normal modules
        module: {
            rules: [
                {
                    test: /\.svg$/,
                    use: [
                        {
                            loader: "svg-sprite-loader",
                            options: {
                                spriteFilename: "xcederSvgIcon",
                            },
                        },
                        {
                            loader: "svgo-loader",
                            options: {
                                plugins: [
                                    { removeTitle: true },
                                    { removeDesc: true },
                                    { convertPathData: false },
                                    { removeUselessStrokeAndFill: false },
                                ],
                            },
                        },
                    ],
                },

                {
                    test: /\.(proto|pem|pkcs8|csv)$/,
                    use: "raw-loader",
                },

                {
                    test: /\.worker\.ts$/,
                    use: {
                        loader: "worker-loader",
                        options: { inline: true, fallback: false },
                    },
                },

                {
                    test: /\.[jt]sx?$/,
                    exclude: /node_modules|react-stockcharts/,
                    loader: "babel-loader",
                    options: babelOptions,
                },

                {
                    enforce: "pre",
                    test: /\.js$/,
                    loader: "source-map-loader",
                },

                {
                    test: /\.css$/,
                    use: [
                        "style-loader",
                        `css-loader`,
                        {
                            loader: "postcss-loader",
                            options: {
                                plugins: function () {
                                    return [
                                        // Transfer @import rule by inlining content, e.g. @import 'normalize.css'
                                        // https://github.com/postcss/postcss-import
                                        require("postcss-import"),
                                        // W3C variables, e.g. :root { --color: red; } div { background: var(--color); }
                                        // https://github.com/postcss/postcss-custom-properties
                                        require("postcss-custom-properties"),
                                        // W3C CSS Custom Media Queries, e.g. @custom-media --small-viewport (max-width:
                                        // 30em); https://github.com/postcss/postcss-custom-media
                                        require("postcss-custom-media"),
                                        // CSS4 Media Queries, e.g. @media screen and (width >= 500px) and (width <= 1200px)
                                        // { } https://github.com/postcss/postcss-media-minmax
                                        require("postcss-media-minmax"),
                                        // W3C CSS Custom Selectors, e.g. @custom-selector :--heading h1, h2, h3, h4, h5, h6;
                                        // https://github.com/postcss/postcss-custom-selectors
                                        require("postcss-custom-selectors"),
                                        // W3C calc() function, e.g. div { height: calc(100px - 2em); }
                                        // https://github.com/postcss/postcss-calc
                                        require("postcss-calc"),
                                        // Allows you to nest one style rule inside another
                                        // https://github.com/jonathantneal/postcss-nesting
                                        require("postcss-nesting"),
                                        // W3C color() function, e.g. div { background: color(red alpha(90%)); }
                                        // https://github.com/postcss/postcss-color-function
                                        require("postcss-color-function"),
                                        // Convert CSS shorthand filters to SVG equivalent, e.g. .blur { filter: blur(4px); }
                                        // https://github.com/iamvdo/pleeease-filters
                                        require("pleeease-filters"),
                                        // Generate pixel fallback for "rem" units, e.g. div { margin: 2.5rem 2px 3em 100%; }
                                        // https://github.com/robwierzbowski/node-pixrem
                                        require("pixrem"),
                                        // W3C CSS Level4 :matches() pseudo class, e.g. p:matches(:first-child, .special) { }
                                        // https://github.com/postcss/postcss-selector-matches
                                        require("postcss-selector-matches"),
                                        // Transforms :not() W3C CSS Level 4 pseudo class to :not() CSS Level 3 selectors
                                        // https://github.com/postcss/postcss-selector-not
                                        require("postcss-selector-not"),
                                        // Add vendor prefixes to CSS rules using values from caniuse.com
                                        // https://github.com/postcss/autoprefixer
                                        require("autoprefixer"),
                                    ];
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.scss$/,
                    // loader: "style-loader!css-loader!resolve-url-loader!sass-loader",
                    use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: [
                            {
                                loader: "css-loader",
                                options: {
                                    sourceMap: true,
                                },
                            },
                            {
                                loader: "resolve-url-loader",
                            },
                            {
                                loader: "sass-loader",
                                options: {
                                    sourceMap: true,
                                },
                            },
                        ],
                    }),
                },
                {
                    test: /\.(png|jpg|jpeg|gif|woff|woff2)$/,
                    exclude: [baseFolder + "src/svgIcons"],
                    use: [
                        {
                            loader: "url-loader",
                            options: {
                                limit: 10000,
                            },
                        },
                    ],
                },
                {
                    test: /\.(eot|ttf|wav|mp3)$/,
                    exclude: [baseFolder + "src/static"],
                    loader: "file-loader",
                },
            ],
        },
    };

    // Optimize the bundle in release (production) mode
    if (isDebug) {
        // Hot Module Replacement (HMR) + React Hot Reload
        config.entry = [
            "react-hot-loader/patch",
            "webpack-hot-middleware/client",
            "./src/hotReload.tsx",
        ];

        babelOptions.plugins.push(require.resolve("react-hot-loader/babel"));

        // config.resolve.alias["react-dom"] = require.resolve("@hot-loader/react-dom");
        // config.resolve.alias["react-dom/server"] = require.resolve("@hot-loader/react-dom/server");

        config.mode = "development";
    } else {
        config.mode = "production";

        config.optimization = {
            minimizer: [
                new TerserPlugin({
                    sourceMap: true,
                    parallel: true,

                    terserOptions: {
                        keep_classnames: false,
                        keep_fnames: false,

                        output: {
                            comments: false,
                        },

                        compress: {
                            drop_console: true,
                            warnings: true,
                        },

                        ecma: 6,
                    },
                }),
            ],
        };

        config.plugins.push(
            new webpack.optimize.AggressiveMergingPlugin(),

            new CompressionPlugin({
                filename: "[path].gz[query]",
                algorithm: "gzip",
                test: /\.(js|css|html|svg)$/,
                threshold: 10240,
                minRatio: 0.8,
            }),

            new CompressionPlugin({
                filename: "[path].br[query]",
                algorithm: "brotliCompress",
                test: /\.(js|css|html|svg)$/,
                compressionOptions: { level: 11 },
                threshold: 10240,
                minRatio: 0.8,
            })
        );
    }

    console.info("configure webpack as:" + config.mode);

    return config;
}

module.exports = createConfig;
