var minify = require('@node-minify/core');
var uglifyjs = require('@node-minify/uglify-es');

minify({
    compressor: uglifyjs,
    input: './javascript/Behaviour/*.js',
    output: './public/js/behaviour.js'
}).then(() => {
    console.log("Minified Behaviour.");
});

minify({
    compressor: uglifyjs,
    input: './javascript/UI/*.js',
    output: './public/js/ui.js'
}).catch((e) =>{
    console.log(e)
}).then(() => {
    console.log("Minified UI.");
});