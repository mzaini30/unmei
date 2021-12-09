#!/usr/bin/env node

import express from 'express'
import nunjucks from 'nunjucks'
import { resolve, basename, dirname } from 'path'
import mkdirp from 'mkdirp'
import { readFileSync, writeFileSync } from 'fs'
import chalk from 'chalk'
import glob from 'glob'
import chokidar from 'chokidar'
// import { exec } from 'child_process'

if (process.argv.includes('build')) {
  // generate nunjucks
  // exec('nunjucks "**/*.html" -p src -o build', () => {})

  const nunjucksEnv = nunjucks.configure('src', {
    trimBlocks: true,
    lstripBlocks: true,
    noCache: true
  })
  const outputDir = 'build'

  // const context = argv._[1] ? JSON.parse(readFileSync(argv._[1], 'utf8')) : {}
  const context = {}
  // Expose environment variables to render context
  // context.env = process.env

  function render(files) {
    for (const file of files) {
      // No performance benefits in async rendering
      // https://mozilla.github.io/nunjucks/api.html#asynchronous-support
      const res = nunjucksEnv.render(file, context)

      let outputFile = file.replace(/\.\w+$/, `.html`)

      if (outputDir) {
        outputFile = resolve(outputDir, outputFile)
        mkdirp.sync(dirname(outputFile))
      }

      console.log(chalk.blue('Rendering: ' + file))
      writeFileSync(outputFile, res)
    }
  }

  const globOptions = { strict: true, cwd: 'src', ignore: '**/_*.*', nonull: true }

  // Render the files given a glob pattern (except the ones starting with "_")
  glob('**/*.html', globOptions, (err, files) => {
    if (err) return console.error(chalk.red(err))
    render(files)
  })
}

if (process.argv.includes('dev')) {
  const app = express()

  function server() {

    // Define port to run server on
    

    // Configure Nunjucks
    var _templates = process.env.NODE_PATH ? process.env.NODE_PATH + '/src' : 'src';
    nunjucks.configure(_templates, {
      autoescape: true,
      cache: false,
      express: app
    });

    // Set Nunjucks as rendering engine for pages with .html suffix
    app.engine('html', nunjucks.render);
    app.set('view engine', 'html');

    app.get('/favicon.ico', (req, res) => res.status(204));
    // Respond to all GET requests by rendering relevant page using Nunjucks
    app.get(/\/(.+)/, function(req, res) {
      res.render(req.params[0]);
    });

  }
  const port = process.env.PORT || 3000;
  // Start server
  app.listen(port);
  console.log('Listening on port %s...', port);

  chokidar.watch('./src', {
    // ignored: './dev/static/windi.css',
    // awaitWriteFinish: {
    //   stabilityThreshold: 500
    // }
  }).on('all', (event, path) => {
    server()
  });
}

// if (process.argv.includes('dev')) {
//   exec('nodemon -e html --exec "unmei server"', () => {})
// }