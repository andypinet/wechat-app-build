const argv = require('yargs').argv
const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const fs = require('fs')
const fse = require('fs-extra')
const exec = require('child_process').exec
const vueParser = require('vue-parser')
const packageImporter = require('node-sass-package-importer')
const sass = require('node-sass')
const postcss = require('postcss')
const pretty = require('pretty')
const cssmodules = require('postcss-icss-selectors')
const v = require('voca')
const watch = require('node-watch')
const Cacheman = require('cacheman')
const projectconfig = require('./build.conf')

const csscache = new Cacheman('css')
const xmlcache = new Cacheman('xml')
const otscache = new Cacheman('ots')

// 检测两个文件之间变动
async function diffchange(key, data, cachestore) {
  let newval = data
  let cacval = await cachestore.get(key)
  let ret = 'init'
  // console.log(cacval);
  if (cacval) {
    let oldval = new Buffer(cacval.data)
    // console.log(newval);
    // console.log(oldval);
    if (oldval && oldval.equals && !oldval.equals(newval)) {
      ret = 'change'
    } else {
      ret = 'unchange'
    }
  }
  await cachestore.set(key, newval)
  return ret
}

const utils = {
  readFile: function(path) {
    try {
      return fs.readFileSync(path)
    } catch (e) {
      console.error(e)
    }
  },
  readJson(path) {
    if (!fs.existsSync(path)) {
      throw new Error('no json file')
    }
    return require(path)
  }
}

const TMPFOLDERNAME = 'tmp'

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

function compile(filepath, destpath, options = {}) {
  let cwd = `npx babel ${filepath} --out-file ${destpath} && browserify  ${destpath} -s NameOfModule --outfile ${
    options.bundle
  } `
  if (options.sourcemap) {
    cwd = cwd + ' --source-maps'
  }
  return new Promise(function(resolve, reject) {
    exec(cwd, function(err, stdout, stderr) {
      if (err) throw err
      resolve()
    })
  })
}

function attributeToWxAttribute(str) {
  return str
    .split('"')
    .map(function(a, index) {
      if (index === 1) {
        return a
          .split(';')
          .map(function(v) {
            return `{{${v}}}`
          })
          .join(' ')
      }
      return a
    })
    .join('"')
}

function handleArrayDirective(exp) {
  let attr = ''
  let arr = exp.split('in')
  if (arr && arr.length > 1) {
    let left = arr[0].trim()
    let right = arr[1].trim()
    let s = left.split(',')
    attr = attr + `wx:for="{{${right}}}"`
    if (s.length === 1) {
      attr = attr + ` wx:for-item="{{${s[0].trim()}}}"`
    }

    if (s.length === 2) {
      let f = s
        .join()
        .split('(')[1]
        .split(')')[0]
        .split(',')
      attr = attr + ` wx:for-item="{{${f[0].trim()}}}"`
      attr = attr + ` wx:for-index="{{${f[1].trim()}}}"`
    }
  }

  if (arr && arr.length === 1) {
    attr = attr + `wx:for="{{${exp.trim()}}}"`
  }
  return attr
}

function traux(template, isWx = true) {
  let ret = template.replace(
    /(<[\w-]+[\s]+)([v-\w:\s]+=[\s]*".+")([^>]*>)/g,
    function(match, $1, $2, $3) {
      let s = $2.replace(/(b:[\w]+=")([^"]+)(")/g, function(match, $1, $2, $3) {
        // 所有以b:开头的
        $2 = $2
          .split(';')
          .map(function(v) {
            if (v && v.trim().startsWith('{') && v.trim().endsWith('}')) {
              return `{${v.trim()}}`
            }
            return v
          })
          .join(' ')

        return $1.replace('b:', '') + $2 + $3
      })

      s = s.replace(/(v-[\w]+=")([^"]+)(")/g, function(
        match,
        $2_1,
        $2_2,
        $2_3
      ) {
        // 所有以v-开头的
        if ($2_1.indexOf('v-for') > -1) {
          // 处理for循环
          // console.log(handleArrayDirective($2_2));
          $2_2 = handleArrayDirective($2_2)
          return $2_2
        }

        if ($2_1.indexOf('v-if') > -1) {
          return `wx:if="{{${$2_2}}}"`
        }

        return ''
      })

      s = s.replace(/(:key\s*=\s*")([^"]+)(")/g, function(
        match,
        $k_1,
        $k_2,
        $k_3
      ) {
        return $k_1.replace(':key', 'wx:key') + $k_2 + $k_3
      })

      s = s.replace(/(@on:[\w]+=")([^"]+)(")/g, function(
        match,
        $2_1,
        $2_2,
        $2_3
      ) {
        // 所有以@:开头的
        return $2_1.replace('@on:', 'bind:') + $2_2 + $2_3
      })

      return $1 + s + $3
    }
  )
  return pretty(ret)
}

let wxptemplate = function(tpl, js, after = '') {
  return tpl.replace('@{js}', js).replace('@{after}', after)
}

function handleVue(evt, filepath) {
  let paths = filepath.split(path.sep)
  let filename = paths[paths.length - 1]
  let folder = paths
    .filter(function(v, index) {
      if (index === paths.length - 1) {
        return false
      }
      return true
    })
    .join(path.sep)
  if (filepath.indexOf('___jb_') < 0) {
    if (filename.endsWith('.vue')) {
      let comfolder = paths.slice(0, paths.length - 1).join(path.sep)
      let jsonPath = path.join(comfolder, 'index.json')
      try {
        let componentJson = utils.readJson(jsonPath)
        let destfolder = folder.replace(projectconfig.config.workspaceroot, '')
        let packagename = paths[paths.length - 2]
        let tmpfolder = paths
          .slice(paths.length - 3, paths.length - 1)
          .join(path.sep)
        try {
          let filecontent = utils.readFile(filepath).toString()
          let destroot = path.join(projectconfig.config.destroot, destfolder)
          if (filecontent) {
            console.log(chalk.cyan('build package ' + filepath))

            filecontent = filecontent.replace('<script>', '<script lang="js">')

            let myScriptContents = vueParser.parse(filecontent, 'script', {
              lang: ['js']
            })

            myScriptContents = myScriptContents.replace(
              /require\([\w-\s.\/'"]+\)/g,
              function(match) {
                return match.replace('require', 'WXREQUIRE')
              }
            )

            let tmppath = path.join(
              folder,
              `../../../${TMPFOLDERNAME}/${tmpfolder}/index.js`
            )
            let tmpcompilepath = path.join(
              folder,
              `../../../${TMPFOLDERNAME}/${tmpfolder}/index.compile.js`
            )
            let tmpbundlepath = path.join(
              folder,
              `../../../${TMPFOLDERNAME}/${tmpfolder}/index.bundle.js`
            )
            let tmpminpath = path.join(
              folder,
              `../../../${TMPFOLDERNAME}/${tmpfolder}/index.min.js`
            )
            let destscriptpath = path.join(
              projectconfig.config.destroot,
              `/${tmpfolder}/index.js`
            )
            let mainjspath = path.join(
              projectconfig.config.destroot,
              `/${tmpfolder}/main.js`
            )

            // 确保目录存在
            fse.ensureDirSync(destroot)

            myScriptContents = myScriptContents
              .replace(/^\/\/\stslint:disable[\w\s\n\/]* tslint:enable/g, '')
              .trim()

            fse.outputFileSync(tmppath, myScriptContents)

            let filebasename = filename.replace(/.vue$/, '')

            // 先确保有文件
            fse.ensureFileSync(
              path.join(projectconfig.config.destroot, `/${tmpfolder}/index.js`)
            )

            let scoped
            css = {}

            let ret = {}
            ret.$is = paths[paths.length - 2]

            let constants = {
              '%=IS%': ret.$is
            }

            compile(tmppath, tmpcompilepath, {
              bundle: tmpbundlepath
            })
              .then(function() {
                // fse.copySync(tmpcompilepath, destscriptpath);

                let compilejs = fs.readFileSync(tmpbundlepath).toString()

                compilejs = compilejs.replace(
                  /WXREQUIRE\([\w-\s.\/'"]+\)/g,
                  function(match) {
                    return match.replace('WXREQUIRE', 'require')
                  }
                )

                if (componentJson.component) {
                  const temlpateModule = require(path.join(
                    __dirname,
                    './template/wxc.js'
                  ))

                  let wxp = wxptemplate(
                    temlpateModule.tpl,
                    `require('./main.js')`,
                    '//@end'
                  )
                  fse.outputFileSync(destscriptpath, wxp)
                  fse.outputFileSync(
                    mainjspath,
                    `${temlpateModule.bef}${compilejs}`
                  )
                } else {
                  const temlpateModule = require(path.join(
                    __dirname,
                    './template/wxp.js'
                  ))

                  let wxp = wxptemplate(
                    temlpateModule.tpl,
                    `require('./main.js')`,
                    '//@end'
                  )
                  fse.outputFileSync(destscriptpath, wxp)
                  fse.outputFileSync(
                    mainjspath,
                    `${temlpateModule.bef}${compilejs}`
                  )
                }

                scopedcss = {}

                let myStyleContents = vueParser
                  .parse(filecontent, 'style', { lang: ['scss'] })
                  .replace('tslint:enable', '')
                  .replace('tslint:disable', '')
                  .trim()

                myStyleContents =
                  `
                    $IS: ${ret.$is};
                ` + myStyleContents

                diffchange(
                  path.join(folder, '/index.wxss'),
                  Buffer.from(myStyleContents),
                  xmlcache
                ).then(function(isChange) {
                  if (isChange !== 'unchange') {
                    const compiledStyle = sass.renderSync({
                      data: myStyleContents,
                      importer: packageImporter({}),
                      includePaths: [folder],
                      functions: {}
                    })

                    let exportcss = /(:export[\s]*{)([^}]*)(})/g

                    let isscoped = false
                    if (/<style.*scoped>/g.test(filecontent)) {
                      isscoped = true
                    } else {
                    }

                    let postcssmodules = []

                    if (isscoped) {
                      postcssmodules.push(cssmodules({}))
                    }

                    postcss(postcssmodules)
                      .process(compiledStyle.css, { map: false })
                      .then(result => {
                        if (isscoped) {
                          result.css.replace(exportcss, function(
                            match,
                            $1,
                            $2,
                            $3
                          ) {
                            $2.trim()
                              .split(';')
                              .forEach(function(v) {
                                let s = v.trim().split(':')
                                if (s.length > 1) {
                                  scopedcss[s[0].trim()] = s[1].trim()
                                }
                              })
                          })

                          result.css = result.css.replace(exportcss, '')
                        }

                        let myTemplateContents = vueParser
                          .parse(filecontent, 'template', {})
                          .replace('//////////', '')
                          .trim()

                        myTemplateContents = v.tr(myTemplateContents, constants)

                        myTemplateContents = traux(myTemplateContents)

                        diffchange(
                          path.join(folder, '/index.wxml'),
                          Buffer.from(myTemplateContents),
                          xmlcache
                        ).then(function(isChange) {
                          if (isChange === 'change') {
                          }

                          if (isscoped) {
                            for (let key in scopedcss) {
                              myTemplateContents = myTemplateContents.replace(
                                new RegExp(`class="${key}`, 'g'),
                                'class="' + scopedcss[key]
                              )
                            }
                          }

                          // 处理div
                          myTemplateContents = myTemplateContents.replace(/(<\s*\/?\s*)div(\s*([^>]*)?\s*>)/g, '$1view$2')

                          fse.outputFileSync(
                            path.join(destroot, '/index.wxml'),
                            myTemplateContents
                          )
                        })

                        fse.outputFileSync(
                          path.join(destroot, '/index.wxss'),
                          result.css
                        )
                      })
                  }
                })
              })
              .catch(e => {
                console.error(e)
              })
          }
        } catch (e) {
          console.error(e)
        }
        // end readJson
      } catch(e) {
        console.error(`readJson failed`, e)
      }
    }
  }
}

function compileVue(folderName) {
  let dir = path.join(`${projectconfig.config.workspaceroot}`, folderName)
  let componentsPaths = fs.readdirSync(dir)
  for (let componentPath of componentsPaths) {
    handleVue({}, path.join(dir, componentPath, 'index.vue'))
  }
}

function compileUtils(fileName = 'index') {
  let srcfolder = path.join(projectconfig.config.workspaceroot, 'utils/compile')
  let destFolder = path.join(projectconfig.config.destroot, 'utils/compile')
  let tmpFolder = path.join(projectconfig.config.tmproot, 'utils/compile')

  fse.ensureDirSync(destFolder)
  fse.ensureDirSync(tmpFolder)

  let fileContent = utils.readFile(path.join(srcfolder, 'index.js')).toString()
  fileContent = fileContent.replace(/require\([\w-\s.\/'"]+\)/g, function(
    match
  ) {
    return match.replace('require', 'WXREQUIRE')
  })

  fse.outputFileSync(path.join(tmpFolder, `${fileName}.js`), fileContent)

  compile(
    path.join(tmpFolder, `${fileName}.js`),
    path.join(tmpFolder, `${fileName}.compile.js`),
    {
      bundle: path.join(tmpFolder, `${fileName}.bundle.js`)
    }
  ).then(function() {
    let compilejs = utils
      .readFile(path.join(tmpFolder, `${fileName}.bundle.js`))
      .toString()
    compilejs = compilejs.replace(/WXREQUIRE\([\w-\s.\/'"]+\)/g, function(
      match
    ) {
      return match.replace('WXREQUIRE', 'require')
    })

    compilejs = `
    const regeneratorRuntime = require('../../static/runtime.js');

    ${compilejs}
    `

    fse.outputFileSync(path.join(destFolder, `${fileName}.js`), compilejs)
  })
}

compileVue('components')
compileVue('pages')
compileUtils('index')

const spinner = ora('building for production... ')
spinner.start()

if (argv.watch) {
  watch(projectconfig.config.wxproot, { recursive: true }, handleVue)
} else {
  spinner.stop()
}

