<script>
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';

	let trap = false;
</script>

<Navbar>
	<li>
		<a href="/" on:click|preventDefault={() => location.replace('/')}>Zurück</a>
	</li>
</Navbar>

<div class="content">
	<h1 class="title">Easter Egg gefunden!</h1>
	<p class="subtitle">Möchtest du dir einen Vorteil verschaffen? <br />Klicke jetzt auf den Button und es werden GRATIS 1.000 auf dein Konto überwiesen.</p>
	{#if trap}
		<img src="/images/rick-roll.gif" alt="server_burning" class="image" />
	{:else}
		<button class="view" on:click={() => (trap = true)}>Klicke hier und lade dein Konto auf</button>
	{/if}
</div>

<Footer />

<style>
	.view {
		border: none;
		margin-top: 50px;
		padding: 8px;
		min-width: max(200px, 50%);
		border-radius: 25px;
		cursor: pointer;
		font-weight: bold;
		color: #1eb3d8;
		background-color: white;
		font-size: 1.1rem;
		text-align: center;
		text-decoration: none;
	}

	.view:hover {
		background-color: #1eb3d8;
		color: white;
	}

	.content {
		margin-top: 75px;
		padding: 20px 0;
		width: 100%;
		background-color: #161616;
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		z-index: 0;
	}

	.title {
		color: white;
		text-align: center;
		font-size: clamp(1.2rem, 7vw, 1.9rem);
		margin: 0 5px;
	}

	.subtitle {
		color: #aaa;
		text-align: center;
		font-size: clamp(0.75rem, 4vw, 1rem);
		margin-top: 10px;
		margin: 10px 5px 0 5px;
	}

	.image {
		margin-top: 30px;
		max-width: 95%;
		aspect-ratio: 640 / 640;
		border: 3px solid #aaa;
		border-radius: 25px;
	}
</style>
