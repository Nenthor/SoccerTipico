<script>
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
</script>

<Navbar>
	<li>
		<a href="/" on:click|preventDefault={() => location.replace('/')}>Zurück</a>
	</li>
</Navbar>

<div class="content">
	<h1 class="title">Übertreib es nicht...</h1>
	<p class="subtitle">Etwas ist schiefgelaufen... <br />Suche einen Administrator auf, falls das Problem öfters auftreten sollte.</p>
	<img src="/images/server_burning.webp" alt="server_burning" class="image" />
</div>

<Footer />

<style>
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
		margin-top: 10%;
		max-width: 95%;
		aspect-ratio: 637 / 480;
		border: 3px solid #aaa;
		border-radius: 25px;
	}
</style>
