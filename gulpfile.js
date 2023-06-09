const log = require('signale');
const path = require('path');
const fs = require('fs');
const gulp = require('gulp');
const concat = require('gulp-concat');
const webpack = require('gulp-webpack');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const imagemin = require('gulp-imagemin');
const svgsprite = require('gulp-svg-sprite');
const rename = require('gulp-rename');
const buffer = require('vinyl-buffer');
const svgmin = require('gulp-svgmin');
const sherpa = require('style-sherpa');
const autoprefixer = require('gulp-autoprefixer');
const modernizr = require('modernizr');
const argv = require('yargs').argv;

// Multi cartridge support
let settings;
log.info(`Compiling ${argv.cartridge}.`);
settings = require(`./cartridges/${argv.cartridge}/cartridge/client/gulp.config.json`);

gulp.task('scripts', done => {
    let entries = {};
    if (typeof settings.paths.source.scripts === 'string') {
        entries[ path.basename(settings.paths.source.scripts).slice(0, -path.extname(settings.paths.source.scripts).length) ] = path.resolve(settings.paths.source.scripts);
    } else {
        settings.paths.source.scripts.forEach(scr => {
            entries[ path.basename(scr).slice(0, -path.extname(scr).length) ] = path.resolve(scr);
        });
    }

    // If in active development do not Uglify, otherwise do
    if (process.argv.indexOf('--skipWatch') === -1) {
        return gulp.src(settings.paths.source.scripts)
            .pipe(webpack({
                entry: entries,
                output: {
                    filename: '[name].min.js'
                },
                devtool: 'source-map',
                resolve: {
                    root: path.resolve('./assets/scripts')
                },
                module: {
                    loaders: [{
                        test: /\.js$/,
                        loader: 'babel',
                        query: {
                            presets: ['es2015', 'stage-2']
                        }
                    }]
                },
                target: 'web'
            }))
            .pipe(gulp.dest(settings.paths.destination.scripts));
    } else {
        return gulp.src(settings.paths.source.scripts)
            .pipe(webpack({
                entry: entries,
                output: {
                    filename: '[name].min.js'
                },
                devtool: 'source-map',
                resolve: {
                    root: path.resolve('./assets/scripts')
                },
                module: {
                    loaders: [{
                        test: /\.js$/,
                        loader: 'babel',
                        query: {
                            presets: ['es2015', 'stage-2']
                        }
                    }]
                },
                plugins: [
                    new UglifyJSPlugin({
                        sourceMap: true
                    })
                ],
                target: 'web'
            }))
            .pipe(gulp.dest(settings.paths.destination.scripts));
    }
});

gulp.task('sass', done => {
    return gulp.src(settings.paths.source.styles)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['node_modules', 'node_modules/slick-carousel', 'node_modules/flag-icon-css/sass'],
            outputStyle: 'compressed'
        })).on('error', sass.logError)
        .pipe(autoprefixer({
            remove: false,
            browsers: [
                'last 7 versions',
                'ie >= 9',
                'Android >= 2.3'
            ],
            flexbox: 'no-2009',
            grid: false
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(settings.paths.destination.styles));
});

let images = [];
gulp.task('images', done => {
    let imagesDest = settings.paths.destination.images;
    gulp.src(images.length ? images : settings.paths.source.images)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest(imagesDest));
});

gulp.task('icons', done => {
    return gulp.src(settings.paths.source.icons)
        .pipe(buffer())
        .pipe(rename(opt => {
            opt.basename = opt.basename.replace(new RegExp('_', 'g'), '-');
            return opt;
        }))
        .pipe(svgmin({plugins: [
            { removeTitle: true }
        ]}))
        .pipe(svgsprite({
            mode: {
                symbol: {
                    render: {
                        css: false,
                        scss: false
                    },
                    dest: './',
                    prefix: '.svg--%s',
                    sprite: 'sprite.svg',
                    example: true
                }
            }
        }))
        .pipe(gulp.dest(settings.paths.destination.iconsdest));
});

gulp.task('vendor', () => {
    return gulp.src(settings.paths.source.vendor)
        .pipe(concat('vendor.min.js'))
        .pipe(gulp.dest(settings.paths.destination.scripts))
        .on('finish', () => {
            settings.paths.source.vendorCopy.forEach(lib => {
                if (typeof lib === 'object') {
                    const bundleName = lib.pop();
                    gulp.src(lib).pipe(concat(`${bundleName}.min.js`))
                        .pipe(gulp.dest(settings.paths.destination.scripts));
                } else {
                    gulp.src(lib)
                        .pipe(gulp.dest(settings.paths.destination.scripts));
                }
            });
        });
});

gulp.task('modernizr', (done) => {
    modernizr.build(settings.modernizr, function (code) {
        fs.writeFile(`${settings.paths.destination.vendor}/modernizr/modernizr.min.js`, code, done);
    });
});

// generates a UIKIT
gulp.task('uikit', () => {
    settings.paths.source.uikit.forEach(kitPath => {
        const uikit = path.basename(kitPath);
        const uikitPath = path.dirname(kitPath);

        sherpa(`${uikitPath}/${uikit}.md`, {
            output: `${settings.paths.destination.uikit}/${uikit}.isml`,
            template: `${uikitPath}/template-${uikit}.hbs`
        }, () => {
            fs.readFile(`${settings.paths.destination.uikit}/${uikit}.isml`, 'utf8', (err, data) => {
                if (err) {
                    return console.log(err);
                }
                // eslint-disable-next-line no-template-curly-in-string
                var result = data.replace(/href="#"/g, "${'#'}");

                fs.writeFile(`${settings.paths.destination.uikit}/${uikit}.isml`, result, 'utf8', err => {
                    if (err) return log.fatal(err);
                });
            });

            log.success(`UIKit Styleguide updated: ${uikit}`);
        });
    });
});


if (process.argv.indexOf('--skipWatch') === -1) {
    gulp.task('default', () => {
        console.log('\x1Bc');
        log.success('Gulp started');

        let tasks = [];
        let tasksDebounce = null;
        let watchFolder;
        if (argv.cartridge) {
            watchFolder = `./cartridges/${argv.cartridge}/cartridge/client/default/**`;
            log.await(`Listening for file changes in ${argv.cartridge}...`);
        } else {
            watchFolder = 'assets/**';
            log.await(`Listening for file changes in ${watchFolder}...`);
        }

        gulp.watch(watchFolder, { ignoreInitial: true }).on('all', (event, location) => {
            if (event === 'addDir' || path.basename(location) === '.DS_Store') return;

            tasksRunning = true;
            const ext = path.extname(location);

            if (['.jpg', '.png', '.gif'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('images') === -1) {
                if (event === 'unlink') {
                    // delete image from the dist folder
                    const delImgPath = settings.paths.destination.images + location.replace(settings.paths.source.images, '');
                    if (fs.existsSync(delImgPath)) fs.unlinkSync(delImgPath);
                } else {
                    images.push(location);
                    tasks.push('images');
                }
            }

            if (['.svg'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('icons') === -1) {
                tasks.push('icons');
            } else if (['.scss'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('sass') === -1) {
                tasks.push('sass');
            } else if (['.js'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('scripts') === -1) {
                tasks.push('scripts');
            }

            // else if (['.md'].indexOf(ext.toLowerCase()) > -1 && tasks.indexOf('uikit') === -1) {
            //     tasks.push('uikit');
            // }

            if (tasksDebounce) {
                clearTimeout(tasksDebounce);
                tasksDebounce = null;
            }

            if (tasks.length) {
                console.log('\x1Bc');
                tasksDebounce = setTimeout(() => {
                    gulp.task('run', gulp.series(...tasks, () => {
                        tasks = [];
                        images = [];
                        tasksRunning = false;
                    }));

                    gulp.task('run')(error => {
                        log.fatal('There was an error while running the queued tasks', error);
                        tasksRunning = false;
                    });
                }, 500);
            }
        });
    });
}
