const spawn = require("child_process").spawn;
const gulp = require("gulp");
const maps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const css = require("gulp-css");
const path = require("path");
const livereload = require("gulp-livereload");
const plumber = require("gulp-plumber");
const sass = require("gulp-sass");
sass.compiler = require("node-sass");

/* Build */

gulp.task("sass", function() {
  return gulp
    .src("./sass/**/*.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest("build/"))
    .pipe(livereload());
});

gulp.task("build-css", async () => {
  return gulp
    .src("src/**/*.css")
    .pipe(css())
    .pipe(gulp.dest("build/"))
    .pipe(livereload());
});

gulp.task("build-js", async () => {
  return gulp
    .src(["src/*.js", "src/**/*.js", "utils/**/*.js", "main.js"])
    .pipe(plumber())
    .pipe(maps.init())
    .pipe(babel())
    .pipe(maps.write("."))
    .pipe(gulp.dest("build/"))
    .pipe(livereload());
});

gulp.task("build", gulp.series("sass", "build-css", "build-js"));

/* Copy */

gulp.task("copy-html", () => {
  return gulp.src("src/*.html").pipe(gulp.dest("build/"));
});

gulp.task("copy-assets", () => {
  return gulp.src("assets/**/*").pipe(gulp.dest("build/assets"));
});

gulp.task("copy", gulp.parallel("copy-html", "copy-assets"));

gulp.task("watch", function() {
  livereload.listen();
  gulp.watch("src/**/*.js", gulp.series("build"));
});

gulp.task("sass:watch", function() {
  gulp.watch("./sass/**/*.scss", ["sass"]);
});

/* Execute */

const cmd = name => path.join(".", "node_modules", ".bin", name);
const args = more => (Array.isArray(more) ? ["."].concat(more) : ["."]);
const exit = () => process.exit();

gulp.task(
  "start",
  gulp.parallel(
    gulp.series("copy", "build", async () => {
      console.log("all done!");
      spawn(cmd("electron"), args(), { stdio: "inherit", cwd: ".", shell: true }).on("close", exit);
    }),
    gulp.series("watch")
  )
);

gulp.task(
  "release",
  gulp.parallel(
    gulp.series("copy", "build", () => {
      spawn(cmd("electron-builder"), args(), { stdio: "inherit", cwd: ".", shell: true }).on("close", exit);
    }),
    gulp.series("watch")
  )
);

gulp.task(
  "test",
  gulp.series("copy", "build", () => {
    spawn(cmd("jest"), args(), { stdio: "inherit", cwd: ".", shell: true }).on("close", exit);
  })
);

gulp.task("default", gulp.parallel("watch"));
