const HtmlWebPackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const StringReplacePlugin = require("string-replace-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const WebpackShellPlugin = require("webpack-shell-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const fs = require('fs');
const AdmZip = require('adm-zip');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const webpack = require("webpack");

var path = require("path");
var languages = {
	en: require("./locale/en.json"),
	de: require("./locale/de.json"),
};

const devMode = process.env.NODE_ENV !== 'production'

module.exports = Object.keys(languages).map(function(language) {

    var plugins = [];
    var rules = [];

    if(process.env.enableTests) {

        // Unzip the firefox profile if not already.
        var exists = fs.existsSync("../common/test/firefox_profile");
        if( !exists ) {
            var zip = new AdmZip("../common/test/firefox_profile.zip");
            zip.extractAllTo("../common/test/", true)
        }

        plugins.push(new WebpackShellPlugin({
            onBuildEnd: [
                "mocha ./src/tests/mocha_tests.js"
            ]
        }));

        rules.push({
            test: /\.js$|\.jsx$/,
            use: {
              loader: 'istanbul-instrumenter-loader',
              options: { esModules: true }
            },
            enforce: 'post',
            exclude: /node_modules|\.spec\.js$|..\/common\/lib\/sjcl.js/
          });
    }

    return {
        name: language,
        context: __dirname,
        mode: process.env.NODE_ENV || 'development',
        optimization: {
            sideEffects: true,
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {
                        output: {
                            comments: false
                        }
                    },
                    cache: true,
                }),
                new OptimizeCSSAssetsPlugin({})
              ]
        },
        module: {
            noParse: [
                /sjcl\.js$/,
            ],
            rules: rules.concat([
                {
                    test: /\.(html)$/,
                    use: [
                        {
                            loader: "html-loader",
                        }
                    ]
                },
                { 
                    // Used for localization
                    test: /\.(html|js)$/,
                    loader: StringReplacePlugin.replace({
                        replacements: [
                            {
                                pattern: /<%= *(\w*?) *%>/ig,
                                replacement: function (match, p1, offset, string) {
                                    return languages[language][p1];
                                }
                            }
                        ]})
                },
                {
                    test: /\.css$/,
                    use: [ 
                        devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader'
                    ]
                },
                {
                    test: /\.(jpe?g|gif|png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                    use: 'base64-inline-loader?limit=1000&name=[name].[ext]'
                }
            ])
        },
        plugins: plugins.concat([
            new CleanWebpackPlugin([
                                    'dist', 
                                    'src/tests/test_downloads/*',
                                    ],{root: __dirname}),
            new HtmlWebPackPlugin({
                template: "./src/index.html",
                filename: language === 'en' ? 'index.html' : language + '.index.html',
                minify: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    keepClosingSlash: true,
                    removeComments: true,
                    minifyCSS: true,
                    minifyJS: {
                        mangle: {
                            keep_quoted_props: true
                        }
                    }
                },
                inlineSource: '.(js|css)$'
            }),
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css"
            }),
            new HtmlWebpackInlineSourcePlugin(),
            new webpack.optimize.AggressiveMergingPlugin(),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': '"production"'
            }),
        ]),
        serve: {
            hotClient: {
                logLevel: "warn"
            },
            devMiddleware: {
                logLevel: "warn"
            },
            content: "./public_html/",
            host: '127.0.0.1',
            port: 1338,
        }
    }
});