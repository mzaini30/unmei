#!/usr/bin/env node

import express from 'express'
import nunjucks from 'nunjucks'

import { execSync } from 'child_process'

if (process.argv.includes('build')) {
  // generate nunjucks
  execSync('npx nunjucks "**/*.html" -p src -o build')
}

if (process.argv.includes('server')) {
  const app = express()

  // Define port to run server on
  var port = process.env.PORT || 3000;

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

  // Start server
  app.listen(port);
  console.log('Listening on port %s...', port);
}

if (process.argv.includes('dev')) {
  execSync('npx nodemon -e html --exec "npx unmei server"')
}