<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { PageData } from './$types';
	import type { Bet, User } from '$lib/Types';

	export let data: PageData;
	let bet: Bet;
	let self: User;
	let error_msg = '';
	let total_value = 0;
	let choices: string[] = [];
	let values: number[] = [];
	let remaining_time = 0;
	let isYesNo = false;
	let finished = false;
	const colors = ['#2b6bc7', '#468629', '#d03542', '#d09f36'];

	if (data.success && data.bet) {
		bet = JSON.parse(data.bet);
		self = JSON.parse(data.self);
		remaining_time = new Date(bet.timelimit).getTime() - new Date().getTime();
		if (remaining_time < 0) remaining_time = 0;

		for (let index in bet.choices) {
			Object.entries(bet.choices[index]).forEach(([key, value]) => {
				total_value += value;
				choices.push(key);
				values.push(value);
			});
		}

		if (choices.length == 2 && (choices[0] == 'yes' || choices[1] == 'yes') && (choices[0] == 'no' || choices[1] == 'no')) {
			isYesNo = true;
		}
	}

	function getValueString(value: number) {
		if (value < 1000) return value;

		const value_string = value.toString();
		const value_thousand = value_string.substring(0, value_string.length - 3);
		const value_houndred = value_string.substring(value_string.length - 3, value_string.length - 2);
		return `${value_thousand},${value_houndred}k`;
	}

	function getColor(index: number) {
		if (isYesNo && choices[index] == 'yes') return '#1e9c1e';
		else if (isYesNo && choices[index] == 'no') return '#9c1e1e';
		else return colors[index];
	}

	function getChoiceCharIndex(index: number) {
		const indexChars = ['A', 'B', 'C', 'D'];
		return `${indexChars[index]}`;
	}

	function getYesNoImage(isYes: boolean) {
		if (isYes) return '/images/check.svg';
		else return '/images/cross.svg';
	}

	function getColoredYesNoImage(isYes: boolean) {
		if (isYes) return '/images/check_colored.svg';
		else return '/images/cross_colored.svg';
	}

	let selected_choice = -1;
	let choices_elements: { [id: string]: HTMLElement } = {};
	let choices_images: { [id: string]: HTMLImageElement } = {};
	function onSetYesNoChoice(index: number, isYes: boolean) {
		if (selected_choice == index) return;
		if (selected_choice != -1) {
			const last_choice = choices_elements[selected_choice];
			last_choice.style.borderColor = last_choice.style.backgroundColor;
			choices_images[selected_choice].src = getColoredYesNoImage(!isYes);
			last_choice.style.backgroundColor = 'white';
		}
		const choice = choices_elements[index];
		choice.style.backgroundColor = choice.style.color;
		choice.style.borderColor = choice.style.color;
		choices_images[index].src = getYesNoImage(isYes);

		selected_choice = index;
	}

	function onSetChoice(index: number) {
		if (selected_choice == index) return;
		if (selected_choice != -1) {
			const last_choice = choices_elements[selected_choice];
			last_choice.style.borderColor = last_choice.style.backgroundColor;
			last_choice.style.color = last_choice.style.backgroundColor;
			last_choice.style.backgroundColor = 'white';
		}

		const choice = choices_elements[index];
		choice.style.backgroundColor = choice.style.color;
		choice.style.borderColor = choice.style.color;
		choice.style.color = 'white';

		selected_choice = index;
	}

	function getTime(time: number) {
		const seconds = Math.round(time / 1000);
		return `${seconds}s`;
	}

	let interval: any;
	interval = setInterval(() => {
		if (remaining_time <= 0) {
			clearInterval(interval);
			remaining_time = 0;
			return;
		}
		remaining_time -= 1000;
	}, 1000);

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

	async function onDecision() {
		if (!bet) setErrorMessage('Bet-ID konnte nicht gefunden werden.');
		else if (selected_choice == -1) setErrorMessage('Wähle die Gewinn-Option aus.');
		else if (finished) setErrorMessage('Wette ist bereits abgeschlossen.');
		else {
			const res = await fetch('/api/bet/answer', { method: 'POST', headers: { betID: bet.id, correctChoice: selected_choice.toString() } });
			if (!res) {
				setErrorMessage('Der Server ist momentan nicht erreichbar.');
				return;
			}
			const result = await res.json();
			if (result.success) {
				finished = true;
				remaining_time = 0;
				setErrorMessage('Wette erfolgreich ausgeschüttet.', true);
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
	<h1 class="title">{bet?.question || '-'}</h1>
	<div class="bet_choices_box">
		<h2 class="bet_choices_title">Wettoptionen</h2>
		<ul class="bet_choices">
			{#each choices as choice, index}
				{#if isYesNo}
					<li class="bet_choice">
						<span class="bet_choice_yes_no" style="background-color:{getColor(index)};"> <img src={getYesNoImage(choice == 'yes')} width="25" height="25" alt={choice} /></span>{choice == 'yes'
							? 'Ja'
							: 'Nein'}
					</li>
				{:else}
					<li class="bet_choice">
						<span class="bet_choice_index" style="background-color:{getColor(index)};"><b>{getChoiceCharIndex(index)}</b></span>
						{choice}
					</li>
				{/if}
			{/each}
		</ul>
	</div>
	<ul class="stats">
		<li class="item">
			<p>Gesamtwert des Pots</p>
			<div class="line" />
			<p>{getValueString(total_value)}</p>
		</li>
		{#each choices as choice, index}
			<li class="item">
				{#if isYesNo}
					<p style="display: flex; justify-content: center; align-items: center; ">
						Anteil <img src={getYesNoImage(choice == 'yes')} alt={choice} style="background-color: {getColor(index)}; padding: 2px 2px; border-radius: 5px; margin-left: 5px;" width="20" height="20" />
					</p>
				{:else}
					<p>Anteil Option <span style="background-color: {getColor(index)}; padding: 2px 5px; border-radius: 5px;">{getChoiceCharIndex(index)}</span></p>
				{/if}
				<div class="line" />
				<p>{Math.round((values[index] / total_value) * 100) || 0}%</p>
			</li>
		{/each}
		<li class="item">
			<p>Status</p>
			<div class="line" />
			{#if finished}
				<p>Abgeschlossen</p>
			{:else}
				<p>{remaining_time > 0 ? 'Offen' : 'Geschlossen'}</p>
			{/if}
		</li>
		{#if remaining_time > 0}
			<li class="item">
				<p>Verbleibende Zeit</p>
				<div class="line" />
				<p>{getTime(remaining_time)}</p>
			</li>
		{/if}
	</ul>
	<h2 class="actions_title">Aktionen</h2>
	<ul class="actions_box">
		<li class="item" style="flex-direction: column;">
			<p style="margin-bottom: 10px;">Wähle die Gewinn-Option:</p>
			<div class="decision_choices">
				{#each choices as choice, index}
					{#if isYesNo}
						<button
							class="decision_choice decision_choice_yesno"
							on:click={() => onSetYesNoChoice(index, choice == 'yes')}
							bind:this={choices_elements[index]}
							style="color:{getColor(index)}; border-color={getColor(index)};"
							><img src={getColoredYesNoImage(choice == 'yes')} bind:this={choices_images[index]} alt={choice} width="35" height="35" /></button
						>
					{:else}
						<button class="decision_choice" on:click={() => onSetChoice(index)} bind:this={choices_elements[index]} style="color:{getColor(index)}; border-color={getColor(index)};"
							>{getChoiceCharIndex(index)}</button
						>
					{/if}
				{/each}
			</div>
			<p id="error" bind:this={error}>{error_msg}</p>
			<button class="submit" on:click={onDecision}>Wette ausschütten</button>
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

	.bet_choices_box {
		margin: 40px 0 25px 0;
	}

	.bet_choices_title {
		color: white;
		text-align: center;
		margin-bottom: 10px;
		font-size: clamp(1.2rem, 8vw, 1.4rem);
	}

	.bet_choices {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		background-color: #323232;
		border-radius: 25px;
		justify-content: center;
	}

	.bet_choice {
		float: left;
		color: white;
		margin: 15px 15px;
		cursor: default;
		min-width: 100px;
		max-width: clamp(100px, 40vw, 500px);
		display: flex;
		align-items: center;
	}

	.bet_choice_index {
		color: white;
		border-radius: 5px;
		padding: 0.2rem 0.5rem;
		margin-right: 10px;
	}

	.bet_choice_yes_no {
		color: white;
		border-radius: 5px;
		width: 25px;
		height: 25px;
		padding: 3px;
		margin-right: 10px;
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

	.decision_choices {
		width: 150px;
		display: flex;
		justify-content: space-evenly;
		color: white;
		margin: 10px 5px;
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

	.decision_choice_yesno {
		padding: 0;
		height: 45px;
		width: 45px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.submit {
		border: none;
		margin-top: 5px;
		padding: 5px 0;
		min-width: 50%;
		border-radius: 25px;
		cursor: pointer;
		font-weight: bold;
		color: white;
		background-color: #1e9c1e;
		font-size: 1rem;
	}

	.submit:hover {
		background-color: #186d18;
	}

	#error {
		text-align: center;
		color: #cd3232;
		overflow-wrap: break-word;
		width: clamp(200px, 50vw, 500px);
		margin: 5px;
	}
</style>
