<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { PageData } from './$types';
	import type { User } from '$lib/Types';
	import type { Match } from '$lib/server/database';
	import { onMount } from 'svelte';

	export let data: PageData;
	let match: Match;
	let self: User;
	let error_msg = '';
	let error_delete_msg = '';
	let error_finish_msg = '';
	let error_panel_msg = '';
	let goals1: number | null;
	let goals2: number | null;
	let selected_display = -1;

	if (data.success && data.match) {
		match = JSON.parse(data.match);
		self = JSON.parse(data.self);
		if (data.panel) selected_display = parseInt(data.panel);
	}

	onMount(() => {
		updatePanel();
	});

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

	let delete_error: HTMLElement;
	let delete_timeout: any;
	function setDeleteErrorMessage(msg: string, success = false) {
		if (delete_timeout) clearTimeout(delete_timeout);
		error_delete_msg = msg;
		if (success) delete_error.style.color = '#32cd32';
		else delete_error.style.color = '#cd3232';
		delete_timeout = setTimeout(() => {
			error_delete_msg = '';
		}, 5000);
	}

	let finish_error: HTMLElement;
	let finish_timeout: any;
	function setFinishErrorMessage(msg: string, success = false) {
		if (finish_timeout) clearTimeout(finish_timeout);
		error_finish_msg = msg;
		if (success) finish_error.style.color = '#32cd32';
		else finish_error.style.color = '#cd3232';
		finish_timeout = setTimeout(() => {
			error_finish_msg = '';
		}, 5000);
	}

	async function finishMatch() {
		const valid = confirm('Soll dieses Spiel wirklich beendet werden?');
		if (!valid) return;

		if (!match) setDeleteErrorMessage('Match-ID nicht gefunden.');
		else {
			const res = await fetch('/api/match/finish', { method: 'POST', headers: { matchID: match.id } });
			if (!res) {
				setDeleteErrorMessage('Der Server ist momentan nicht erreichbar.');
				return;
			}
			const result = await res.json();
			if (result.success) {
				setDeleteErrorMessage('Spiel erfolgreich beendet.', true);
				setTimeout(() => {
					window.location.href = '/admin';
				}, 5000);
			} else if (result.message) setDeleteErrorMessage(result.message);
		}
	}

	async function deleteMatch() {
		const valid = confirm('Soll dieses Spiel wirklich gelöscht werden?');
		if (!valid) return;

		if (!match) setFinishErrorMessage('Match-ID nicht gefunden.');
		else {
			const res = await fetch('/api/match/delete', { method: 'POST', headers: { matchID: match.id } });
			if (!res) {
				setFinishErrorMessage('Der Server ist momentan nicht erreichbar.');
				return;
			}
			const result = await res.json();
			if (result.success) {
				setFinishErrorMessage('Spiel erfolgreich gelöscht.', true);
				setTimeout(() => {
					window.location.href = '/admin';
				}, 5000);
			} else if (result.message) setFinishErrorMessage(result.message);
		}
	}

	async function onGoalChange() {
		if (!match) setErrorMessage('Match-ID nicht gefunden.');
		else if (!goals1 && !goals2 && goals1 !== 0 && goals2 !== 0) setErrorMessage('Verändere mindestens einen Wert.');
		else if ((goals1 && goals1 < 0) || (goals2 && goals2 < 0)) setErrorMessage('Spielstand kann nicht negativ sein.');
		else {
			if (goals1 || goals1 === 0) match.goals1 = goals1;
			if (goals2 || goals2 === 0) match.goals2 = goals2;
			match = match;
			goals1 = null;
			goals2 = null;
			const res = await fetch('/api/match/update', { method: 'POST', headers: { matchID: match.id, goals1: match.goals1.toString(), goals2: match.goals2.toString() } });
			if (!res) {
				setErrorMessage('Der Server ist momentan nicht erreichbar.');
				return;
			}
			const result = await res.json();
			if (result.success) {
				setErrorMessage('Spielstand erfolgreich verändert.', true);
			} else if (result.message) setErrorMessage(result.message);
		}
	}

	let displays: HTMLButtonElement[] = [];
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

		const res = await fetch('/api/panel/match', { method: 'POST', headers: { matchID: match.id, panelID: id.toString(), remove: `${remove}` } });
		if (!res) {
			setPanelErrorMessage('Der Server ist momentan nicht erreichbar.');
			return;
		}
		const result = await res.json();
		if (result.success) {
			setPanelErrorMessage('Das Zeitfenster wurde erfolgreich aktualisiert.', true);
		} else if (result.message) setPanelErrorMessage(result.message);
	}

	function updatePanel() {
		if (selected_display == -1) return;
		else if (selected_display == 3) {
			const display1 = displays[1];
			display1.style.backgroundColor = display1.style.color;
			display1.style.borderColor = display1.style.color;
			display1.style.color = 'white';
			const display2 = displays[2];
			display2.style.backgroundColor = display2.style.color;
			display2.style.borderColor = display2.style.color;
			display2.style.color = 'white';
		} else {
			const display = displays[selected_display];
			display.style.backgroundColor = display.style.color;
			display.style.borderColor = display.style.color;
			display.style.color = 'white';
		}
	}

	let error_panel: HTMLElement;
	let timeout_panel: any;
	function setPanelErrorMessage(msg: string, success = false) {
		if (timeout_panel) clearTimeout(timeout_panel);
		error_panel_msg = msg;
		if (success) error_panel.style.color = '#32cd32';
		else error_panel.style.color = '#cd3232';
		timeout_panel = setTimeout(() => {
			error_panel_msg = '';
		}, 5000);
	}
</script>

<Navbar>
	<li>
		<a href="/admin" on:click|preventDefault={() => location.replace('/admin')}>Zurück</a>
	</li>
</Navbar>

<div class="content_box">
	<h1 class="title">{match?.team1?.name || '-'} vs. {match?.team2?.name || '-'}</h1>
	<ul class="stats">
		<li class="item">
			<p>Stand</p>
			<div class="line" />
			<p>{match?.goals1 || 0} : {match?.goals2 || 0}</p>
		</li>
	</ul>
	<h2 class="actions_title">Aktionen</h2>
	<ul class="actions_box">
		<li class="item" style="flex-direction: column;">
			<button class="submit finish" on:click={finishMatch}>Spiel Beenden</button>
			<p class="error" id="error_finish" bind:this={finish_error}>{error_finish_msg}</p>
		</li>
		<li class="item" style="flex-direction: column;">
			<p>Spielstand setzen</p>
			<div>
				<input type="number" class="input" placeholder={match?.goals1.toString() || '0'} bind:value={goals1} />
				<span style="margin: 0 8px;">:</span>
				<input type="number" class="input" placeholder={match?.goals2.toString() || '0'} bind:value={goals2} />
			</div>
			<button class="submit" on:click={onGoalChange}>Ändern</button>
			<p class="error" id="error" bind:this={error}>{error_msg}</p>
		</li>
		<div class="item" style="flex-direction: column;">
			<p style="margin-bottom: 5px;">Wähle einen Bildschirm aus:</p>
			<div class="decision_choices">
				<button class="decision_choice" on:click={() => onSetDisplay(1)} bind:this={displays[1]} style="color:#3bc5e7; border-color=#3bc5e7; min-width: 45px;">1</button>
				<button class="decision_choice" on:click={() => onSetDisplay(2)} bind:this={displays[2]} style="color:#3bc5e7; border-color=#3bc5e7; min-width: 45px;">2</button>
			</div>
			<p class="error" id="error_panel" bind:this={error_panel}>{error_panel_msg}</p>
		</div>
		<li class="item" style="flex-direction: column;">
			<button class="submit delete" on:click={deleteMatch}>Spiel Löschen</button>
			<p class="error" id="error_delete" bind:this={delete_error}>{error_delete_msg}</p>
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

	.finish {
		background-color: #c52222;
	}

	.finish:hover {
		background-color: #9c1313;
	}

	.delete {
		background-color: #830505;
	}

	.delete:hover {
		background-color: #750303;
	}

	.input {
		padding: 5px 10px;
		border: 3px solid transparent;
		margin: 5px 0;
		width: 30px;
		border-radius: 25px;
		font-size: 1rem;
		outline: none;
		text-align: center;
	}

	.input:focus {
		border: 3px solid #398dd1;
	}

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.error {
		text-align: center;
		color: #cd3232;
		overflow-wrap: break-word;
		width: clamp(200px, 50vw, 500px);
		margin-top: 3px;
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
