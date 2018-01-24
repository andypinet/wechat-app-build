(function () {
    let css = `
@{css}
`;
    let template = `
@{template}
`;
    let js = {};
    (function (exports) {
    @{js}
    })(js);
    let $is = '@{is}';
    Component(defineComponent(Object.assign({
        $is,
        template: template
    }, js.default)));
    aui.dom.addStyle($is, css);
@{after}
})()