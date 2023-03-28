<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import { onMount } from 'svelte';

	let team1ID: string;
	let team2ID: string;

	let autoFocus: HTMLElement;
	onMount(() => {
		if (autoFocus) autoFocus.focus();
	});

	async function onSubmit() {
		if(!team1ID){
			setErrorMessage('Gebe einen TEAM A ein.');
			return;
		}
		if (!team2ID) {
			setErrorMessage('Gebe einen TEAM B ein.');
			return;
		}
		const res = await fetch('/api/match/create', { method: 'POST', headers: {team1ID: team1ID, team2ID: team2ID} });
		if (!res) {
			setErrorMessage('Der Server ist momentan nicht erreichbar.');
			return;
		}
		const result = await res.json();
		if (result.success) {
			setErrorMessage('Spiel wurde erfolgreich erstellt.', true);
			setTimeout(() => {location.href = '/admin';}, 5000);
		} else if (result.message) setErrorMessage(result.message);
	}

	let error_msg = '';
	let error: HTMLElement;
	let timeout: any;
	function setErrorMessage(msg: string, success = false) {
		if (timeout) clearTimeout(timeout);
		error_msg = msg;
		if (success) error.style.color = '#32cd32';
		else error.style.color = '#cd3232';
		timeout = setTimeout(() => {
			error_msg = '';
		}, 5000);
	}
</script>

<Navbar>
	<li>
		<a href="/admin" on:click|preventDefault={() => location.replace('/admin')}>Zurück</a>
	</li>
</Navbar>

<div class="content_box">
	<h1 class="title">Neues Spiel erstellen</h1>
	<form action="" class="form">
		<input type="text" class="input" placeholder="Team A ID" style="width: 80%; margin-bottom: 20px" bind:this={autoFocus} bind:value={team1ID} />
		<input type="text" class="input" placeholder="Team B ID" style="width: 80%; margin-bottom: 20px" bind:this={autoFocus} bind:value={team2ID} />
		<p id="error" bind:this={error}>{error_msg}</p>
		<button class="submit" on:click={onSubmit}>Erstellen</button>
	</form>
</div>

<Footer />

<style>
	.content_box {
		margin-top: 75px;
		padding: 20px 0;
		width: 100%;
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		z-index: 0;
	}

	.title {
		color: #3bc5e7;
		text-align: center;
	}

	.form {
		margin-top: 30px;
		background-color: #323232;
		border-radius: 25px;
		padding: 5px 10px;
		min-width: fit-content;
		width: clamp(200px, 60vw, 500px);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
		position: relative;
	}

	

	.input {
		padding: 5px 10px;
		border: 3px solid transparent;
		margin: 5px 0;
		border-radius: 25px;
		font-size: 1rem;
		outline: none;
	}

	.input:focus {
		border: 3px solid #398dd1;
	}

	.input::placeholder {
		text-align: center;
	}

	#error {
		text-align: center;
		color: #cd3232;
		overflow-wrap: break-word;
		width: clamp(200px, 50vw, 500px);
		margin: 3px 0;
		min-height: 20px;
	}

	.submit {
		border: none;
		margin-top: 5px;
		padding: 8px 0;
		min-width: 50%;
		border-radius: 25px;
		cursor: pointer;
		font-weight: bold;
		color: #1e9c1e;
		background-color: white;
		font-size: 1.1rem;
	}

	.submit:hover {
		color: white;
		background-color: #1e9c1e;
	}

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
