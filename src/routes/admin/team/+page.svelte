<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { PageData } from './$types';
	import type { Team, User } from '$lib/Types';
	import { onMount } from 'svelte';

	export let data: PageData;
	let team: Team;
	let self: User;
	let error_msg = '';

	if (data.success && data.team) {
		team = JSON.parse(data.team);
		self = JSON.parse(data.self);
	}

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

	async function deleteTeam() {
		const valid = confirm('Soll dieses Team wirklich gelöscht werden?');
		if (!valid) return;

		if (!team) setErrorMessage('Team-ID nicht gefunden.');
		else {
			const res = await fetch('/api/team/delete', { method: 'POST', headers: { teamID: team.id } });
			if (!res) {
				setErrorMessage('Der Server ist momentan nicht erreichbar.');
				return;
			}
			const result = await res.json();
			if (result.success) {
				setErrorMessage('Team erfolgreich gelöscht.', true);
				setTimeout(() => {
					window.location.href = '/admin';
				}, 5000);
			} else if (result.message) setErrorMessage(result.message);
		}
	}
</script>

<Navbar>
	<li>
		<a href="/admin" on:click|preventDefault={() => location.replace('/admin')}>Zurück</a>
	</li>
</Navbar>

<div class="content_box">
	<h1 class="title">{team?.name || '-'}</h1>
	<ul class="stats">
		<li class="item">
			<p>Punkte</p>
			<div class="line" />
			<p>{(team?.win || 0) * 3 + (team?.draw || 0)}</p>
		</li>
		<li class="item">
			<p>S | U | N</p>
			<div class="line" />
			<p>{team?.win || 0} | {team?.draw || 0} | {team?.lose || 0}</p>
		</li>
		<li class="item">
			<p>Tordifferenz</p>
			<div class="line" />
			<p>{team?.goal_difference || 0}</p>
		</li>
		<li class="item">
			<p>Gruppe</p>
			<div class="line" />
			<p>{team?.group || '-'}</p>
		</li>
	</ul>
	<h2 class="actions_title">Aktionen</h2>
	<ul class="actions_box">
		<li class="item" style="flex-direction: column;">
			<button class="submit delete" on:click={deleteTeam}>Team löschen</button>
			<p id="error" bind:this={error}>{error_msg}</p>
		</li>
	</ul>
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

	.stats {
		margin-top: 15px;
		min-width: fit-content;
		padding: 5px 20px;
		width: clamp(200px, 75%, 750px);
		background-color: #323232;
		border-radius: 25px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
		list-style: none;
	}

	.item {
		color: white;
		width: 100%;
		margin: 10px 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.line {
		flex-grow: 1;
		height: 1px;
		border-bottom: 2px dotted #aaa;
		margin: 0 10px;
	}

	.actions_title {
		margin-top: 30px;
		color: white;
	}

	.actions_box {
		margin-top: 5px;
		min-width: fit-content;
		padding: 5px 20px;
		width: clamp(200px, 75%, 750px);
		background-color: #323232;
		border-radius: 25px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
		list-style: none;
	}

	.submit {
		border: none;
		margin-top: 5px;
		padding: 8px 0;
		min-width: max(200px, 50%);
		border-radius: 25px;
		cursor: pointer;
		font-weight: bold;
		color: white;
		background-color: #1e9c1e;
		font-size: 1.1rem;
	}

	.submit:hover {
		background-color: #186d18;
	}

	.delete {
		background-color: #830505;
	}

	.delete:hover {
		background-color: #750303;
	}

	#error {
		text-align: center;
		color: #cd3232;
		overflow-wrap: break-word;
		width: clamp(200px, 50vw, 500px);
		margin: 5px;
	}
</style>
