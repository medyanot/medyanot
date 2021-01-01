// Define variables.
var autoprefixer = require('autoprefixer');
var browserSync  = require('browser-sync').create();
var gulpCached   = require('gulp-cached');
var debug        = require('gulp-debug');
var cleancss     = require('gulp-clean-css');
var concat       = require('gulp-concat');
var del          = require('del');
var gulp         = require('gulp');
var gutil        = require('gulp-util');
var imagemin     = require('gulp-imagemin');
var notify       = require('gulp-notify');
var postcss      = require('gulp-postcss');
var htmlmin      = require("gulp-htmlmin");
var prettyData   = require("gulp-pretty-data");
var rename       = require('gulp-rename');
var responsive   = require('gulp-responsive');
var run          = require('gulp-run');
var size         = require('gulp-size');
var sass         = require('gulp-sass');
var shell        = require('shelljs');
var uglify       = require('gulp-uglify');

// Include paths file.
var paths = require('./_assets/gulp_config/paths');

// HTML

gulp.task("build:html", function(done) {
  return gulp
    .src(paths.siteDir + paths.htmlPattern)
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: false,
        removeAttributeQuotes: false,
        removeRedundantAttributes: false,
        minifyJS: true,
        minifyCSS: true
      })
    )
    .pipe(size({ title: "optimized HTML" }))
    .pipe(gulp.dest(paths.siteDir));
    done();
});

// XML

gulp.task("build:xml", function(done) {
  return gulp
    .src(paths.siteDir + paths.xmlPattern)
    .pipe(
      prettyData({
        type: "minify",
        preserveComments: true
      })
    )
    .pipe(size({ title: "optimized XML" }))
    .pipe(gulp.dest(paths.siteDir));
    done();
});

// Styles

// Uses Sass compiler to process styles, adds vendor prefixes, minifies, then
// outputs file to the appropriate location.

gulp.task('build:styles:main', function(done) {
    return gulp.src([paths.sassFiles + '/main.scss'])
        // preprocess Sass
    .pipe(sass({ precision: 5, outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(postcss([ autoprefixer() ]))
        .pipe(cleancss({level: 2}))
        .pipe(size({ title: "CSS" }))
        .pipe(gulp.dest(paths.jekyllCssFiles))
        .pipe(gulp.dest(paths.siteCssFiles))
        .on('error', gutil.log);
    done();
});

gulp.task('build:styles:critical', function(done) {
    return gulp.src([paths.sassFiles + '/critical.scss'])
    .pipe(sass({ precision: 5, outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(cleancss({level: 2}))
        .pipe(size({ title: "Critical CSS" }))
        .pipe(gulp.dest('_includes'))
        .on('error', gutil.log);
    done();
});

// Builds all styles.
gulp.task('build:styles', gulp.parallel('build:styles:main', 'build:styles:critical'));

gulp.task('clean:styles', function(done) {
    del([paths.jekyllCssFiles + 'main.css',
        paths.siteCssFiles + 'main.css',
        '_includes/critical.css'
    ]);
    done();
});

// Concatenates and uglifies global JS files and outputs result to the
// appropriate location.
gulp.task('build:scripts', function(done) {
    return gulp.src([
        paths.jsFiles + '/lazysizes.js', paths.jsFiles + '/lazy-unveil.js', paths.jsFiles + '/subscription.js', paths.jsFiles + '/search.js'
    ])
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(size({ title: "Scripts" }))
        .pipe(gulp.dest(paths.jekyllJsFiles))
        .pipe(gulp.dest(paths.siteJsFiles))
        .on('error', gutil.log);
    done();
});

gulp.task('clean:scripts', function(done) {
    del([paths.jekyllJsFiles + 'main.js', paths.siteJsFiles + 'main.js']);
    done();
});

// IMAGES

gulp.task('build:images:inline', function(done) {
    return gulp.src(paths.imageFiles + paths.imagePattern)
    .pipe(gulpCached('build:images:inline'))
        .pipe(responsive({
      // resize all images
      '*.*': [{
        width: 1280,
      }]
    }, {
      // global configuration for all images
      errorOnEnlargement: false,
      withMetadata: false,
      quality: 75,
      progressive: true,
      errorOnUnusedConfig: false
    }))
        .pipe(size())
        .pipe(gulp.dest(paths.jekyllImageFiles))
        .pipe(gulp.dest(paths.siteImageFiles))
        .pipe(browserSync.stream());
    done();
});

gulp.task('build:images:nonjpg', function() {
  return gulp.src(paths.imageFiles + "/**/*.{png,gif,svg}")
  .pipe(gulpCached('build:images:nonjpg'))
  .pipe(
    imagemin(
      [
        imagemin.gifsicle({ interlaced: true }),
        imagemin.optipng(),
        imagemin.svgo({ plugins: [{ cleanupIDs: false }] })
      ],
      { verbose: true }
    )
  )
      .pipe(gulp.dest(paths.jekyllImageFiles))
      .pipe(gulp.dest(paths.siteImageFiles))
      .pipe(browserSync.stream());
} 
);

gulp.task('build:images:videos', function() {
    return gulp.src(paths.imageFiles + "/**/*.mp4")
    .pipe(gulpCached('build:images:videos'))
        .pipe(gulp.dest(paths.jekyllImageFiles))
        .pipe(gulp.dest(paths.siteImageFiles))
        .pipe(browserSync.stream());
  } 
);

gulp.task('build:images', gulp.series('build:images:inline', 'build:images:nonjpg', 'build:images:videos'));

gulp.task('clean:images', function(done) {
    del([paths.jekyllImageFiles, paths.siteImageFiles]);
    done();
});

// Runs jekyll build command.
gulp.task('build:jekyll', done => {
    shell.exec('bundle exec jekyll build --config _config.yml');
    done();});

// Runs jekyll build command using test config.
gulp.task('build:jekyll:test', done => {
    shell.exec('bundle exec jekyll build --config _config.yml,_config.test.yml');
    done();});

// Deletes the entire _site directory.
gulp.task('clean:jekyll', function(done) {
    del(['_site']);
    done();
});

gulp.task('clean', gulp.series('clean:jekyll',
    'clean:images',
    'clean:scripts',
    'clean:styles'));

// Builds site anew.

gulp.task('build', gulp.series('clean', gulp.parallel('build:scripts', 'build:styles'), 'build:images', 'build:jekyll', 'build:html', 'build:xml'));

// Builds site anew using test config.
gulp.task('build:test', gulp.series('clean', gulp.parallel('build:scripts', 'build:styles'), 'build:images', 'build:jekyll:test'));

// Default Task: builds site.
gulp.task('default', gulp.series('build'));

// Special tasks for building and then reloading BrowserSync.
gulp.task('build:jekyll:watch', gulp.parallel('build:jekyll:test'), function(done) {
    browserSync.reload();
    done();
});

gulp.task('build:scripts:watch', gulp.parallel('build:scripts'), function(done) {
    browserSync.reload();
    done();
});

gulp.task('build:styles:watch', gulp.parallel('build:styles'), function(done) {
    browserSync.reload();
    done();
});

// Static Server + watching files.
// Note: passing anything besides hard-coded literal paths with globs doesn't
// seem to work with gulp.watch().

function reload(done) {
  browserSync.reload();
  done();
}
gulp.task('serve', gulp.series('build:test', (done) => {

    browserSync.init({
        server: paths.siteDir,
        index: "/index.html",
        injectChanges: true,
        ghostMode: false,
        browser: "google chrome",
        port: 4000,
        ui: {
            port: 4001
        }
    });
    done();

    // Watch site settings.
    gulp.watch('_config.yml', gulp.series('build:jekyll:watch', reload));

    // Watch .scss files; changes are piped to browserSync.
    gulp.watch('_assets/styles/**/*.scss', gulp.series('build:styles', reload));
    
    gulp.watch('_assets/styles/scss/_over.scss', gulp.series('build:jekyll:test', reload));

    // Watch .js files.
    gulp.watch('_assets/js/**/*.js', gulp.series('build:scripts:watch', reload));
    
    
    // Watch img files.
    gulp.watch('_assets/img/**/*', gulp.series('build:images', reload));

    // Watch posts.
    gulp.watch(['_posts/**/*.+(md|markdown|MD)', '_pages/**/*.+(md|markdown|MD)', '_notlar/**/*.+(md|markdown|MD)'], gulp.series('build:jekyll:watch', reload));

    // Watch html and markdown files.
    gulp.watch(['**/*.+(html|md|markdown|MD)', '!_site/**/*.*'], gulp.series('build:jekyll:watch', reload));

    // Watch RSS feed XML files.
    gulp.watch('**.xml', gulp.series('build:jekyll:watch', reload));
}));

gulp.task('update:bundle', function(done) {
    return gulp.src('')
        .pipe(run('bundle install'))
        .pipe(run('bundle update'))
        .pipe(notify({ message: 'Bundle Update Complete' }))
        .on('error', gutil.log);
    done();
});