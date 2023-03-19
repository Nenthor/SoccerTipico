<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { User } from '$lib/Types';
	import type { PageData } from './$types';

	export let data: PageData;
	let user: User;

	if (data.success && data.user) {
		user = JSON.parse(data.user);
	}

	async function onLogout() {
		const res = await fetch(`/api/logout`, { method: 'POST' });
		if (!res) {
			console.error('Der Server ist momentan nicht erreichbar.');
			return;
		}

		const result = await res.json();

		if (result.success) {
			window.location.href = '/authentication';
		} else if (result.message) console.error(result.message);
	}
</script>

<Navbar>
	<li>
		<a href="/authentication" on:click|preventDefault={onLogout}>Abmelden</a>
	</li>
</Navbar>

<div class="content">
	<h1 class="title">Der Account <span style="color:#3bc5e7">{user?.username || 'Anonym'}</span> wurde gesperrt</h1>
	<p class="subtitle">Suche einen Administrator auf, um weiter wetten zu können.</p>
	<img src="/images/surprised_pikachu.webp" alt="surprised_pikachu" class="image" />
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
		aspect-ratio: 1 / 1;
		border: 3px solid #aaa;
		border-radius: 25px;
	}
</style>
