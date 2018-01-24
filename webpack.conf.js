const path = require('path');

var isWin = /^win/.test(process.platform);

let config = {};
config.target = "web";
config.workspaceroot = path.join(__dirname, "src");
config.wxproot = path.join(config.workspaceroot);
if (isWin) {

} else {
    // config.destroot =  path.join(__dirname, "./dist");
    config.destroot =  path.join(__dirname, "../test-web");
}

module.exports = {
    config: config,
    date: new Date(),
    webpackconfig: {
        entry: "",
        output: {
            path: config.destroot,
            filename: "index.js",
            library: "MyLibrary",
            libraryTarget: "umd",
            publicPath: "/assets/"
        },
        watch: false,
        plugins: [],
        module: {
            rules: [
                {
                    test: /[\.js\.jsx\.es]$/,
                    exclude: function(modulePath) {
                        return /node_modules/.test(modulePath) &&
                            !/node_modules\/andy-ui/.test(modulePath);
                    },
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    'env',
                                    {
                                        module: false,
                                        targets: {
                                            "browsers": ['iOS > 7']
                                        }
                                    }
                                ]
                            ],
                            plugins: [
                                ["transform-runtime", {
                                    "helpers": false,
                                    "polyfill": false,
                                    "regenerator": true
                                }]
                            ]
                        }
                    }
                }
            ]
        }
    }
};