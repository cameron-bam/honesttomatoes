<script>
	import CompareTomatoMeter from './components/CompareTomatoMeter.svelte';
	const rottenTomatoes = 'https://rottentomatoes.com/m/captain_marvel';
	export let name;
</script>

<main>
	<h1>{name}</h1>

	<p>
		Rotten Tomatoes grades on a pass/fail system, whereas Honest Tomatoes grades based on the critics' original scores.
		We also check whether or not a critic's review was really fresh, or rotten. The results might surprise you!
	</p>

	<p>
		Enter a link to a movie from Rotten Tomatoes (e.g. <a href="{rottenTomatoes}">{rottenTomatoes}</a>) to see if the critic scores match the tomatometer score.
	</p>

	<CompareTomatoMeter />

	<p>
		This is an open source project. You can find the source code <a href="https://github.com/cameron-bam/honesttomatoes">here</a>.
	</p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>