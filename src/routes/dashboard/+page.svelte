<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { PageData } from './$types';
	import type { User, Bet } from '$lib/Types';

	export let data: PageData;

	let user: User;

	let placed_value = 0;
	let profit = 0;
	let open_bets: Bet[];
	const number_format = new Intl.NumberFormat();

	if (data.success && data.user) {
		user = JSON.parse(data.user);

		for (const bet of user.bets) {
			placed_value += bet.value;
		}

		profit = user.points - user.default_points + placed_value;

		if (data.open_bets) {
			open_bets = JSON.parse(data.open_bets);
		}
	}

	const date = new Date();
	date.setSeconds(date.getSeconds() + 10);

	let open_bet_elements: { [id: string]: HTMLElement } = {};
	$: for (const index in open_bet_elements) {
		const element = open_bet_elements[index];
		const bet = open_bets.find((e) => e.id == index);
		if (!element || !bet) continue;

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
		element.style.animation = `bet_timer_${bet.id} ${time_diff}s linear ${delay}s 1 normal forwards`;

		element.parentElement?.addEventListener('click', () => {
			window.location.href = `/bet?id=${bet.id}`;
		});

		setTimeout(() => {
			element.parentNode?.parentNode?.removeChild(element.parentNode);
		}, (time_diff + delay) * 1000);
	}

	function addBet(){
		window.location.href = `/bet?id=new`;
	}

	async function onLogout() {
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
</script>

<Navbar>
	<li><a href="/leaderboard">Rangliste</a></li>
	<li>
		<a href="/authentication" on:click|preventDefault={onLogout}>Abmelden</a>
	</li>
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
		<ul class="bet_open" id="open_bets">
			<!-- 
				{#if user.isAdmin}
				<!- - svelte-ignore a11y-click-events-have-key-events - ->
				<li class="bet_item"  on:click={addBet}>
					<p class="bet_item_title">Wette hinzufügen</p>
				</li>
			{/if} -->
			{#each open_bets as bet}
				<li class="bet_item">
					<p class="bet_item_title">{bet.question}</p>
					<div class="bet_time" bind:this={open_bet_elements[bet.id]} />
				</li>
			{/each}
		</ul>
	</div>
</div>

<Footer />

<style>
	.content_box {
		margin-top: 75px;
		padding: 20px 0;
		width: 100%;
		/*background-color: #161616;*/
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

	.bet_open {
		width: clamp(100px, 80%, 1000px);
		background-color: #323232;
		padding: 5px;
		min-height: 50px;
		max-height: 500px;
		overflow-y: auto;
		list-style: none;
		border-radius: 25px;
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
		width: 100%;
		height: 5px;
		bottom: 0;
		border-radius: 25px;
		background-color: #ee3232;
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
	}
</style>
