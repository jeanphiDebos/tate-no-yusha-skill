var Encore = require('@symfony/webpack-encore');

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/test/tate-no-yusha-skill/public/build')
    .setManifestKeyPrefix('build')
    .cleanupOutputBeforeBuild()
    .addEntry('js/app', './assets/js/app.js')
    .addStyleEntry('css/app', './assets/css/app.scss')
    .enableSassLoader(function (sassOptions) {
        // https://github.com/sass/node-sass#options
        // options.includePaths = [...]
    })
    .autoProvidejQuery()
    .autoProvideVariables({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
    })
    // .splitEntryChunks()
    // .enableSingleRuntimeChunk()
    // .enableBuildNotifications()
    // .configureBabel(() => {}, {
    //     useBuiltIns: 'usage',
    //     corejs: 3
    // })
    .enableVersioning(Encore.isProduction())
    .enableSourceMaps(!Encore.isProduction())
;

module.exports = Encore.getWebpackConfig();
