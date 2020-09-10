'use strict';
const gulp = require('gulp');


// SERVICES
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');

// BLOG
const GhostContentAPI = require('@tryghost/content-api');
const api = new GhostContentAPI({
  url: 'https://georgetokmakov.ghost.io',
  key: 'bb27b3397d940f48695ea2e978',
  version: "v3"
});
const fs = require('fs');
const streamArray = require('stream-array');
const File = require('vinyl');

// HTML
const pug = require('gulp-pug');

// scripts
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const resolveNodeModules = require('rollup-plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const concat = require('gulp-concat');
const terser = require('gulp-terser');

// styles
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const cleanCSS = require('gulp-csso');

// images
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const cheerio = require('gulp-cheerio');

// server
const server = require('browser-sync').create();

// config
const SOURCE_PATH = 'src/';
const BUILD_PATH = 'build/';
const Paths = {
  styles: {
    src: `${SOURCE_PATH}sass/**/*.scss`,
    dest: `${BUILD_PATH}css/`,
    inputFile: `${SOURCE_PATH}sass/style.scss`,
    minifyFileName: 'style.min.css',
  },
  scripts: {
    src: `${SOURCE_PATH}js/**/*.js`,
    modules: `${SOURCE_PATH}js/modules/*.js`,
    dest: `${BUILD_PATH}js/`,
    inputFile: `${SOURCE_PATH}js/index.js`,
    outputFileName: 'index.min.js',
    vendor: {
      src: `${SOURCE_PATH}js/vendor/**/*.js`,
      outputFileName: 'vendor.min.js',
    },
  },
  html: {
    src: `${SOURCE_PATH}pug/pages/*.pug`,
    srcWatch: `${SOURCE_PATH}pug/**/*.pug`,
    dest: BUILD_PATH,
    en: `${BUILD_PATH}/en`,
    ru: `${BUILD_PATH}/ru`,
  },
  images: {
    src: `${SOURCE_PATH}img/**/*.{png,jpg,svg,gif}`,
    spriteSrc: `${SOURCE_PATH}/img/svg-sprite/*.svg`,
    webpSrc: `${SOURCE_PATH}img/**/*.{png,jpg}`,
    dest: `${BUILD_PATH}img/`,
    spriteFileName: 'sprite.svg',
  },
  fonts: {
    src: `${SOURCE_PATH}fonts/**/*.{woff,woff2}`,
    output: `${BUILD_PATH}fonts/`,
  },
  favicons: {
    src: `${SOURCE_PATH}favicons/*.{png,ico}`,
    output: `${BUILD_PATH}favicons/`,
  },
  manifest: {
    src: `${SOURCE_PATH}*.webmanifest`,
    output: BUILD_PATH,
  },
  blog: {
    src: `${SOURCE_PATH}pug/pages/blog.pug`,
    output: `${BUILD_PATH}`,
    ru: `${BUILD_PATH}/ru/blog/`,
    en: `${BUILD_PATH}/en/blog/`,
  },
  post: {
    src: `${SOURCE_PATH}pug/pages/post.pug`,
    ru: `${BUILD_PATH}/ru/blog/`,
    en: `${BUILD_PATH}/en/blog/`,
  },
  index: {
    src: `${SOURCE_PATH}pug/pages/index.pug`,
  },
  home: {
    src: `${SOURCE_PATH}pug/pages/main.pug`,
  },
};

// methods
function removeProp(obj, propToDelete, propToFlatten) {
  for (let property in obj) {
    if (typeof obj[property] == "object") {
      if (obj[property][propToFlatten]) {
        obj[property] = obj[property][propToFlatten];
      }
      delete obj.property;

      obj[property] = removeProp(obj[property], propToDelete, propToFlatten);
    } else {
      if (property === propToDelete) {
        delete obj[property];
      }

    }
  }
  return obj;
}

const pathBuilder = (path) => {
  if (path.basename !== 'index') {
    path.dirname = path.basename.split('_').join('/');
    path.basename = 'index';
  }
};
const requireJSON = (file) =>
  JSON.parse(fs.readFileSync(file));


/*
 * TASKS
 */
gulp.task('json', async function () {
  const posts = await api.posts.browse({
    include: "tags,authors",
    limit: "all"
  }).catch(err => {
    console.error(err);
  });
  const file = new File({
    path: `posts.json`,
    contents: Buffer.from(JSON.stringify(posts))
  });
  // noinspection JSUnresolvedFunction
  return streamArray([file]).pipe(gulp.dest(`${SOURCE_PATH}json/`));
});

gulp.task('posts:ru', async function () {
  const i18n = requireJSON(`${SOURCE_PATH}/json/i18n.json`);
  let i18nRu = removeProp(i18n, "en", "ru");
  const posts = await api.posts.browse({
    include: "tags,authors",
    limit: "all",
    filter: "tags.name:#ru"
  }).catch(err => {
    console.error(err);
  }).then((posts) => {
    posts.forEach((post) => {
      const {slug} = post;
      return gulp
        .src(Paths.post.src)
        .pipe(plumber())
        .pipe(pug({
            pretty: true,
            data: {
              lang: "ru",
              post: post,
              t: i18nRu,
              isPost: true
            }
          })
        )
        .pipe(rename(`index.html`))
        .pipe(gulp.dest(`${BUILD_PATH}/ru/blog/${slug}/`));
    });
  });
});

gulp.task('posts:en', async function () {
  const i18n = requireJSON(`${SOURCE_PATH}/json/i18n.json`);
  let i18nEn = removeProp(i18n, "ru", "en");
  const posts = await api.posts.browse({
    include: "tags,authors",
    limit: "all",
    filter: "tags.name:#en"
  }).catch(err => {
    console.error(err);
  }).then((posts) => {
    posts.forEach((post) => {
      const {slug} = post;
      return gulp
        .src(Paths.post.src)
        .pipe(plumber())
        .pipe(pug({
            pretty: true,
            data: {
              lang: "en",
              post: post,
              t: i18nEn,
              isPost: true
            }
          })
        )
        .pipe(rename(`index.html`))
        .pipe(gulp.dest(`${BUILD_PATH}/en/blog/${slug}/`));
    });
  });
});

gulp.task('blog:ru', async function () {
  const i18n = requireJSON(`${SOURCE_PATH}/json/i18n.json`);
  let i18nRu = removeProp(i18n, "en", "ru");
  const posts = await api.posts.browse({
    include: "tags,authors",
    order: "published_at DESC",
    limit: "all",
    filter: "tags.name:#ru",
  }).catch(err => {
    console.error(err);
  }).then((posts) => {
    return gulp
      .src(`${SOURCE_PATH}pug/pages/blog.pug`)
      .pipe(plumber())
      .pipe(pug({
          pretty: true,
          data: {
            "lang": "ru",
            posts: posts,
            t: i18nRu
          }
        })
      )
      .pipe(rename(`index.html`))
      .pipe(gulp.dest(Paths.blog.ru));
  });
});

gulp.task('blog:en', async function () {
  const i18n = requireJSON(`${SOURCE_PATH}/json/i18n.json`);
  let i18nEn = removeProp(i18n, "ru", "en");
  const posts = await api.posts.browse({
    include: "tags,authors",
    limit: "all",
    filter: "tags.name:#en",
    order: "published_at DESC"
  }).catch(err => {
    console.error(err);
  }).then((posts) => {
    return gulp
      .src(Paths.blog.src)
      .pipe(plumber())
      .pipe(pug({
          pretty: true,
          data: {
            "lang": "en",
            posts: posts,
            t: i18nEn
          }
        })
      )
      .pipe(rename(`index.html`))
      .pipe(gulp.dest(Paths.blog.en));
  });

});

gulp.task('images:minify', function () {
  return gulp
    .src([Paths.images.src, `!${Paths.images.spriteSrc}`])
    .pipe(
      imagemin([
        imagemin.optipng({
          optimizationLevel: 6,
        }),
        imageminMozjpeg({
          quality: 70,
        }),
        imagemin.svgo(),
      ])
    )
    .pipe(gulp.dest(Paths.images.dest));
});

gulp.task('images:webp', function () {
  return gulp
    .src(Paths.images.webpSrc)
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(gulp.dest(Paths.images.dest));
});

gulp.task('images:svg-sprite', function () {
  return gulp
    .src(Paths.images.spriteSrc)
    .pipe(
      imagemin([
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
            },
            {
              removeRasterImages: true,
            },
            {
              convertPathData: false,
            },
            {
              removeUselessStrokeAndFill: false
            }
          ],
        }),
      ])
    )
    .pipe(
      cheerio({
        parserOptions: {
          xmlMode: true,
        },
      })
    )
    .pipe(
      svgstore({
        inlineSvg: false,
      })
    )
    .pipe(rename(Paths.images.spriteFileName))
    .pipe(gulp.dest(Paths.images.dest));
});

gulp.task('index:redirect', function () {
  return gulp
    .src([
      'src/pug/pages/index.pug'
    ])
    .pipe(plumber())
    .pipe(pug({
        pretty: true,
        data: {}
      })
    )
    .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('index:404', function () {
  return gulp
    .src([
      'src/pug/pages/index404.pug',
    ])
    .pipe(plumber())
    .pipe(pug({
        pretty: true,
        data: {}
      })
    )
    .pipe(rename('404.html'))
    .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('home:ru', function () {
  const i18n = requireJSON(`${SOURCE_PATH}/json/i18n.json`);
  let i18nRu = removeProp(i18n, "en", "ru");
  return gulp
    .src([
      'src/pug/pages/main.pug'
    ])
    .pipe(plumber())
    .pipe(pug({
        pretty: true,
        data: {
          "lang": "ru",
          t: i18nRu,
          isHome: true
        }
      })
    )
    .pipe(rename('index.html'))
    .pipe(gulp.dest(`${BUILD_PATH}/ru`));
});

gulp.task('home:en', function () {
  const i18n = requireJSON(`${SOURCE_PATH}/json/i18n.json`);
  let i18nEn = removeProp(i18n, "ru", "en");
  return gulp
    .src([
      'src/pug/pages/main.pug'
    ])
    .pipe(plumber())
    .pipe(pug({
        pretty: true,
        data: {
          "lang": "en",
          t: i18nEn,
          isHome: true
        }
      })
    )
    .pipe(rename('index.html'))
    .pipe(gulp.dest(`${BUILD_PATH}/en`));
});

gulp.task('html:ru', function () {
  const i18n = requireJSON(`${SOURCE_PATH}/json/i18n.json`);
  let i18nRu = removeProp(i18n, "en", "ru");
  return gulp
    .src([
      'src/pug/pages/*.pug',
      '!src/pug/pages/post.pug',
      '!src/pug/pages/blog.pug',
      '!src/pug/pages/main.pug',
      '!src/pug/pages/index.pug',
      '!src/pug/pages/index404.pug',
    ])
    .pipe(plumber())
    .pipe(pug({
        pretty: true,
        data: {
          "lang": "ru",
          t: i18nRu
        }
      })
    )
    .pipe(rename((path) => {
      pathBuilder(path);
    }))
    .pipe(gulp.dest(Paths.html.ru));
});

gulp.task('html:en', function () {
  const i18n = requireJSON(`${SOURCE_PATH}/json/i18n.json`);
  let i18nEn = removeProp(i18n, "ru", "en");
  return gulp
    .src([
      'src/pug/pages/*.pug',
      '!src/pug/pages/post.pug',
      '!src/pug/pages/blog.pug',
      '!src/pug/pages/main.pug',
      '!src/pug/pages/index.pug',
      '!src/pug/pages/index404.pug',
      '!src/pug/pages/public.pug'
    ])
    .pipe(plumber())
    .pipe(pug({
        pretty: true,
        data: {
          "lang": "en",
          t: i18nEn
        }
      })
    )
    .pipe(rename((path) => {
      pathBuilder(path);
    }))
    .pipe(gulp.dest(Paths.html.en));
});

gulp.task('js:module', function () {
  return gulp
    .src([Paths.scripts.inputFile])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      rollup(
        {
          plugins: [
            babel({exclude: 'node_modules/**'}),
            replace({
              'process.env.NODE_ENV': JSON.stringify('production'),
            }),
            resolveNodeModules(),
            commonjs(),
          ],
        },
        'iife'
      )
    )
    .pipe(rename(Paths.scripts.outputFileName))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(Paths.scripts.dest));
});

gulp.task('js:vendor', function () {
  return gulp
    .src(Paths.scripts.vendor.src)
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(concat(Paths.scripts.vendor.outputFileName))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(Paths.scripts.dest));
});

gulp.task('css', function () {
  return gulp
    .src(Paths.styles.inputFile)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(
      sass({
        includePaths: ['node_modules'],
      })
    )
    .pipe(
      postcss([
        require('autoprefixer')({
          flexbox: 'no-2009',
          grid: false,
          browsers: ['last 2 versions', "Firefox ESR"],
        }),
        require('postcss-smoothscroll-anchor-polyfill'),
      ])
    )
    .pipe(cleanCSS())
    .pipe(rename(Paths.styles.minifyFileName))
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest(Paths.styles.dest))
    .pipe(server.stream());
});

gulp.task('server', function () {
  server.init({
    server: BUILD_PATH,
    notify: false,
    open: false,
    cors: true,
    ui: false,
    host: "0.0.0.0",
    ghostMode: false
  }, (err, bs) => {
    bs.addMiddleware("*", (req, res) => {
      res.write(fs.readFileSync('build/404.html'));
      res.end();
    });
  });
  gulp.watch(`${SOURCE_PATH}sass/**/*.scss`, gulp.series('css'));
  gulp.watch(`${SOURCE_PATH}pug/**/*.pug`, gulp.series('main', 'refresh'));
  gulp.watch(`${SOURCE_PATH}img/**/*.{png,jpg,gif,svg}`, gulp.series('graphic', 'refresh'));
  gulp.watch([
    `${SOURCE_PATH}docs/*.*`,
    `${SOURCE_PATH}video/*.*`,
    `${SOURCE_PATH}robots.txt`,
    `${SOURCE_PATH}sitemap.xml`,
    `${SOURCE_PATH}sw.js`,
    `${SOURCE_PATH}fonts/**/*.{woff,woff2}`,
  ], gulp.series('copy', 'refresh'));
  gulp.watch([
    `${SOURCE_PATH}pug/pages/blog.pug`,
    `${SOURCE_PATH}pug/pages/post.pug`
  ], gulp.series('blog', 'refresh'));
  gulp.watch(`${SOURCE_PATH}js/**/*.js`, gulp.series('js', 'refresh'));
});

gulp.task('refresh', function (done) {
  server.reload();
  done();
});

gulp.task('clean', function () {
  return del(`build/**`, {force: true});
});

gulp.task('copy:fonts', function () {
  return gulp.src(Paths.fonts.src).pipe(gulp.dest(Paths.fonts.output));
});

gulp.task('copy:docs', function () {
  return gulp
    .src('src/docs/*.*').pipe(gulp.dest('build/docs/'));
});

gulp.task('copy:videos', function () {
  return gulp
    .src('src/video/*.*').pipe(gulp.dest('build/video/'));
});

gulp.task('copy:meta', function () {
  return gulp
    .src(['src/robots.txt', 'src/sitemap.xml', 'src/sw.js']).pipe(gulp.dest('build/'));
});

gulp.task('graphic', gulp.series('images:webp', 'images:svg-sprite'));
gulp.task('js', gulp.series('js:module', 'js:vendor'));
gulp.task('html', gulp.series('html:ru', 'html:en'));
gulp.task('home', gulp.series('home:ru', 'home:en'));
gulp.task('index', gulp.series('index:redirect', 'index:404'));
gulp.task('copy', gulp.series('copy:fonts', 'copy:docs', 'copy:videos', 'copy:meta'));
gulp.task('blog', gulp.series('blog:ru', 'blog:en', 'posts:ru', 'posts:en', 'json'));

gulp.task('minify', gulp.series('images:minify'));
gulp.task('files', gulp.series('graphic', 'copy'));
gulp.task('main', gulp.series('index', 'html', 'home'));
gulp.task('start', gulp.series('server'));
gulp.task('build', gulp.series('clean', 'blog', 'files', 'minify', 'css', 'js', 'main'));
