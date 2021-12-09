import recursive from 'recursive-readdir-sync'
import fs from 'fs'
import { platform } from 'process'

const pola = {
	attach: /@attach\((.*?)\)/g,
	attachSatuan: /@attach\((.*?)\)/,
	component: /(@component)([\S\s]*?)(@endcomponent)/g,
	slot: /(@slot)([\S\s]*?)(@endslot)/g,
	slotSatuan: /@slot\(([\S\s]*?)\)([\S\s]*?)@endslot/,
	markdown: /(@markdown)([\S\s]*?)(@endmarkdown)/g,
	windi: /(<style lang=.windi.>)([\S\s]*?)(<\/style>)/g,
}

const pemisah = platform == 'win32' ? '\\' : '/'

function buatFolder(namaFolder) {
	if (!fs.existsSync(namaFolder)) {
		fs.mkdirSync(namaFolder);
	}
}

buatFolder('public')
let files = recursive('src')
// files.splice(0, 1)

function olahPerFile(path) {
	let isi = `${fs.readFileSync(path)}`

	function mulaiOlah() {

		if (isi.match(pola.component)) {
			let komponenAwal = isi.match(pola.component)
			let komponenBaru = [...komponenAwal]

			for (let [n, item] of komponenBaru.entries()) {
				komponenBaru[n] = item.replace(pola.component, function(x, a, b, c) {
					let body = b

					let ambil = `src${pemisah}${b.match(/^(\()([\S\s]*?)(\))/)[2]}.html`
					ambil = `${fs.readFileSync(ambil)}`

					body = body.replace(/\([\S\s]*?\)/, ambil)
					return body
				})
			}

			for (let [n, x] of komponenBaru.entries()) {
				if (x.match(pola.slot)) {
					komponenBaru[n] = x.replace(pola.attachSatuan, function(itu, a) {
						let hasil = x.match(pola.slot).filter(f => f.includes(`@slot(${a})`)).map(y => y.replace(pola.slotSatuan, '$2'))
						return hasil
						// console.log(hasil)
					})
				}
			}

			for (let [n, x] of komponenBaru.entries()) {
				komponenBaru[n] = x.replace(pola.slot, '').replace(pola.attach, '')
			}

			for (let [n, x] of komponenAwal.entries()) {
				isi = isi.replace(x, komponenBaru[n])
			}


		}

		// if (isi.match(pola.component)) {
		// 	mulaiOlah()
		// } else if (isi.match(pola.attach)) {
		// 	mulaiOlah()
		// } else {
		// 	fs.writeFileSync(path.replace(/^src/, 'public'), isi)
		// }

	}
	mulaiOlah()

}

for (let x of files) {
	olahPerFile(x)
}