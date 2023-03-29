<script lang="ts">
	import type { Bet } from '$lib/Types';

	export let bet: Bet;

	const colors = ['#2b6bc7', '#468629', '#d03542', '#d09f36'];
	let values: number[] = [];
	let choices: string[] = [];
	let total_value = 0;
	let isYesNo = false;

	$: bet, updateBet();

	function updateBet() {
		if (!bet) return;
		choices = [];
		values = [];
		total_value = 0;
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
</script>

<div class="bet_stats">
	<h2 id="bet_value">Im Topf:<br /><span style="color:#ebc107; text-shadow: 0 0 3px #161616;">{getValueString(total_value)}</span></h2>
	<ul class="bet_answers" id="bet_answer_list">
		{#each values as value, index}
			<li class="bet_answer" style="flex-grow: {value / total_value}; background-color: {getColor(index)}" />
		{/each}
	</ul>
</div>

<style>
	.bet_stats {
		min-width: 125px;
		width: 100%;
		height: min(1000px, calc(100% - 20px));
		margin: 10px 0;
		position: relative;
		display: flex;
		align-items: center;
		flex-direction: row;
		align-content: center;
		border-radius: 25px;
		overflow: hidden;
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
		flex-direction: column;
		background-color: #323232;
		border-radius: 25px;
	}

	.bet_answer {
		width: 100%;
		min-height: 3px;
		flex-grow: 1;
	}
</style>
