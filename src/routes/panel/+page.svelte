<script lang="ts">
	import Leaderboard from './Leaderboard.svelte';
	import BetBar from './BetBar.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import type { Team, Match, User } from '$lib/server/database';
	import type { Bet, Leader, PanelData } from '$lib/Types';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData;

	let self: User;
	let leaders: Leader[];
	let panel_data: PanelData;
	let groups: string[] = [];
	let bet: Bet;
	let show: 'leaderboard' | 'groups' | 'standings' = 'leaderboard';

	if (data.success && data.leaders && data.panel_data) {
		self = JSON.parse(data.user);
		leaders = JSON.parse(data.leaders);
		panel_data = JSON.parse(data.panel_data);

		if (leaders && leaders.length < 10) {
			leaders.push(...Array(10 - leaders.length).fill({ username: '-', total_points: 0 }));
		}
		if (panel_data.teams) {
			for (const team of panel_data.teams) {
				if (!groups.includes(team.group)) groups.push(team.group);
			}
			groups.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
		}
		if (panel_data.bet) bet = panel_data.bet;
	}

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
				case 'update':
					panel_data = JSON.parse(msg[1]);

					if (panel_data.match_history && panel_data.match_history.length > 15) {
						panel_data.match_history = panel_data.match_history.slice(0, 15);
						panel_data = panel_data;
					}
					if (panel_data.bet) bet = panel_data.bet;
					break;
				case 'leaderboard':
					const new_leaders: Leader[] = JSON.parse(msg[1]);
					if (new_leaders && new_leaders.length < 10) {
						new_leaders.push(...Array(10 - new_leaders.length).fill({ username: '-', total_points: 0 }));
					}
					if (new_leaders) leaders = new_leaders;
					break;
				default:
					break;
			}
		});

		function nextSlide() {
			switch (show) {
				case 'leaderboard':
					show = 'groups';
					break;
				case 'groups':
					show = 'standings';
					break;
				case 'standings':
					show = 'leaderboard';
					break;
			}
		}

		setInterval(nextSlide, 30000);
	});
</script>

<!--Navbar /-->
<div class="content">
	<div class="container">
		<div class="slides">
			{#if show == 'leaderboard'}
				<div class="slide"><Leaderboard {leaders} /></div>
			{:else if show == 'groups'}
				<div class="slide">
					<h1>Gruppen</h1>
					<br />
					{#each groups as group}
						<table class="groupTable">
							<thead>
								<tr>
									<th style="width: 200px;">Gruppe {group}</th>
									<th>Spiele</th>
									<th>Torverhältnis</th>
									<th>Punkte</th>
								</tr>
							</thead>
							{#if panel_data && panel_data.teams}
								{#each panel_data.teams as team}
									{#if team.group == group}
										<tr>
											<td>{team.name}</td>
											<td>{team.lose + team.draw + team.win}</td>
											<td>{team.goal_difference}</td>
											<td>{team.win * 3 + team.draw * 1}</td>
										</tr>
									{/if}
								{/each}
							{/if}
						</table>
						<br />
					{/each}
				</div>
			{:else if show == 'standings'}
				<div class="slide">
					<h1>Ergebnisse</h1>
					<br />
					<table class="groupTable">
						<thead>
							<tr>
								<th>Manschaft 1</th>
								<th>Ergebnis</th>
								<th>Manschaft 2</th>
							</tr>
						</thead>
						{#if panel_data && panel_data.match_history}
							{#each panel_data.match_history as match}
								<tr>
									<td>{match.team1.name}</td>
									<td>{match.goals1} : {match.goals2}</td>
									<td>{match.team2.name}</td>
								</tr>
							{/each}
						{/if}
					</table>
				</div>
			{/if}
		</div>
	</div>
	<div class="container">
		<div class="parts">
			<div class="part">
				<p>
					{#if panel_data && panel_data.match}
						{panel_data.match.goals1}
					{:else}
						-
					{/if}
				</p>
				<p>:</p>
				<p>
					{#if panel_data && panel_data.match}
						{panel_data.match.goals2}
					{:else}
						-
					{/if}
				</p>
			</div>
			{#if panel_data && panel_data.bet && bet}
				<div class="part" id="dasAndereDind"><BetBar {bet} /></div>
			{/if}
		</div>
	</div>
</div>

<!--Footer /-->
<style>
	.content {
		/*margin-top: 75px;
		padding: 20px 0;*/
		width: 100%;
		background-color: #161616;
		display: flex;
		flex-grow: 1;
		justify-content: start;
		align-items: center;
		z-index: 0;
		color: #fff;
	}

	.container {
		flex-grow: 1;
		margin: 20px;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
	}

	.slides {
		position: relative;
		height: 100%;
		justify-content: center;
		overflow: hidden;
	}

	.slides div.slide {
		width: 100%;
		text-align: center;
		align-items: center;
		justify-content: center;
	}

	.groupTable {
		width: 100%;
		border-collapse: collapse;
	}

	.groupTable th, .groupTable td {
		border-color: #fff;
		border-width: 1px;
		border-style: solid;
		padding: 5px 0;
	}

	.parts {
		display: flex;
		justify-content: start;
		align-items: center;
	}

	.part {
		margin: 20px;
		flex-grow: 1;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.part > p {
		font-size: 10rem;
		width: 100%;
		text-align: center;
		font-family: roboto;
	}

	#dasAndereDind {
		height: 60vh;
	}

	@media screen and (max-width: 600px) {
		.content {
			display: grid;
			grid-template-columns: repeat(1, 1fr);
		}
	}
</style>
