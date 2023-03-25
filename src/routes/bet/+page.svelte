<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { PageData } from './$types';
	import type { Bet, User } from '$lib/Types';
	import { onMount } from 'svelte';

	export let data: PageData;

	const colors = ['#2b6bc7', '#468629', '#d03542', '#d09f36'];

	let question = '-';
	let isYesNo = false;
	let total_value = 0;
	let points: number = 0;
	let values: number[] = [];
	let choices: string[] = [];
	let timelimit: Date;
	let error_message = '';
	let bet_id = '';
	let placed_amount = 0;
	let placed_choice = -1;
	let bet_amount: number;
	let previous_amount: number;
	let selected_choice = -1;
	let choices_elements: { [id: string]: HTMLElement } = {};
	let choices_images: { [id: string]: HTMLImageElement } = {};
	let bet_state = 'Geöffnet';
	let refresh_bet_rate = false;
	let view = false;
	let bet_time: HTMLDivElement;
	let socket: WebSocket | null;
	onMount(() => {
		const port = parseInt(location.port) - 10;
		const url = `wss://${location.hostname}:${isNaN(port) ? 8070 : port}${location.pathname}${location.search}`;
		socket = new WebSocket(url);

		socket.addEventListener('close', () => (socket = null));

		socket.addEventListener('message', (message) => {
			if (!message.data) return;
			const msg: string[] = message.data.split('==');

			switch (msg[0]) {
				case 'bet_rate':
					const new_choices = JSON.parse(msg[1]);
					if (!new_choices) break;
					refresh_bet_rate = false;
					total_value = 0;
					for (let index in new_choices) {
						Object.entries(new_choices[index]).forEach(([key, value]) => {
							const new_value = parseInt(`${value}`);
							const i = choices.indexOf(key);
							if (i != -1) {
								total_value += new_value;
								values[i] = new_value;
							}
						});
					}
					values = values;
					break;
				case 'bet_timelimit':
					const new_timelimit = JSON.parse(msg[1]);
					if (!new_timelimit) break;
					timelimit = new Date(new_timelimit);
					setTimer(true);
					break;
				default:
					break;
			}
		});

		setTimer();
	});

	if (data.success && data.bet && data.user) {
		let bet: Bet = JSON.parse(data.bet);
		let user: User = JSON.parse(data.user);
		question = bet.question;
		points = user.points;
		bet_id = bet.id;
		view = data.view == 'true';
		timelimit = new Date(bet.timelimit);

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

		const placed_bet = user.bets.find((b) => b.id == bet.id);
		if (placed_bet) {
			placed_amount = placed_bet.value;
			placed_choice = placed_bet.choice;
			selected_choice = placed_choice;
		}
	}

	let bet_timeout: any;
	function setTimer(update = false) {
		if (!bet_time) return;

		let time_diff = (timelimit.getTime() - new Date().getTime()) / 1000; //difference in s
		let delay = 0;

		if (time_diff <= 0) {
			delay = 0;
			time_diff = 0;
		} else if (time_diff > 300) {
			delay = time_diff - 300;
			time_diff = 300;
		}

		if (bet_time.innerHTML) {
			bet_time.style.width = '0%';
			bet_time.style.animation = 'none';
			bet_time.innerHTML = '';
		}
		if (update) {
			setTimeout(() => {
				bet_time.innerHTML = `<div><style>@keyframes bet_timer { from { transform: translateX(-${100 - (time_diff / 300) * 100}%); } to { transform: translateX(-100%); } }</style></div>`;
				bet_time.style.width = '100%';
				bet_time.style.animation = `bet_timer ${time_diff}s linear ${delay}s 1 normal forwards`;
			}, 1);
		} else {
			bet_time.innerHTML = `<div><style>@keyframes bet_timer { from { transform: translateX(-${100 - (time_diff / 300) * 100}%); } to { transform: translateX(-100%); } }</style></div>`;
			bet_time.style.width = '100%';
			bet_time.style.animation = `bet_timer ${time_diff}s linear ${delay}s 1 normal forwards`;
		}

		const remaining_time = timelimit.getTime() - new Date().getTime();
		if (remaining_time <= 0) {
			bet_state = 'Geschlossen';
		} else {
			if (bet_timeout) clearTimeout(bet_timeout);
			bet_timeout = setTimeout(() => {
				bet_state = 'Geschlossen';
			}, remaining_time);
		}
	}

	function getColor(index: number) {
		if (isYesNo && choices[index] == 'yes') return '#1e9c1e';
		else if (isYesNo && choices[index] == 'no') return '#9c1e1e';
		else return colors[index];
	}

	function getValueString(value: number) {
		if (value < 1000) return value;

		const value_string = value.toString();
		const value_thousand = value_string.substring(0, value_string.length - 3);
		const value_houndred = value_string.substring(value_string.length - 3, value_string.length - 2);
		return `${value_thousand},${value_houndred}k`;
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

	function validateAmount(element: HTMLInputElement, value: number) {
		return {
			update(value: number) {
				if (bet_amount < parseInt(element.min) || bet_amount > parseInt(element.max)) {
					bet_amount = previous_amount;
					setErrorMessage(`Maximal Wert von ${element.max} überschritten.`);
				}
				if (bet_amount > points) {
					previous_amount = bet_amount;
					bet_amount = points;
					setErrorMessage(`Kontostand von ${getValueString(points)} überschritten.`);
				} else {
					previous_amount = bet_amount;
					bet_amount = value;
				}
			}
		};
	}

	let timeout: any;
	let error_element: HTMLElement;
	function setErrorMessage(msg: string, success = false) {
		if (timeout) clearTimeout(timeout);
		error_message = msg;
		if (success) error_element.style.color = '#32cd32';
		else error_element.style.color = '#cd3232';

		timeout = setTimeout(() => (error_message = ''), 5000);
	}

	function submitBet() {
		if (selected_choice == -1) {
			setErrorMessage('Wähle zuerst eine Wettoption.');
			return;
		} else if (!bet_amount) {
			setErrorMessage('Gebe zuerst einen Wetteinsatz an.');
			return;
		} else if (bet_amount <= placed_amount) {
			setErrorMessage('Wetteinsatz kann nur erhöht werden.');
			return;
		}

		if (bet_id != '' && selected_choice != -1 && bet_amount > 0) {
			sendSubmitRequest(bet_id, selected_choice.toString(), bet_amount.toString());
		}
	}

	async function sendSubmitRequest(bet_id: string, choice: string, amount: string) {
		refresh_bet_rate = true;
		const res = await fetch(`/api/bet/set`, { method: 'POST', headers: { betId: bet_id, choice, amount } });
		if (!res) {
			setErrorMessage('Der Server ist momentan nicht erreichbar.');
			return;
		}

		const result = await res.json();

		if (result.success) {
			placed_choice = parseInt(choice);
			if (refresh_bet_rate) {
				total_value += placed_amount;
				values[placed_choice] += placed_amount;
				total_value -= placed_amount;
			}
			placed_choice = parseInt(choice);
			placed_amount = parseInt(amount);

			setErrorMessage('Wette erfolgreich abgeschlossen.', true);
		} else if (result.message) setErrorMessage(result.message);
		refresh_bet_rate = false;
	}
</script>

<Navbar>
	<li>
		<a href="/dashboard" on:click|preventDefault={() => location.replace(view ? `/admin/bet?id=${bet_id}` : '/dashboard')}>Zurück</a>
	</li>
</Navbar>

<div class="content_box">
	<h2 class={view ? 'view_title' : ''} id="bet_title">{question}</h2>
	<div class="bet_stats {view ? 'view_stats' : ''}">
		<h2 id="bet_value">Im Topf:<br /><span style="color:#ebc107; text-shadow: 0 0 3px #161616;">{getValueString(total_value)}</span></h2>
		<ul class="bet_answers" id="bet_answer_list">
			{#each values as value, index}
				<li class="bet_answer" style="flex-grow: {value / total_value}; background-color: {getColor(index)}" />
			{/each}
		</ul>
	</div>
	<div class="bet_choices_box">
		<h2 class="bet_choices_title {view ? 'view_subtitle' : ''}">Wettoptionen</h2>
		<ul class="bet_choices {view ? 'view_choices' : ''}">
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
	{#if !view}
		<div class="decision_box">
			<h2 class="decision_title">Status: {bet_state}</h2>
			<div class="decision_amount_box">
				{#if bet_state == 'Geöffnet'}
					<p class="decision_amount_title">Wähle deine Wette:</p>
				{:else}
					<p class="decision_amount_title">Abgeschlossene Wette:</p>
				{/if}
				<div class="decision_choices">
					{#if placed_choice == -1 && bet_state == 'Geöffnet'}
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
					{:else}
						{#each choices as choice, index}
							{#if isYesNo}
								{#if placed_choice == index}
									<button class="decision_choice decision_choice_yesno" bind:this={choices_elements[index]} style="background-color:{getColor(index)}; border-color:{getColor(index)}; cursor: default;"
										><img src={getYesNoImage(choice == 'yes')} bind:this={choices_images[index]} alt={choice} width="35" height="35" /></button
									>
								{:else}
									<button class="decision_choice decision_choice_yesno" bind:this={choices_elements[index]} style="background-color:#888; border-color:#646464; cursor: default;"
										><img src={getColoredYesNoImage(choice == 'yes')} bind:this={choices_images[index]} alt={choice} width="35" height="35" /></button
									>{/if}
							{:else if placed_choice == index}
								<button class="decision_choice" bind:this={choices_elements[index]} style="background-color:{getColor(index)}; color: #fff; border-color:{getColor(index)}; cursor: default;"
									>{getChoiceCharIndex(index)}</button
								>
							{:else}<button class="decision_choice" bind:this={choices_elements[index]} style="color:{getColor(index)}; background-color: #888; border-color:#646464; cursor: default;"
									>{getChoiceCharIndex(index)}</button
								>{/if}
						{/each}
					{/if}
				</div>
				{#if bet_state == 'Geöffnet'}
					<input
						type="number"
						bind:value={bet_amount}
						use:validateAmount={bet_amount}
						placeholder={placed_amount == 0 ? 'Wetteinsatz' : `${placed_amount}`}
						id="decision_amount_input"
						min="0"
						max="9999999"
					/>
				{:else}
					<p class="closed_amount">Wetteinsatz: {placed_amount}</p>
				{/if}

				{#if bet_state == 'Geöffnet'}
					<p id="error" bind:this={error_element}>{error_message}</p>
					<button class="decision_submit" on:click={submitBet}>Wette abschließen</button>
					<div class="bet_time" bind:this={bet_time} />
				{/if}
			</div>
		</div>
	{/if}
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

	#bet_title {
		color: white;
		width: 100%;
		text-align: center;
		font-size: clamp(1.1rem, 7vw, 2rem);
		margin: 10px 0 20px 0;
	}

	.bet_stats {
		width: min(750px, calc(100% - 20px));
		height: 75px;
		margin: 10px 0;
		position: relative;
		display: flex;
		align-items: center;
		align-content: center;
		border-radius: 25px;
		overflow-x: hidden;
	}

	#bet_value {
		position: absolute;
		color: white;
		width: 100%;
		text-align: center;
		font-size: clamp(1.25rem, 8vw, 1.5rem);
	}

	.bet_answers {
		width: 100%;
		height: 100%;
		list-style: none;
		display: flex;
		flex-direction: row;
		background-color: #323232;
		border-radius: 25px;
	}

	.bet_answer {
		height: 100%;
		min-width: 3px;
		flex-grow: 1;
	}

	.bet_choices_box {
		margin: 30px 10px;
		min-height: 150px;
	}

	.bet_choices_title {
		color: white;
		text-align: center;
		margin-bottom: 25px;
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
		font-size: 16px;
	}

	.decision_box {
		width: 100%;
		display: flex;
		align-items: center;
		flex-direction: column;
	}

	.decision_title {
		color: white;
		text-align: center;
		margin: 15px 0;
		font-size: clamp(1.2rem, 8vw, 1.4rem);
	}

	.decision_amount_box {
		position: relative;
		display: flex;
		align-items: center;
		flex-direction: column;
		background-color: #323232;
		width: clamp(200px, 50%, 500px);
		overflow: hidden;
		padding: 10px 25px;
		border-radius: 25px;
	}

	.decision_amount_title {
		color: white;
		margin-bottom: 5px;
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

	#decision_amount_input {
		margin-top: 10px;
		height: 25px;
		outline: none;
		width: clamp(100px, 80%, 200px);
		padding: 3px 8px;
		font-size: 1.1rem;
		text-align: center;
		border-radius: 10px;
		border: 3px solid transparent;
	}

	#decision_amount_input:focus {
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

	.decision_submit {
		margin: 15px 0 5px 0;
		padding: 7.5px 0;
		width: clamp(100px, 100%, 350px);
		border-radius: 15px;
		border: none;
		cursor: pointer;
		background-color: #398dd1;
		color: white;
		font-size: 1.05rem;
		font-weight: bold;
	}

	.decision_submit:hover {
		background-color: #1176c9;
	}

	#error {
		margin-top: 15px;
		min-height: 20px;
		text-align: center;
		color: #cd3232;
	}

	.bet_time {
		position: absolute;
		width: 0%;
		height: 5px;
		bottom: 0;
		border-radius: 25px;
		background-color: #cc1616;
	}

	.closed_amount {
		margin-top: 10px;
		height: 25px;
		min-width: clamp(100px, 80%, 200px);
		padding: 3px 8px;
		font-size: 1.1rem;
		text-align: center;
		border-radius: 10px;
		border: 3px solid transparent;
		background-color: white;
		cursor: default;
	}

	.view_title {
		font-size: clamp(2.5rem, 10vw, 3rem) !important;
	}

	.view_subtitle {
		font-size: clamp(1.5rem, 5vw, 2rem) !important;
	}

	.view_stats {
		background-color: red;
		width: min(1500px, calc(100% - 20px));
		height: 100px;
	}

	.view_stats h2 {
		font-size: 2rem !important;
	}

	.view_choices {
		font-size: 2rem;
		width: 400px;
	}

	@media screen and (max-width: 700px) {
		.bet_choices {
			grid-template-columns: repeat(1, 1fr);
		}
		.bet_choice {
			max-width: max(100px, 80vw);
		}
		.decision_amount_box {
			width: clamp(200px, 70%, 500px);
		}
	}
</style>
