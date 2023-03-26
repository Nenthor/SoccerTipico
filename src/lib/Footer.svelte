<footer>
	<p>SoccerTipico | <a href="/datenschutz" on:click|preventDefault={() => location.replace('/datenschutz')}>Datenschutz</a></p>
</footer>

<style>
	footer {
		height: 40px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
		background-color: white;
	}
	footer p {
		font-family: roboto;
		text-align: center;
		font-size: 0.95rem;
		color: #161616;
	}
	footer a {
		font-family: roboto;
		font-size: 0.95rem;
		color: #2975b3;
		text-decoration: none;
	}
</style>
