import windi from './windi.js'

console.log(windi(`
	<p class='halo'>Halo</p>

	<style lang='windi'>
		.halo {
			@apply mx-auto bg-green-500 text-5xl
		}
		p {
			@apply text-right text-red-500 <sm:(text-center text-3xl)
		}
	</style>

	<style lang='windi'>
		* {
			@apply text-green-500
		}
	</style>
`))