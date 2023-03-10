<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	interface Bet {
		id: string;
		question: string;
		choices: { [key: string]: number };
		timelimit: Date;
	}

	interface User {
		userID: string;
		username: string;
		bets: string;
		points: number;
	}

	let question = '-';
	let total_value = 0;
	let values: number[] = [];
	let choices: string[] = [];

	if (data.success && data.bet && data.user) {
		let bet: Bet = JSON.parse(data.bet);
		let user: User = JSON.parse(data.user);
		question = bet.question;

		for (let index in bet.choices) {
			Object.entries(bet.choices[index]).forEach(([key, value]) => {
				total_value += value;
				choices.push(key);
				values.push(value);
			});
		}
	}

	function getColor(index: number) {
		const colors = ['#d03542', '#2b6bc7', '#d09f36', '#468629'];

		if (choices[index] == 'yes') return '#1e9c1e';
		else if (choices[index] == 'no') return '#9c1e1e';
		else return colors[index];
	}

	function getTotalValue() {
		if (total_value < 1000) return total_value;

		const value_string = total_value.toString();
		const value_thousand = value_string.substring(0, value_string.length - 3);
		const value_houndred = value_string.substring(value_string.length - 3, value_string.length - 2);
		return `${value_thousand},${value_houndred}k`;
	}
</script>

<Navbar>
	<li>
		<a href="/dashboard">Zurück</a>
	</li>
</Navbar>

<div class="content_box">
	<h2 id="bet_title">{question}</h2>
	<div class="bet_stats">
		<h2 id="bet_value">Im Topf:<br /><span style="color:#ebc107">{getTotalValue()}</span></h2>
		<ul class="bet_answers" id="bet_answer_list">
			{#each values as value, index}
				<li class="bet_answer" style="flex-grow: {value / total_value}; background-color: {getColor(index)}" />
			{/each}
		</ul>
	</div>
	<div class="bet_choices">
		<h2 class="bet_choices_title">-</h2>
	</div>
</div>

<Footer />

<style>
	.content_box {
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
		flex-grow: 1;
	}

	.bet_answer:first-child {
		border-top-left-radius: 25px;
		border-bottom-left-radius: 25px;
	}

	.bet_answer:last-child {
		border-top-right-radius: 25px;
		border-bottom-right-radius: 25px;
	}

	.bet_choices {
		width: calc(100% - 40px);
		margin: 10px 20px;
		min-height: 200px;
	}

	.bet_choices_title {
		color: white;
	}
</style>
