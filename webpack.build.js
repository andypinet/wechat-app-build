const argv = require('yargs').argv
const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const fs = require('fs')
const fse = require('fs-extra')
const exec = require('child_process').exec;
const vueParser = require('vue-parser')
const packageImporter = require('node-sass-package-importer');
const sass = require('node-sass');
const watch = require('node-watch')
const webpack = require('webpack')
const projectconfig = require("./webpack.conf");


const utils = {
    readFile: function (path) {
        try {
            return fs.readFileSync(path);
        } catch (e) {
            console.error(e);
        }
    }
};

const spinner = ora('building for production... ')
spinner.start()

const TMPFOLDERNAME = "tmp";

// if (argv.watch) {
//     projectconfig.webpackconfig.watch = true;
// } else {
//     // projectconfig.webpackconfig.plugins.push( new webpack.optimize.UglifyJsPlugin({
//     // }))
// }
//
// if (argv.uglify) {
//     projectconfig.webpackconfig.plugins.push( new webpack.optimize.UglifyJsPlugin({
//     }))
// }

function compile(filename, filepath, destpath) {
    return new Promise(function (resolve, reject) {
        exec(`npx babel ${filepath} --out-file ${destpath}`, function (err, stdout, stderr) {
            if (err) throw err
            resolve();
        })
    })
}

function handleVue(evt, filepath) {
    let paths = filepath.split(path.sep);
    let filename = paths[paths.length - 1];
    let folder = paths.filter(function (v, index) {
        if (index === paths.length - 1) {
            return false
        }
        return true;
    }).join(path.sep);
    if (filepath.indexOf("___jb_") < 0) {
        if (filename.indexOf("wxc") > -1 || filename.indexOf("wxp") > -1) {
            let destfolder = folder.replace(projectconfig.config.workspaceroot, "");
            let packagename = paths[paths.length - 2];
            let tmpfolder = paths.slice(paths.length - 3, paths.length - 1).join(path.sep);
            try {
                let filecontent = utils.readFile(filepath).toString();
                let destroot = path.join(projectconfig.config.destroot, destfolder);
                if (filecontent) {
                    console.log(chalk.cyan("build package " + filepath));

                    // 确保目录存在
                    fse.emptyDirSync(destroot);

                    let myScriptContents = vueParser.parse(filecontent, 'script', { lang: ['js'] })
                    myScriptContents = myScriptContents.replace(/^\/\/\stslint:disable[\w\s\n\/]* tslint:enable/g, '').trim();
                    let tmppath = path.join(folder, `../../../${TMPFOLDERNAME}/${tmpfolder}/index.js`);

                    fse.outputFileSync(tmppath, myScriptContents);

                    let filebasename = "";
                    if (filename.indexOf("wxc") > -1) {
                        filebasename = filename.replace(/.wxc$/, "")
                    } else {
                        filebasename = filename.replace(/.wxp$/, "")
                    }

                    // 先确保有文件
                    fse.ensureFileSync(path.join(projectconfig.config.destroot, `/${tmpfolder}/index.js`));

                    compile(filebasename, tmppath, path.join(projectconfig.config.destroot, `/${tmpfolder}/index.js`)).then(function () {
                        const myStyleContents = vueParser.parse(filecontent, 'style', { lang: ['scss'] }).replace('tslint:enable', '').replace('tslint:disable', '').trim()
                        const compiledStyle = sass.renderSync({
                            data: myStyleContents,
                            importer: packageImporter({}),
                            includePaths: [
                                folder
                            ],
                            functions: {
                            }
                        }).css;

                        fse.outputFileSync(path.join(destroot, "/index.wxss"), compiledStyle);

                        const myTemplateContents = vueParser.parse(filecontent, 'template', {}).replace('//////////', '').trim()

                        fse.outputFileSync(path.join(destroot, "/index.wxml"), myTemplateContents);

                        fse.copySync(path.join(folder, "/index.json"), path.join(destroot, "/index.json"));
                    })

                }
            } catch (e) {

            }
        }
    }
}

watch(projectconfig.config.wxproot, { recursive: true }, handleVue);
