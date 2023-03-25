<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import { onMount } from 'svelte';

	let choices = 0;
	let question: string;
	let options: string[] = [];
	let timelimit_min: number;

	let autoFocus: HTMLElement;
	onMount(() => {
		if (autoFocus) autoFocus.focus();
	});

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

		const res = await fetch('/api/bet/create', { method: 'POST', headers: { question, choices: JSON.stringify(new_options), timelimit: new_timelimit.toJSON() } });
		if (!res) {
			setErrorMessage('Der Server ist momentan nicht erreichbar.');
			return;
		}
		const result = await res.json();
		if (result.success) {
			setErrorMessage('Wette wurde erfolgreich erstellt.', true);
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
	<h1 class="title">Neue Wette erstellen</h1>
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
		min-height: 20px;
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

	@media screen and (max-width: 600px) {
		.form {
			width: clamp(200px, 80vw, 500px);
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
