import express from 'express'
import njk from 'nunjucks'

import { exec } from 'child_process'

if (process.argv.includes('build')) {
  exec('nunjucks "**/*.html" -p src -o build', () => {})
}

// const app = express()

// function server() {

//   // Define port to run server on
//   var port = process.env.PORT || 3000;

//   // Configure Nunjucks
//   var _templates = process.env.NODE_PATH ? process.env.NODE_PATH + '/src' : 'src';
//   nunjucks.configure(_templates, {
//     autoescape: true,
//     cache: false,
//     express: app
//   });

//   function ignoreFavicon(req, res, next) {
//     if (req.originalUrl.includes('favicon.ico')) {
//       res.status(204).end()
//     }
//     next();
//   }
//   app.use(ignoreFavicon);

//   // Set Nunjucks as rendering engine for pages with .html suffix
//   app.engine('html', nunjucks.render);
//   app.set('view engine', 'html');

//   // Respond to all GET requests by rendering relevant page using Nunjucks
//   // app.get('/:page', function(req, res) {
//   //     res.render(req.params.page);
//   // });
//   app.get(/\/(.+)/, function(req, res) {
//     res.render(req.params[0]);
//   });

//   // Start server
//   app.listen(port);
//   console.log('Listening on port %s...', port);
// }
// server()