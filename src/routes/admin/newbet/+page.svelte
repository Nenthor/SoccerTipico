<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import type { Match } from '$lib/server/database';

	export let data: PageData;

	let matches: Match[] = [];
	let selected_match = -1;
	let choices = 0;
	let question: string;
	let options: string[] = [];
	let is_connected = false;
	let timelimit_min: number | null;

	let autoFocus: HTMLElement;
	onMount(() => {
		if (autoFocus) autoFocus.focus();
	});

	if (data.success && data.matches) {
		matches = JSON.parse(data.matches);
	}

	$: selected_match, setToPrefab(selected_match);

	function setToPrefab(selected_match: number) {
		if (selected_match == -1) {
			question = '';
			timelimit_min = null;
			choices = 0;
			options = [];
			is_connected = false;
		} else {
			const match = matches[selected_match];
			if (!match.team1 || !match.team2) return;
			question = `${match.team1.name} vs. ${match.team2.name}`;
			timelimit_min = 5;
			choices = 3;
			is_connected = true;
			options = [`Team ${match.team1.name} gewinnt`, 'Unentschieden', `Team ${match.team2.name} gewinnt`];
		}
	}

	async function onSubmit() {
		if (!question) {
			setErrorMessage('Gebe die Frage an.');
			return;
		}
		for (let index = 0; index < choices; index++) {
			if (!options[index]) {
				setErrorMessage('Gebe die Optionen an.');
				return;
			} else if (options.find((o, i) => i != index && i < choices && o == options[index])) {
				setErrorMessage('Optionen müssen unterschiedlich sein.');
				return;
			}
		}
		let new_options: string[] = [];
		if (choices == 0) new_options = ['yes', 'no'];
		else new_options = options.slice(0, choices);
		if (!timelimit_min && timelimit_min != 0) {
			setErrorMessage('Gebe ein Zeitfenster an.');
			return;
		} else if (timelimit_min < 1 && timelimit_min != 0) {
			setErrorMessage('Das Zeitfenster muss min. 2 Minuten sein.');
			return;
		} else if (timelimit_min > 10) {
			setErrorMessage('Das Zeitfenster kann max. 10 Minuten sein.');
			return;
		}
		let new_timelimit = new Date();
		new_timelimit.setMinutes(new_timelimit.getMinutes() + timelimit_min);
		if (timelimit_min == 0) new_timelimit.setDate(new_timelimit.getDate() + 1);

		const res = await fetch('/api/bet/create', {
			method: 'POST',
			headers:
				is_connected && selected_match != -1
					? { question, choices: JSON.stringify(new_options), timelimit: new_timelimit.toJSON(), panelID: selected_display.toString(), connectedID: matches[selected_match].id }
					: { question, choices: JSON.stringify(new_options), timelimit: new_timelimit.toJSON(), panelID: selected_display.toString() }
		});
		if (!res) {
			setErrorMessage('Der Server ist momentan nicht erreichbar.');
			return;
		}
		const result = await res.json();
		if (result.success) {
			if (is_connected && selected_match != -1) setErrorMessage('Wette wurde erfolgreich erstellt und mit Spiel verknüpft.', true);
			else setErrorMessage('Wette wurde erfolgreich erstellt.', true);
			setTimeout(() => {
				location.href = '/admin';
			}, 5000);
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
	<h1 class="title">Neue Wette erstellen</h1>
	<div class="select_box" style="width:200px;">
		<p>Wettvorlage auswählen:</p>
		<select class="select" bind:value={selected_match}>
			<option value={-1}>Wähle ein Spiel</option>
			{#each matches as match, index}
				{#if match.team1 && match.team2}
					<option value={index}>{match.team1.name} vs. {match.team2.name}</option>
				{/if}
			{/each}
		</select>
		{#if selected_match != -1}
			<p style="text-align: center; margin-top: 10px;">Mit Wette verknüpfen:</p>
			<label class="switch">
				<input type="checkbox" bind:checked={is_connected} on:click={() => (is_connected = !is_connected)} />
				<span class="slider round" />
			</label>
		{/if}
	</div>
	<form action="" class="form">
		<input type="text" class="input" placeholder="Wettfrage" style="width: 80%; margin-bottom: 20px" bind:this={autoFocus} bind:value={question} />
		<div class="choices">
			<p class="choices_title">Auswahlmöglichkeiten</p>
			<div class="choices_box">
				<div class="choice">
					<input type="radio" name="choices" class="radio" bind:group={choices} value={0} checked />
					<p class="choice_name">Ja | Nein</p>
				</div>
				<div class="choice">
					<input type="radio" name="choices" class="radio" bind:group={choices} value={2} />
					<p class="choice_name">2</p>
				</div>
				<div class="choice">
					<input type="radio" name="choices" class="radio" bind:group={choices} value={3} />
					<p class="choice_name">3</p>
				</div>
				<div class="choice">
					<input type="radio" name="choices" class="radio" bind:group={choices} value={4} />
					<p class="choice_name">4</p>
				</div>
			</div>
		</div>
		{#if choices > 0}
			<p class="input_title">Antwortmöglichkeiten</p>
			<div class="inputs">
				{#each Array(choices) as _, i}
					<input type="text" class="input" placeholder="Option {i + 1}" bind:value={options[i]} />
				{/each}
			</div>
		{/if}
		<p style="color:white; margin-top: 10px">Zeitfenster</p>
		<div class="timelimit_box">
			<input type="number" class="input" placeholder="x" style="text-align: center; width: 25px" bind:value={timelimit_min} title="0 = 1d Laufzeit || 2-10min Laufzeit" />
			<p>Minuten</p>
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
	}

	.form {
		margin-top: 20px;
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

	.choices {
		width: 75%;
		margin: 10px;
		border: 2px solid #646464;
		border-radius: 10px;
	}

	.choices_box {
		margin-top: 10px;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
	}

	.choices_title {
		position: absolute;
		transform: translateX(10px) translateY(-50%);
		background-color: #323232;
		color: white;
		padding: 0 5px;
	}

	.choice {
		display: flex;
		color: white;
		margin: 2.5px;
		align-items: center;
	}

	.radio {
		border: none;
		margin-right: 5px;
		height: 15px;
		width: 15px;
		cursor: pointer;
	}

	.input_title {
		color: white;
		margin-top: 10px;
	}

	.inputs {
		display: flex;
		flex-direction: column;
		width: 80%;
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
	}

	.timelimit_box {
		display: flex;
		align-items: center;
	}

	.timelimit_box p {
		color: white;
		margin-left: 10px;
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

	.select_box {
		display: flex;
		flex-direction: column;
		min-width: clamp(200px, 60vw, 500px);
		align-items: center;
		justify-content: center;
	}

	.select_box p {
		text-align: center;
		color: white;
		margin-top: 40px;
	}

	.select {
		border: none;
		outline: none;
		margin-top: 5px;
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

	.switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
		margin-top: 10px;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #999;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	input:checked + .slider {
		background-color: #2196f3;
	}

	input:focus + .slider {
		box-shadow: 0 0 1px #2196f3;
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(26px);
		-ms-transform: translateX(26px);
		transform: translateX(26px);
	}

	/* Rounded sliders */
	.slider.round {
		border-radius: 34px;
	}

	.slider.round:before {
		border-radius: 50%;
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

	@media screen and (max-width: 600px) {
		.form {
			width: clamp(200px, 80vw, 500px);
		}

		.select_box {
			min-width: clamp(200px, 80vw, 500px);
		}

		.inputs {
			width: 95%;
		}

		.choices {
			width: 90%;
		}

		.submit {
			min-width: 75%;
		}
	}
</style>
