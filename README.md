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

## Instalasi

```bash
npm i -g unmei
```

## Menjalankan

Untuk mode dev: `unmei dev`

Untuk mode build: `unmei build`

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
- [ ] Minify aset CSS