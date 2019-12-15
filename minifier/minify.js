var minify = require('@node-minify/core');
var uglifyes = require('@node-minify/uglify-es');

minify({
    compressor: uglifyes,
    input: './javascript/Behaviour/*.js',
    output: './public/js/behaviour.js'
}).catch((e) => {
    console.log("\x1b[31mFailed.\x1b[0m");
    console.log(e);
}).then(() => {
    console.log("\x1b[33mMinified Behaviour.\x1b[0m");
});

minify({
    compressor: uglifyes,
    input: './javascript/UI/*.js',
    output: './public/js/ui.js'
}).catch((e) => {
    console.log("\x1b[31mFailed.\x1b[0m");
    console.log(e);
}).then(() => {
    console.log("\x1b[33mMinified UI.\x1b[0m");
});