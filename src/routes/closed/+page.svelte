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

<Navbar />

<div class="content">
	<h1 class="title"><span style="color:#3bc5e7">{user?.username || 'Anonym'}</span></h1>
	<p class="subtitle">Das Wettsystem wird am 30.03 zur SoccerNight freigeschaltet.</p>
	<img src="/images/waiting.webp" alt="still_waiting" class="image" />
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
		width: 95%;
		max-width: 400px;
		aspect-ratio: 247 / 204;
		border: 3px solid #aaa;
		border-radius: 25px;
	}
</style>
