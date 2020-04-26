<script>
	import CompareTomatoMeter from './components/CompareTomatoMeter.svelte';
	const rottenTomatoes = 'rottentomatoes.com';
	export let name;
</script>

<main>
	<h1>{name}</h1>

	<p>
		Enter a movie name from <a href="{`https://${rottenTomatoes}`}">{rottenTomatoes}</a> to see if the critic scores match the tomatometer score.
	</p>

	<p>
		Rotten Tomatoes grades on a pass/fail system. Honest tomatoes grades based on the critics' original scores. We also check whether or not a critic's review was really fresh, or rotten. The results might surprise you!
	</p>

	<CompareTomatoMeter />
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