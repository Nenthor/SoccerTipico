<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { PageData } from './$types';
	import type { User, Bet, BetResult, HistoryItem } from '$lib/Types';
	import { onMount } from 'svelte';
	import { Chart, CategoryScale, LineController, LinearScale, PointElement, LineElement, Filler } from 'chart.js';

	export let data: PageData;

	let user: User;

	let placed_value = 0;
	let profit = 0;
	let open_bets: Bet[] = [];
	let closed_bets: Bet[] = [];
	let history: HistoryItem[] = [];
	const number_format = new Intl.NumberFormat();

	let socket: WebSocket | null;
	onMount(() => {
		const port = parseInt(location.port) - 10;
		const url = `wss://${location.hostname}:${isNaN(port) ? 8070 : port}${location.pathname}${location.search}`;
		socket = new WebSocket(url);

		socket.addEventListener('close', () => (socket = null));
		socket.addEventListener('error', (err) => console.error(err));

		socket.addEventListener('message', (message) => {
			if (!message.data) return;
			const msg: string[] = message.data.split('==');

			switch (msg[0]) {
				case 'bet_new':
					const new_bet: Bet = JSON.parse(msg[1]);
					if (!new_bet) break;

					if (new Date(new_bet.timelimit).getTime() > new Date().getTime()) {
						open_bets.push(new_bet);
						open_bets = open_bets;
					} else {
						closed_bets.push(new_bet);
						closed_bets = closed_bets;
					}
					break;
				case 'bet_result':
					const bet_result: BetResult = JSON.parse(msg[1]);

					const open_index = open_bets.findIndex((b) => b.id == bet_result.id);
					const closed_index = closed_bets.findIndex((b) => b.id == bet_result.id);
					if (open_index != -1) {
						open_bets.splice(open_index, 1);
						open_bets = open_bets;
					} else if (closed_index != -1) {
						closed_bets.splice(closed_index, 1);
						closed_bets = closed_bets;
					}

					const index = user.bets.findIndex((b) => b.id == bet_result.id);
					if (index != -1) {
						//User did bet
						const placed_bet = user.bets.splice(index, 1)[0];

						placed_value -= placed_bet.value;
						profit -= placed_bet.value;
						if (placed_bet.choice == bet_result.choice) {
							//User has won bet
							const winnings = Math.ceil((placed_bet.value / bet_result.bet_value) * bet_result.pot_value);
							user.points += winnings;
							profit += winnings;
						}
					}
					updateChart({ id: bet_result.id, points: profit + user.default_points });
					break;
				case 'bet_timelimit':
					const new_timelimit = JSON.parse(msg[1]);
					if (!new_timelimit || !new_timelimit.id || !new_timelimit.timelimit) break;
					const element = open_bet_elements[new_timelimit.id];
					if (element) {
						const i = open_bets.findIndex((b) => b.id == new_timelimit.id);
						if (i == -1) break;
						if (timeouts[new_timelimit.id]) clearTimeout(timeouts[new_timelimit.id]);
						element.style.width = '0%';
						element.style.animation = 'none';
						element.innerHTML = '';
						open_bets[i].timelimit = new_timelimit.timelimit;
						open_bets = open_bets;
					}
					break;
				case 'bonus':
					const bonus_str = JSON.parse(msg[1]);
					if (!bonus_str || isNaN(parseInt(bonus_str))) break;
					const bonus = parseInt(bonus_str);
					user.points += bonus;
					profit += bonus;
					updateChart({ id: 'bonus', points: profit + user.default_points });
					break;
				default:
					break;
			}
		});

		createChart();
	});

	if (data.success && data.user) {
		user = JSON.parse(data.user);
		for (const bet of user.bets) {
			placed_value += bet.value;
		}

		profit = user.points - user.default_points + placed_value;

		history = user.history;
		if (history && history.length == 1) history.push(history[0]);

		if (data.open_bets) {
			open_bets = JSON.parse(data.open_bets);
		}
		if (data.closed_bets) {
			closed_bets = JSON.parse(data.closed_bets);
		}
	}

	const date = new Date();
	date.setSeconds(date.getSeconds() + 10);

	let closed_bet_elements: { [id: string]: HTMLElement } = {};
	let open_bet_elements: { [id: string]: HTMLElement } = {};
	let timeouts: any[] = [];
	$: for (const index in open_bet_elements) {
		const element = open_bet_elements[index];
		const i = open_bets.findIndex((b) => b.id == index);
		const bet = open_bets[i];
		if (!element || !bet || element.innerHTML) continue;

		let time_diff = (new Date(bet.timelimit).getTime() - new Date().getTime()) / 1000; //difference in s
		let delay = 0;

		if (time_diff <= 0) {
			delay = 0;
			time_diff = 0;
		} else if (time_diff > 300) {
			delay = time_diff - 300;
			time_diff = 300;
		}

		element.innerHTML = `<div><style>@keyframes bet_timer_${bet.id} { from { transform: translateX(-${100 - (time_diff / 300) * 100}%); } to { transform: translateX(-100%); } }</style></div>`;
		element.style.width = '100%';
		element.style.animation = `bet_timer_${bet.id} ${time_diff}s linear ${delay}s 1 normal forwards`;

		element.parentElement?.addEventListener('click', () => {
			window.location.href = `/bet?id=${bet.id}`;
		});

		timeouts[i] = setTimeout(() => {
			element.style.width = '0%';
			element.style.animation = 'none';
			element.innerHTML = '';
			const j = open_bets.findIndex((b) => b.id == bet.id);
			if (j != -1) {
				closed_bets.push(open_bets.splice(j, 1)[0]);
				closed_bets = closed_bets; // Force Update
				open_bets = open_bets; // Force Update
			}
		}, (time_diff + delay) * 1000);
	}

	$: for (const index in closed_bet_elements) {
		const element = closed_bet_elements[index];
		const bet = closed_bets.find((e) => e.id == index);
		if (!element || !bet) continue;

		element.parentElement?.addEventListener('click', () => {
			window.location.href = `/bet?id=${bet.id}`;
		});
	}

	async function onLogout() {
		const valid = confirm('Willst du dich wirklich abmelden?');
		if (!valid) return;

		const res = await fetch(`/api/logout`, { method: 'POST' });
		if (!res) {
			console.error('Der Server ist momentan nicht erreichbar.');
			return;
		}

		const result = await res.json();

		if (result.success) {
			window.location.href = '/authentication';
		} else if (result.message) console.error(result.message);
	}

	function hasPlacedBet(bet: Bet) {
		return user.bets.find((b) => b.id == bet.id) != undefined;
	}

	let canvas: HTMLCanvasElement;

	Chart.register(CategoryScale, LineController, LinearScale, PointElement, LineElement, Filler);
	Chart.defaults.font.family = 'montserrat';
	Chart.defaults.font.weight = 'bold';

	let chart: Chart;
	function updateChart(item: HistoryItem) {
		if (chart) {
			chart.data.labels?.push(item.id);
			chart.data.datasets.forEach((dataset) => {
				dataset.data.push(item.points);
			});
			chart.update();
		}
	}

	function createChart() {
		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: history.map((row) => row.id),
				datasets: [
					{
						data: history.map((row) => row.points),
						borderColor: '#398dd1',
						pointBorderColor: 'transparent',
						pointBackgroundColor: 'transparent',
						backgroundColor: '#398dd1',
						fill: true,
						tension: 0.3
					}
				]
			},
			options: {
				aspectRatio: 3 / 2,
				responsive: true,
				scales: {
					x: {
						display: false
					}
				}
			},
			plugins: [Filler]
		});
	}
</script>

<Navbar>
	{#if user.isAdmin}
		<li><a href="/admin" on:click|preventDefault={() => location.replace('/admin')}>Admin</a></li>
	{/if}
	<li><a href="/leaderboard" on:click|preventDefault={() => location.replace('/leaderboard')}>Rangliste</a></li>
	{#if user.isAdmin}
		<li>
			<a href="/authentication" on:click|preventDefault={onLogout}>Abmelden</a>
		</li>
	{/if}
</Navbar>

<div class="content_box">
	<h2 id="dashboard_title">Portfolio von <span style="color:#3bc5e7">{user?.username || 'Anonym'}</span></h2>
	<ul class="stats">
		<li class="stats_item" id="placed_bets">
			<h3 class="stats_title">Platzierte Wetten</h3>
			<p class="stats_value" id="placed_bets_value">{number_format.format(placed_value)}</p>
		</li>
		<li class="stats_item" id="deposit">
			<h3 class="stats_title">Kontostand</h3>
			<p class="stats_value" id="deposit_value">{number_format.format(user?.points || 0)}</p>
		</li>
		<li class="stats_item" id="profit" style="background-color: {profit >= 0 ? '#1e9c1e' : '#9c1e1e'};">
			<h3 class="stats_title">Profit</h3>
			<p class="stats_value" id="profit_value">{profit >= 0 ? `+${number_format.format(profit)}` : number_format.format(profit)}</p>
		</li>
	</ul>
	<div class="bet">
		<h2 class="bet_title">Offene Wetten:</h2>
		<ul class="bet_list" id="open_bets">
			{#each open_bets as bet}
				<li class="bet_item">
					<p class="bet_item_title">{bet.question}</p>
					<div class="bet_time" bind:this={open_bet_elements[bet.id]} />
				</li>
			{/each}
		</ul>
		<span class="bet_span" />
		<h2 class="bet_title">Ausstehende Wetten:</h2>
		<ul class="bet_list">
			{#each closed_bets as bet}
				{#if hasPlacedBet(bet)}
					<li class="bet_item">
						<p class="bet_item_title">{bet.question}</p>
						<div class="bet_time" bind:this={closed_bet_elements[bet.id]} />
					</li>
				{/if}
			{/each}
		</ul>
		<span class="bet_span" />
		<h2 class="bet_title">Wettverlauf:</h2>
		<div class="bet_chart">
			<canvas bind:this={canvas} />
		</div>
	</div>
</div>

<Footer />

<style>
	.content_box {
		margin-top: 75px;
		padding: 10px 0;
		width: 100%;
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		z-index: 0;
	}
	#dashboard_title {
		width: 100%;
		text-align: center;
		color: white;
		margin: 20px 0;
	}

	.stats {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-around;
		list-style: none;
	}

	.stats_item {
		float: left;
		width: clamp(100px, 33.3vw, 400px);
		height: 150px;
		margin: 10px 5px;
		border-radius: 30px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
		cursor: default;
	}

	#placed_bets {
		background-color: #eb671a;
	}

	#deposit {
		background-color: #398dd1;
	}

	#profit {
		background-color: #1e9c1e;
	}

	.stats_title {
		text-align: center;
		color: white;
		font-size: clamp(1rem, 4vw, 1.1rem);
	}

	.stats_value {
		font-family: roboto;
		color: white;
		font-weight: bold;
		font-size: clamp(1.25rem, 3vw, 1.5rem);
	}

	.bet {
		width: calc(100% - 20px);
		min-height: 200px;
		margin: 30px 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	.bet_title {
		width: 100%;
		text-align: center;
		color: white;
		margin-top: 10px;
		margin-bottom: 20px;
	}

	.bet_span {
		margin: 30px 0;
		background-color: #555;
		width: 60%;
		height: 4px;
		border-radius: 5px;
	}

	.bet_list {
		width: clamp(100px, 80%, 1000px);
		background-color: #323232;
		padding: 5px;
		min-height: 50px;
		max-height: 500px;
		overflow-y: auto;
		list-style: none;
		border-radius: 25px;
		margin-bottom: 10px;
	}

	.bet_item {
		background-color: white;
		min-height: 50px;
		margin: 15px 0;
		padding: 3px 15px;
		border-radius: 25px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		cursor: pointer;
		color: #161616;
		word-wrap: break-word;
		transition: background-color 0.2s ease-out, color 0.2s ease-out;
		text-align: center;
		overflow-x: hidden;
	}

	.bet_item:first-child {
		margin-top: 5px;
	}

	.bet_item:last-child {
		margin-bottom: 5px;
	}

	.bet_item:hover {
		background-color: #398dd1;
		color: white;
	}

	.bet_time {
		position: absolute;
		width: 0%;
		height: 5px;
		bottom: 0;
		border-radius: 25px;
		background-color: #ee3232;
	}

	.bet_chart {
		width: min(80%, 750px);
		background-color: #323232;
		border-radius: 25px;
		aspect-ratio: 3 / 2;
		padding: 10px;
	}

	@media screen and (max-width: 600px) {
		.stats {
			flex-direction: column;
		}

		.stats_item {
			width: calc(100% - 20px);
			margin: 5px 10px;
			height: 75px;
		}

		.bet_item_title {
			width: 100%;
			margin-bottom: 5px;
		}

		.bet_item {
			flex-direction: column;
		}

		.bet_chart {
			width: calc(100% - 30px);
		}
	}
</style>
