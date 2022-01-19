#!/usr/bin/env node

const saatDev = process.argv.includes("dev");
const saatBuild = process.argv.includes("build");
const format = process.argv.includes("format");

if (format) {
  const recursive = require("recursive-readdir-sync");
  const { readFileSync, writeFileSync } = require("fs");
  const prettier = require("prettier");

  const isi_src = recursive("src").filter((x) => x.match(/\.html$/));
  for (let x of isi_src) {
    console.log(x);

    let isinya = readFileSync(x).toString();

    isinya = isinya
      .replace(/{% block (\S+) %}/g, "<div><!-- block $1 -->")
      .replace(/{% endblock %}/g, "</div><!-- endblock -->")
      .replace(/@markdown/g, "<pre><!-- markdown -->")
      .replace(/@endmarkdown/g, "</pre><!-- endmarkdown -->")
      .replace(/{% macro ([\s\S]+\)) %}/g, "<div><!-- macro $1 -->")
      .replace(/{% endmacro %}/g, "</div><!-- endmacro -->")
      .replace(/{% raw %}/g, "<div><!-- raw -->")
      .replace(/{% endraw %}/g, "</div><!-- endraw -->");

    isinya = prettier.format(isinya, {
      semi: false,
      parser: "html",
    });

    isinya = isinya
      .replace(/<div>\s*<!-- block (\S+) -->/g, "{% block $1 %}")
      .replace(/<\/div>\s*<!-- endblock -->/g, "{% endblock %}")
      .replace(/<pre>\s*<!-- markdown -->/g, "@markdown")
      .replace(/<\/pre>\s*<!-- endmarkdown -->/g, "@endmarkdown")
      .replace(/<div>\s*<!-- macro ([\s\S]+\)) -->/g, "{% macro $1 %}")
      .replace(/<\/div>\s*<!-- endmacro -->/g, "{% endmacro %}")
      .replace(/<div>\s*<!-- raw -->/g, "{% raw %}")
      .replace(/<\/div>\s*<!-- endraw -->/g, "{% endraw %}");

    writeFileSync(x, isinya);
  }
}

function createFolderIfNone(dirName) {
  const { existsSync, mkdirSync } = require("fs");

  if (!existsSync(dirName)) mkdirSync(dirName);

  return;
}

const tags = {
  variableStart: "{$",
  variableEnd: "$}",
};
createFolderIfNone("static");
const { generateQuicklink } = require("./modul/buatQuicklink.js");
generateQuicklink();

function olahSemuanya(html) {
  const { minify } = require("html-minifier");
  const { existsSync } = require("fs");
  const { kasihQuicklink } = require("./modul/buatQuicklink.js");

  let isi = olahWindi(html);
  if (saatBuild) {
    isi = isi.replace(/<style lang=['"]windi['"]>([\S\s]*?)<\/style>/g, "");
  }
  isi = renderMarkdown(isi);

  if (saatBuild) {
    isi = isi.replace(/<script type=.module.>/g, "<script>a;");

    isi = minify(isi, {
      collapseWhitespace: true,
      removeComments: true,
      // collapseInlineTagWhitespace: true,
      minifyJS: true,
      minifyCSS: true,
      ignoreCustomFragments: [/\{\{[\s\S]*?\}\}/],
      customEventAttributes: [/^(?:v-on:|@)[a-z]{3,}$/],
      // keepClosingSlash: true
    });

    isi = isi.replace(/<script>a[;,]/g, '<script type="module">');

    if (existsSync("./unmei.json")) {
      isi = kasihQuicklink(isi);
    }
  }
  return isi;
}

function renderMarkdown(teks) {
  const markdown = require("markdown-it");
  const getShiki = require("markdown-it-shiki");
  const imsize = require("markdown-it-imsize");

  const md = markdown();
  const shiki = getShiki.default;

  md.use(shiki, {
    theme: "nord",
  });
  md.use(imsize);

  function olah(teks) {
    let pecahBaris = teks.split("\n");
    pecahBaris = pecahBaris.filter((x, n) => n != 0);

    let karakterHarusLenyap = pecahBaris[0].match(/^\s+/);
    // hasil: ["\t\t"]
    karakterHarusLenyap = karakterHarusLenyap
      ? new RegExp(`^${karakterHarusLenyap[0]}`, "g")
      : "";

    teks = teks
      .split("\n")
      .map((x) => x.replace(karakterHarusLenyap, ""))
      .join("\n");

    return md.render(teks).replace(/@/g, "&commat;");
  }

  return teks.replace(
    /(@markdown)([\S\s]*?)(@endmarkdown)/g,
    function (match, p1, p2) {
      return olah(p2);
    }
  );
}

if (saatBuild) {
  const nunjucks = require("nunjucks");
  const { resolve, dirname } = require("path");
  const mkdirp = require("mkdirp");
  const glob = require("glob");
  const { readFileSync, writeFileSync, existsSync } = require("fs");
  const { copy } = require("fs-extra");
  const recursive = require("recursive-readdir-sync");
  const { minify } = require("uglify-js");
  const CleanCSS = require("clean-css");
  const readJsonSync = require("read-json-sync");

  const nunjucksEnv = nunjucks.configure("./src", {
    trimBlocks: true,
    lstripBlocks: true,
    noCache: true,
    tags,
  });
  const outputDir = "public";

  // const context = argv._[1] ? JSON.parse(readFileSync(argv._[1], 'utf8')) : {}
  const context = {};
  // Expose environment variables to render context
  // context.env = process.env

  function render(files) {
    for (const file of files) {
      // No performance benefits in async rendering
      // https://mozilla.github.io/nunjucks/api.html#asynchronous-support
      let res = nunjucksEnv.render(file, context);

      let outputFile = file.replace(/\.\w+$/, `.html`);

      if (outputDir) {
        outputFile = resolve(outputDir, outputFile);
        mkdirp.sync(dirname(outputFile));
      }

      console.log("Rendering: " + file);
      // res: hasil build
      res = olahSemuanya(res);

      writeFileSync(outputFile, res);
    }
  }

  const globOptions = {
    strict: true,
    cwd: "./src",
    ignore: "**/_*.*",
    nonull: true,
  };

  // Render the files given a glob pattern (except the ones starting with "_")
  glob("**/*.html", globOptions, (err, files) => {
    if (err) return console.log(err);
    render(files);
  });
  copy("./static", "./public/").then(() => {
    let files = recursive("public");

    let fileJS = files.filter((x) => x.match(/\.js$/));
    for (let x of fileJS) {
      let isi = readFileSync(x).toString();
      isi = minify(isi);
      writeFileSync(x, isi.code);
    }

    let fileCSS = files.filter((x) => x.match(/\.css$/));
    for (let x of fileCSS) {
      let isi = readFileSync(x).toString();
      isi = new CleanCSS().minify(isi);
      writeFileSync(x, isi.styles);
    }

    // generate sitemap
    if (existsSync("./unmei.json")) {
      const ambilConfig = readJsonSync("unmei.json");
      if (ambilConfig.situs) {
        // generateQuicklink()
        buatRobots(ambilConfig.situs);
        buatSitemap(ambilConfig.situs);
      }
    }
  });
}

function buatRobots(situs) {
  const { writeFileSync } = require("fs");

  let isi = `
    User-agent: *
    Allow: /
    Disallow:

    Sitemap: ${situs}/sitemap.xml
    Sitemap: ${situs}/sitemap-unmei.xml
  `;
  isi = isi
    .trim()
    .split("\n")
    .map((x) => (x = x.trimStart()))
    .join("\n");
  writeFileSync("public/robots.txt", isi);
}

function buatSitemap(situs) {
  const recursive = require("recursive-readdir-sync");
  const { SitemapManager } = require("sitemap-manager");

  let files = recursive("public");
  files = ["public/", ...files];
  files = files.map((x) => x.replace(/^public/, situs));

  let filesRapi = [];
  files = files.forEach((x) => {
    filesRapi = [
      ...filesRapi,
      {
        loc: x,
        lastmod: new Date(),
        changefreq: 3,
        priority: 0.5,
      },
    ];
  });

  const MySitemap = new SitemapManager({
    siteURL: situs,
  });

  MySitemap.addUrl("unmei", filesRapi);
  MySitemap.finish();
}

if (saatDev) {
  const express = require("express");
  const nunjucks = require("nunjucks");
  const installBrowserSync = require("browser-sync");
  const { watch, init, reload } = installBrowserSync.create();
  const chokidar = require("chokidar");

  const app = express();

  function server() {
    // Configure Nunjucks
    // var _templates = process.env.NODE_PATH ? process.env.NODE_PATH + '/src' : './src';
    let _templates = "./src";
    nunjucks.configure(_templates, {
      autoescape: true,
      cache: false,
      express: app,
      tags,
    });

    // Set Nunjucks as rendering engine for pages with .html suffix
    app.engine("html", nunjucks.render);
    app.set("view engine", "html");

    app.use(express.static("static"));

    app.get("/favicon.ico", (req, res) => res.status(204));

    app.get("/", function (req, res) {
      res.render("index.html");
    });

    // Respond to all GET requests by rendering relevant page using Nunjucks
    // Kalau tidak diakhiri dengan /
    app.get(/\/(.+\.html)/, function (req, res) {
      res.render(req.params[0]);
    });

    // Kalau diakhiri dengan /
    app.get(/\/(.+\/)/, function (req, res) {
      res.render(req.params[0].replace(/\/$/, "/index.html"));
    });
  }
  const portAcak = `${Math.random()}`.substring(2, 6).replace(/0/g, "1");
  const port = process.env.PORT || portAcak;
  // Start server
  app.listen(port);
  console.log("Listening on port %s...", port);

  watch("**/*.*").on("change", reload);
  init({
    proxy: {
      target: `http://localhost:${portAcak}`,
    },
    rewriteRules: [
      {
        match: /[\s\S]*/,
        fn: function (req, res, match) {
          return olahSemuanya(res.data);
        },
      },
    ],
  });

  server();
  chokidar
    .watch("./src", {})
    .on("add", () => server())
    .on("change", () => server())
    .on("unlink", () => server())
    .on("addDir", () => server())
    .on("unlinkDir", () => server());
}

function olahWindi(html) {
  const windi = require("./modul/windi.js");

  let css = windi(html);
  if (saatDev) {
    return html.replace(
      "<body>",
      `
      <body>

      <script id="__bs_script__">
        //<![CDATA[
          document.write("<scr"+"ipt async src='/browser-sync/browser-sync-client.js?v=2.27.7'></scr"+"ipt>".replace("HOST", location.hostname));
        //]]>
      </script>
      
      <style>
        ${css}
      </style>
    `
    );
  }
  if (saatBuild) {
    return html.replace(
      "</head>",
      `
      <style>
        ${css}
      </style>
      </head>
    `
    );
  }
}
