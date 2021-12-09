import gulp from "gulp"
import pump from "pump"
import phpinc from "php-include-html"
import fs from 'fs'

let phpFiles = fs.readdirSync('src/')
phpFiles = phpFiles.map(x => `src/${x}`)

// const phpFiles = ["src/index.php", 'src/judul.php'];

gulp.task("default", function(cb) {
  pump([
    gulp.src(phpFiles),
    phpinc({
      verbose: true,
      path: 'src/'
    }),
    gulp.dest("build")
  ], cb);
});