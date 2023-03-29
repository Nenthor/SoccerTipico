<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import type { Team } from '$lib/server/database';

	export let data: PageData;

	let teams: Team[];
	let team1 = -1;
	let team2 = -1;

	let autoFocus: HTMLElement;
	onMount(() => {
		if (autoFocus) autoFocus.focus();
	});

	if (data.success && data.teams) {
		teams = JSON.parse(data.teams);
	}

	async function onSubmit() {
		if (team1 == -1) setErrorMessage('Wähle ein Team 1 aus.');
		else if (team2 == -1) setErrorMessage('Wähle ein Team 2 aus.');
		else if (team1 == team2) setErrorMessage('Wähle unterschiedliche Teams aus.');
		else {
			const res = await fetch('/api/match/create', { method: 'POST', headers: { team1ID: teams[team1].id, team2ID: teams[team2].id, panelID: selected_display.toString() } });
			if (!res) {
				setErrorMessage('Der Server ist momentan nicht erreichbar.');
				return;
			}
			const result = await res.json();
			if (result.success) {
				setErrorMessage('Spiel wurde erfolgreich erstellt.', true);
				setTimeout(() => {
					location.href = '/admin';
				}, 5000);
			} else if (result.message) setErrorMessage(result.message);
		}
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

	let displays: HTMLButtonElement[] = [];
	let selected_display = -1;
	async function onSetDisplay(id: number) {
		let remove = false;
		if (selected_display == id || selected_display == 3) {
			const last_display = displays[id];
			last_display.style.borderColor = last_display.style.backgroundColor;
			last_display.style.color = last_display.style.backgroundColor;
			last_display.style.backgroundColor = 'white';

			if (selected_display == 3) {
				selected_display = id == 1 ? 2 : 1;
			} else selected_display = -1;

			remove = true;
		}

		if (!remove) {
			const display = displays[id];
			display.style.backgroundColor = display.style.color;
			display.style.borderColor = display.style.color;
			display.style.color = 'white';

			if (selected_display == -1) selected_display = id;
			else selected_display = 3;
		}
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
		<div class="select_box" style="width:200px;">
			<p>Wähle die Teams</p>
			<select class="select" bind:value={team1}>
				<option value={-1}>Wähle Team 1</option>
				{#each teams as team, index}
					{#if index != team2 || index == -1}
						<option value={index}>{team.name} ({team.group})</option>
					{/if}
				{/each}
			</select>
			<select class="select" bind:value={team2}>
				<option value={-1}>Wähle Team 2</option>
				{#each teams as team, index}
					{#if index != team1 || index == -1}
						<option value={index}>{team.name} ({team.group})</option>
					{/if}
				{/each}
			</select>
		</div>
		<div class="item" style="flex-direction: column;">
			<p style="margin-bottom: 5px;">Wähle einen Bildschirm aus:</p>
			<div class="decision_choices">
				<button class="decision_choice" on:click={() => onSetDisplay(1)} bind:this={displays[1]} style="color:#3bc5e7; border-color=#3bc5e7; min-width: 45px;">1</button>
				<button class="decision_choice" on:click={() => onSetDisplay(2)} bind:this={displays[2]} style="color:#3bc5e7; border-color=#3bc5e7; min-width: 45px;">2</button>
			</div>
		</div>
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
		font-size: clamp(0.9rem, 8vw, 2rem);
	}

	.form {
		margin-top: 30px;
		background-color: #323232;
		border-radius: 25px;
		padding: 5px 10px;
		min-width: fit-content;
		width: clamp(150px, 80vw, 500px);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
		position: relative;
	}

	.select_box {
		display: flex;
		flex-direction: column;
		min-width: 95%;
		align-items: center;
		justify-content: center;
	}

	.select_box p {
		text-align: center;
		color: white;
		margin-top: 10px;
	}

	.select {
		border: none;
		outline: none;
		margin-top: 15px;
		width: clamp(200px, 100%, 600px);
		height: 40px;
		border-radius: 10px;
		appearance: none;
		-webkit-appearance: none;
	}

	.select option {
		font-size: 0.9rem;
		text-align: center;
		padding: 10px;
	}

	#error {
		text-align: center;
		color: #cd3232;
		overflow-wrap: break-word;
		width: clamp(200px, 50vw, 500px);
		margin: 5px 0;
	}

	.submit {
		border: none;
		margin: 5px 0;
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

	.item {
		color: white;
		width: 100%;
		margin: 10px 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.decision_choice {
		border: none;
		outline: none;
		padding: 0.15rem 0.7rem;
		margin: 0 10px;
		cursor: pointer;
		border-radius: 7.5px;
		font-weight: bold;
		background-color: white;
		border-width: 2px;
		border-style: solid;
		font-size: 1.75rem;
	}
</style>
