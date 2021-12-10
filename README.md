# unmei

<p align='center'>
	<img src='unmei.jpeg'/>
</p>

Static Site Generator yang simpel dan cepat.

## Konsep

Ketika mode dev, dia kayak PHP (bukan generate SSG)

Ketika build, baru generate SSG

## Yang Digunakan pada Package Ini

**Nunjucks**. Jadi, kamu menuliskannya dengan format Nunjucks.

## Struktur Folder

```
.
└── src
    ├── index.html
    └── template.html
```

Jadi, semua file Nunjucks diletakkan di folder `src` dengan ekstensi `html`.

Untuk hasil build, nanti terbentuk folder `build`.

## Instalasi

```bash
npm i -g unmei
```

## Menjalankan

Untuk mode dev: `unmei dev`

Untuk mode build: `unmei build`

## Fitur

### Windi

Otomatis menambahkan styling Windi (plus preflight) pada setiap halaman.

### Markdown

Sintaks:

```
@markdown
  Kode Markdown di sini
@endmarkdown
```

## Sublime Emmet Preferences

```json
{
  "telemetry": true,
  "uid": "37791c0d-2653-4447-8bc0-731daa283775",
  "config": {
    "markup": {
      "snippets": {
        "extends": "{{% extends '' %}}",
        "block": "{{% block  %}\n\t\n{% endblock %}}",
        "markdown": "{@markdown\n\t\n@endmarkdown}",
        "windi": "style[lang=windi]",
        "petite": "script>{PetiteVue.createApp({}).mount()\n}",
      },
      "options": {
        "output.selfClosingStyle": "xhtml"
      }
    }
  }
}
```

## Rencana Berikutnya

- [x] Windi saat dev
- [x] Windi saat build
- [x] Hapus kode Windi saat build
- [ ] Auto sitemap
- [ ] Auto generate robots.txt
- [x] Markdown + Shiki (dev)
- [x] Markdown + Shiki (build)
- [ ] Ubah gambar menjadi webp (ini jadinya nggak bisa dipakai di Termux)
- [x] Minify HTML
- [x] Minify aset JS
- [x] Minify aset CSS
- [x] Ganti delimiter Nunjucks jadi {$ $}
- [x] Dynamic port
- [x] Hapus error folder static kalau nggak ada