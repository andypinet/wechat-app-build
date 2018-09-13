const path = require('path')

var isWin = /^win/.test(process.platform)

const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const RunAfterBuildPlugin = require('webpack-run-after-build-plugin')

const exec = require('child_process').exec

let config = {}
// config.target = "web";
config.workspaceroot = path.join(__dirname, 'src')
config.wxproot = [
  path.join(config.workspaceroot, 'pages'),
  path.join(config.workspaceroot, 'components')
]
config.tmproot = path.join(__dirname, 'tmp')
if (isWin) {
  config.destroot = path.join(__dirname, './dist')
} else {
  config.destroot = path.join(__dirname, './dist')
  // config.destroot =  path.join(__dirname, "../test-web");
  if (config.target) {
    config.destroot = path.join(__dirname, `./${config.target}`)
  }
}

const extractAppScss = new ExtractTextPlugin('app.wxss')

module.exports = {
  config: config,
  date: new Date(),
  webpackconfig: {
    entry: './src/index',
    output: {
      path: config.destroot,
      filename: 'index.js'
      // library: "MyLibrary",
      // libraryTarget: "commonjs",
      // publicPath: "/assets/"
    },
    watch: true,
    plugins: [
      new CopyWebpackPlugin(
        [
          {
            from: './src/app.json',
            to: './app.json'
          },
          {
            context: './src/static',
            from: '**/*',
            to: './static'
          },
          {
            context: './src/pages',
            from: '**/*.json',
            to: './pages'
          },
          {
            context: './src/components',
            from: '**/*.json',
            to: './components'
          }
        ],
        {}
      ),
      new ExtractTextPlugin('app.wxss'),
      new RunAfterBuildPlugin(() => {
        console.log('Files are ready to use!');
        exec('gulp r', function(err, stdout, stderr) {
          if (err) {
            return err
          }
          console.log(stdout)
          console.error(stderr)
        })
      })
    ],
    module: {
      rules: [
        {
          test: /[\.js\.jsx\.es]$/,
          exclude: function(modulePath) {
            return (
              /node_modules/.test(modulePath) &&
              !/node_modules\/andy-ui/.test(modulePath)
            )
          },
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    'env',
                    {
                      module: false,
                      targets: {
                        browsers: ['iOS > 7']
                      }
                    }
                  ]
                ],
                plugins: [
                  ['transform-object-rest-spread'],
                  ['transform-async-generator-functions'],
                  [
                    'transform-runtime',
                    {
                      helpers: false,
                      polyfill: false,
                      regenerator: false
                    }
                  ]
                ]
              }
            },
            {
              loader: 'webpack-replace-loader',
              options: {
                arr: [{ search: 'wxrequire', replace: 'require', attr: 'g' }]
              }
            }
          ]
        },
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  // If you are having trouble with urls not resolving add this setting.
                  // See https://github.com/webpack-contrib/css-loader#url
                  url: false,
                  minimize: false,
                  sourceMap: false
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true
                }
              },
              {
                loader: 'postcss-loader'
              }
            ]
          })
        }
      ]
    }
  }
}
