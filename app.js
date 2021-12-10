#!/usr/bin/env node

import express from 'express'
import windi from './windi.js'
import fs from 'fs-extra'
import nunjucks from 'nunjucks'
import { resolve, dirname } from 'path'
import mkdirp from 'mkdirp'
import { readFileSync, writeFileSync } from 'fs'
import chalk from 'chalk'
import glob from 'glob'
import chokidar from 'chokidar'
import installBrowserSync from 'browser-sync'

import markdown from 'markdown-it'
import getShiki from 'markdown-it-shiki'
import githubHeading from 'markdown-it-github-headings'

const md = markdown()
const shiki = getShiki.default

md.use(shiki, {
  theme: 'nord'
})
md.use(githubHeading, {
  prefixHeadingIds: false,
  enableHeadingLinkIcons: false
})

const saatDev = process.argv.includes('dev')
const saatBuild = process.argv.includes('build')

const browserSync = installBrowserSync.create()

function renderMarkdown(teks) {
  let pecahBaris = teks.split('\n')
  pecahBaris = pecahBaris.filter((x, n) => n != 0)

  let karakterHarusLenyap = pecahBaris[0].match(/^\s+/)
  // hasil: ["\t\t"]
  karakterHarusLenyap = karakterHarusLenyap ? new RegExp(`^${karakterHarusLenyap[0]}`, 'g') : ''

  teks = teks.split('\n').map(x => x.replace(karakterHarusLenyap, '')).join('\n')

  return md.render(teks).replace(/@/g, '&commat;')
}

if (saatBuild) {
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
      let res = nunjucksEnv.render(file, context)

      let outputFile = file.replace(/\.\w+$/, `.html`)

      if (outputDir) {
        outputFile = resolve(outputDir, outputFile)
        mkdirp.sync(dirname(outputFile))
      }

      console.log(chalk.blue('Rendering: ' + file))
      // res: hasil build
      res = olahWindi(res)
      res = res.replace(/<style lang=['"]windi['"]>([\S\s]*?)<\/style>/g, '')
      writeFileSync(outputFile, res)
    }
  }

  const globOptions = { strict: true, cwd: 'src', ignore: '**/_*.*', nonull: true }

  // Render the files given a glob pattern (except the ones starting with "_")
  glob('**/*.html', globOptions, (err, files) => {
    if (err) return console.error(chalk.red(err))
    render(files)
  })
  fs.copy("./static", './build/')
}

if (saatDev) {
  const app = express()

  function server() {
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

    app.use(express.static('static'));

    app.get('/favicon.ico', (req, res) => res.status(204));
    // Respond to all GET requests by rendering relevant page using Nunjucks
    app.get(/\/(.+)/, function(req, res) {
      res.render(req.params[0]);
    });

  }
  const port = process.env.PORT || 8472;
  // Start server
  app.listen(port);
  console.log('Listening on port %s...', port);

  browserSync.watch('**/*.*').on('change', browserSync.reload)
  browserSync.init({
    proxy: {
      target: 'http://localhost:8472/index.html',
    },
    rewriteRules: [{
      match: /[\s\S]*/,
      fn: function(req, res, match) {
        return olahSemuanya(res.data)
      }
    }]
  })

  chokidar.watch('./src', {}).on('all', (event, path) => {
    server()
  });
}

function olahSemuanya(html){
  let isi = olahWindi(html)
  isi = isi.replace(/(@markdown)([\S\s]*?)(@endmarkdown)/g, function(match, p1, p2){
    return renderMarkdown(p2)
  })
  return isi
}

function olahWindi(html) {
  let css = windi(html)
  if (saatDev) {
    return html.replace('<body>', `
      <body>

      <script id="__bs_script__">
        //<![CDATA[
          document.write("<scr"+"ipt async src='/browser-sync/browser-sync-client.js?v=2.27.7'></scr"+"ipt>".replace("HOST", location.hostname));
        //]]>
      </script>
      
      <style>
        ${css}
      </style>
    `)
  }
  if (saatBuild) {
    return html.replace('<body>', `
      <body>
      <style>
        ${css}
      </style>
    `)
  }
}