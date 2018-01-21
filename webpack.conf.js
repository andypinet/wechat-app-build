const path = require('path');

var isWin = /^win/.test(process.platform);

let config = {};
config.workspaceroot = path.join(__dirname, "src");
config.wxproot = path.join(config.workspaceroot);
if (isWin) {
    config.destroot =  path.join("C:\\Users\\lbc15\\projects\\wxapp\\test-painting");
} else {
    config.destroot =  path.join("/Users/andy/projects/painting");
}
config.jsWhiteList = [
];
config.cssWhiteList =[];

module.exports = {
    config: config,
    date: new Date(),
    webpackconfig: {
    }
};