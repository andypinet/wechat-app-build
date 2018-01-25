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
const postcss = require('postcss');
const pretty = require('pretty');
const cssmodules = require('postcss-icss-selectors')
const v = require('voca');
const jsdom = require("jsdom");
const watch = require('node-watch')
const Cacheman = require('cacheman');
const webpack = require('webpack')
const projectconfig = require("./webpack.conf");

const csscache = new Cacheman('css');
const xmlcache = new Cacheman('xml');
const otscache = new Cacheman('ots');

async function diffchange(key, data, cachestore) {
    let newval = data;
    let cacval = await cachestore.get(key);
    let ret = 'init';
    // console.log(cacval);
    if (cacval) {
        let oldval = new Buffer(cacval.data);
        // console.log(newval);
        // console.log(oldval);
        if (oldval && oldval.equals && !oldval.equals(newval)) {
            ret = 'change'
        } else {
            ret = 'unchange'
        }
    }
    await cachestore.set(key, newval);
    return ret;
}


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

function compile(filename, filepath, destpath, options = {}) {
    let cwd = `npx babel ${filepath} --out-file ${destpath}`;
    if (options.sourcemap) {
        cwd = cwd + ' --source-maps';
    }
    return new Promise(function (resolve, reject) {
        exec(cwd, function (err, stdout, stderr) {
            if (err) throw err
            resolve();
        })
    })
}

function attributeToWxAttribute(str) {
    return str.split('"').map(function (a, index) {
        if (index === 1) {
            return a.split(";").map(function (v) {
                if (v && v.startWith("{") && v.endsWith("}")) {
                    return `{{${v}}}`;
                }
                return '';
            }).join(" ");
        }
        return a;
    }).join('"');
}


function traux(template, isWx = true) {
    let ret = template.replace(/(<[\w-]+[\s]+)([\w:]+=".+")([^>]*>)/g, function (match, $1, $2, $3) {
        let s = $2.replace(/(b:[\w]+=")([^"]+)(")/g, function (match, $1, $2, $3) {
            // 所有以b:开头的
            $2 = $2.split(";").map(function (v) {
                if (v && v.trim().startsWith("{") && v.trim().endsWith("}")) {
                    return `{${v.trim()}}`;
                }
                return v;
            }).join(" ");

            return $1.replace("b:", "") + $2 + $3;
        });
        return $1 + s + $3;
    });
    return pretty(ret);
}

let wxptemplate = function (path, js, after = "") {
    return fs.readFileSync(path).toString().replace('@{js}', js).replace('@{after}', after);
};

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
        if (filename.endsWith(".wxc") || filename.endsWith(".wxp")) {
            let destfolder = folder.replace(projectconfig.config.workspaceroot, "");
            let packagename = paths[paths.length - 2];
            let tmpfolder = paths.slice(paths.length - 3, paths.length - 1).join(path.sep);
            try {
                let filecontent = utils.readFile(filepath).toString();
                let destroot = path.join(projectconfig.config.destroot, destfolder);
                if (filecontent) {
                    console.log(chalk.cyan("build package " + filepath));


                    let myScriptContents = vueParser.parse(filecontent, 'script', { lang: ['js'] })
                    let tmppath = path.join(folder, `../../../${TMPFOLDERNAME}/${tmpfolder}/index.js`);
                    let tmpcompilepath = path.join(folder, `../../../${TMPFOLDERNAME}/${tmpfolder}/index.compile.js`);
                    let tmpminpath = path.join(folder, `../../../${TMPFOLDERNAME}/${tmpfolder}/index.min.js`);
                    let destscriptpath = path.join(projectconfig.config.destroot, `/${tmpfolder}/index.js`);

                    // 确保目录存在
                    fse.ensureDirSync(destroot);

                    myScriptContents = myScriptContents.replace(/^\/\/\stslint:disable[\w\s\n\/]* tslint:enable/g, '').trim();

                    fse.outputFileSync(tmppath, myScriptContents);

                    let filebasename = "";
                    if (filename.indexOf("wxc") > -1) {
                        filebasename = filename.replace(/.wxc$/, "")
                    } else {
                        filebasename = filename.replace(/.wxp$/, "")
                    }

                    // 先确保有文件
                    fse.ensureFileSync(path.join(projectconfig.config.destroot, `/${tmpfolder}/index.js`));

                    let scopedcss = {};

                    let ret = {};
                    ret.$is = paths[paths.length - 2];

                    let constants = {
                        '#{$IS}': ret.$is
                    };


                    compile(filebasename, tmppath, tmpcompilepath).then(function () {
                        // fse.copySync(tmpcompilepath, destscriptpath);

                        let compilejs = fs.readFileSync(tmpcompilepath).toString();

                        if (filename.endsWith("wxp")) {
                            let wxp = wxptemplate(path.join(__dirname, "./template/wxp.js"), compilejs, "//@end");
                            fse.outputFileSync(destscriptpath, wxp);
                        } else {
                            let wxp = wxptemplate(path.join(__dirname, "./template/wxc.js"), compilejs, "//@end");
                            fse.outputFileSync(destscriptpath, wxp);
                        }

                        
                        scopedcss = {};

                        let myStyleContents = vueParser.parse(filecontent, 'style', { lang: ['scss'] }).replace('tslint:enable', '').replace('tslint:disable', '').trim();

                        myStyleContents = `
                            $IS: ${ret.$is};
                        ` + myStyleContents;

                        diffchange(path.join(folder, "/index.wxss"), Buffer.from(myStyleContents), xmlcache).then(function (isChange) {
                            if (isChange !== 'unchange') {
                                const compiledStyle = sass.renderSync({
                                    data: myStyleContents,
                                    importer: packageImporter({}),
                                    includePaths: [
                                        folder
                                    ],
                                    functions: {
                                    }
                                });

                                let exportcss = /(:export[\s]*{)([^}]*)(})/g;

                                let isscoped = false;
                                if (/<style.*scoped>/g.test(filecontent)) {
                                    isscoped = true;
                                } else {

                                }

                                let postcssmodules = [];

                                if (isscoped) {
                                    postcssmodules.push(cssmodules({}))
                                }


                                postcss(postcssmodules)
                                    .process(compiledStyle.css)
                                    .then(result => {
                                        if (isscoped) {
                                            result.css.replace(exportcss, function (match, $1, $2, $3) {
                                                $2.trim().split(";").forEach(function (v) {
                                                    let s = v.trim().split(":");
                                                    if (s.length > 1) {
                                                        scopedcss[s[0].trim()] = s[1].trim();
                                                    }
                                                })
                                            });

                                            result.css = result.css.replace(exportcss, "");
                                        }

                                        let myTemplateContents = vueParser.parse(filecontent, 'template', {}).replace('//////////', '').trim()

                                        myTemplateContents = v.tr(myTemplateContents, constants);

                                        myTemplateContents = traux(myTemplateContents);

                                        diffchange(path.join(folder, "/index.wxml"), Buffer.from(myTemplateContents), xmlcache).then(function (isChange) {
                                            if (isChange === 'change') {
                                            }

                                            if (isscoped) {
                                                for (let key in scopedcss) {
                                                    myTemplateContents = myTemplateContents.replace(new RegExp(`class="${key}`, 'g'), 'class="'+scopedcss[key]);
                                                }
                                            }

                                            fse.outputFileSync(path.join(destroot, "/index.wxml"), myTemplateContents);
                                        });


                                        fse.outputFileSync(path.join(destroot, "/index.wxss"), result.css);
                                    });

                            }
                        });


                        diffchange(path.join(folder, "/index.json"), fs.readFileSync(path.join(folder, "/index.json")), otscache).then(function (isChange) {
                            if (isChange === 'change') {
                                fse.copySync(path.join(folder, "/index.json"), path.join(destroot, "/index.json"));
                            }
                            if (isChange === 'init') {
                                fse.copySync(path.join(folder, "/index.json"), path.join(destroot, "/index.json"));
                            }
                        })
                    })

                }
            } catch (e) {

            }
        }
    }
}

let webtemplate = function (path, css, template, js, is, after = "") {
    return fs.readFileSync(path).toString().replace('@{css}', css).replace('@{template}', template).replace('@{js}', js).replace('@{is}', is).replace('@{after}', after);
};

function handleWeb(evt, filepath) {
    let paths = filepath.split(path.sep);
    let filename = paths[paths.length - 1];
    let folder = paths.filter(function (v, index) {
        if (index === paths.length - 1) {
            return false
        }
        return true;
    }).join(path.sep);
    if (filepath.indexOf("___jb_") < 0) {
        if (filename.endsWith(".wxc")) {
            let destfolder = folder.replace(projectconfig.config.workspaceroot, "");
            let packagename = paths[paths.length - 2];
            let tmpfolder = paths.slice(paths.length - 3, paths.length - 1).join(path.sep);
            try {
                let filecontent = utils.readFile(filepath).toString();
                let destroot = path.join(projectconfig.config.destroot, destfolder);
                if (filecontent) {
                    console.log(chalk.cyan("build package " + filepath));


                    let myScriptContents = vueParser.parse(filecontent, 'script', { lang: ['js'] })
                    let tmppath = path.join(folder, `../../../${TMPFOLDERNAME}/${tmpfolder}/index.js`);
                    let tmpcompilepath = path.join(folder, `../../../${TMPFOLDERNAME}/${tmpfolder}/index.compile.js`);
                    let tmpminpath = path.join(folder, `../../../${TMPFOLDERNAME}/${tmpfolder}/index.min.js`);
                    let destscriptpath = path.join(projectconfig.config.destroot, `/${tmpfolder}/index.js`);

                    // 确保目录存在
                    fse.ensureDirSync(destroot);

                    myScriptContents = myScriptContents.replace(/^\/\/\stslint:disable[\w\s\n\/]* tslint:enable/g, '').trim();

                    fse.outputFileSync(tmppath, myScriptContents);

                    let filebasename = "";
                    if (filename.indexOf("wxc") > -1) {
                        filebasename = filename.replace(/.wxc$/, "")
                    } else {
                        filebasename = filename.replace(/.wxp$/, "")
                    }

                    // 先确保有文件
                    fse.ensureFileSync(path.join(projectconfig.config.destroot, `/${tmpfolder}/index.js`));

                    let scopedcss = {};

                    let ret = {};
                    ret.$is = paths[paths.length - 2];

                    compile(filebasename, tmppath, tmpcompilepath).then(function () {
                        // fse.copySync(tmpcompilepath, destscriptpath);

                        let compilejs = fs.readFileSync(tmpcompilepath);

                        scopedcss = {};

                        let myStyleContents = vueParser.parse(filecontent, 'style', { lang: ['scss'] }).replace('tslint:enable', '').replace('tslint:disable', '').trim()

                        let constants = {
                            '#{$IS}': ret.$is
                        };

                        myStyleContents = `
                            $IS: ${ret.$is};
                        ` + myStyleContents;

                        diffchange(path.join(folder, "/index.wxss"), Buffer.from(myStyleContents), xmlcache).then(function (isChange) {
                            if (isChange !== 'unchange') {
                                const compiledStyle = sass.renderSync({
                                    data: myStyleContents,
                                    importer: packageImporter({}),
                                    includePaths: [
                                        folder
                                    ],
                                    functions: {
                                    }
                                });

                                let exportcss = /(:export[\s]*{)([^}]*)(})/g;

                                let isscoped = false;
                                if (/<style.*scoped>/g.test(filecontent)) {
                                    isscoped = true;
                                } else {

                                }

                                let postcssmodules = [];

                                if (isscoped) {
                                    postcssmodules.push(cssmodules({}))
                                }


                                postcss(postcssmodules)
                                    .process(compiledStyle.css)
                                    .then(result => {
                                        if (isscoped) {
                                            result.css.replace(exportcss, function (match, $1, $2, $3) {
                                                $2.trim().split(";").forEach(function (v) {
                                                    let s = v.trim().split(":");
                                                    if (s.length > 1) {
                                                        scopedcss[s[0].trim()] = s[1].trim();
                                                    }
                                                })
                                            });

                                            result.css = result.css.replace(exportcss, "");
                                        }

                                        let myTemplateContents = vueParser.parse(filecontent, 'template', {}).replace('//////////', '').trim()

                                        myTemplateContents = v.tr(myTemplateContents, constants);

                                        diffchange(path.join(folder, "/index.wxml"), Buffer.from(myTemplateContents), xmlcache).then(function (isChange) {
                                            if (isChange === 'change') {
                                            }

                                            if (isscoped) {
                                                for (let key in scopedcss) {
                                                    myTemplateContents = myTemplateContents.replace(new RegExp(`class="${key}`, 'g'), 'class="'+scopedcss[key]);
                                                }
                                            }

                                            // fse.outputFileSync(path.join(destroot, "/index.wxml"), myTemplateContents);

                                            ret.template = myTemplateContents;
                                            ret.template = ret.template.replace(/(<view)([^>])(@:if=")([^"]*)(">)/g, function(match, $1, $2, $3, $4, $5){
                                                return $1 + $2 + $3.replace("@:if", "v-if") + $4 + $5;
                                            });
                                            ret.template = ret.template.replace(/(<view)([^>])(@:for=")([^"]*)(">)/g, function(match, $1, $2, $3, $4, $5){
                                                return $1 + $2 + $3.replace("@:for", "v-for") + $4 + $5;
                                            });
                                            // 处理view
                                            ret.template = ret.template.replace(/(<view)([^>]*)>/g, function(match, $1, $2, $3){
                                                return $1.replace("view", "aux-view") + $2 + ">" ;
                                            });
                                            ret.template = ret.template.replace(/(<\/[\s]*)(view>)/g, function(match, $1, $2, $3){
                                                return $1 + $2.replace("view", "aux-view");
                                            });
                                            // 处理text
                                            ret.template = ret.template.replace(/(<text)([^>]*)>/g, function(match, $1, $2, $3){
                                                return $1.replace("text", "aux-text") + $2 + ">" ;
                                            });
                                            ret.template = ret.template.replace(/(<\/[\s]*)(text>)/g, function(match, $1, $2, $3){
                                                return $1 + $2.replace("text", "aux-text");
                                            });

                                            let webapp = webtemplate(path.join(__dirname, "./template/wec.js"), result.css, ret.template, compilejs, ret.$is, "//@endweb");

                                            fse.outputFileSync(path.join(destroot, "/index.js"), webapp);
                                        });


                                        // fse.outputFileSync(path.join(destroot, "/index.wxss"), result.css);
                                    });

                            }
                        });


                        // diffchange(path.join(folder, "/index.json"), fs.readFileSync(path.join(folder, "/index.json")), otscache).then(function (isChange) {
                        //     if (isChange === 'change') {
                        //         fse.copySync(path.join(folder, "/index.json"), path.join(destroot, "/index.json"));
                        //     }
                        //     if (isChange === 'init') {
                        //         fse.copySync(path.join(folder, "/index.json"), path.join(destroot, "/index.json"));
                        //     }
                        // })
                    })

                }
            } catch (e) {

            }
        }
    }
}

if (projectconfig.config.target && projectconfig.config.target === "web") {
    watch(projectconfig.config.wxproot, { recursive: true }, handleWeb);
} else {
    watch(projectconfig.config.wxproot, { recursive: true }, handleVue);
}
