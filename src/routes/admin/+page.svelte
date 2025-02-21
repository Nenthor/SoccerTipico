<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { Bet, Match, Team, User } from '$lib/server/database';
	import type { PageData } from './$types';
	import { Chart, CategoryScale, BarController, LinearScale, BarElement, Filler } from 'chart.js';
	import { onMount } from 'svelte';

	export let data: PageData;

	let admin: User;
	let users: User[];
	let users_search: User[];
	let bets: Bet[];
	let bets_search: Bet[];
	let teams: Team[];
	let teams_search: Team[];
	let matches: Match[];
	let matches_search: Match[];
	const command_search = ['@admin', '@banned', '@new', '@rich', '@bankrupt'];
	let is_command = false;
	let total_points = 0;

	if (data.success && data.users && data.bets && data.teams && data.matches) {
		admin = JSON.parse(data.user);
		users = JSON.parse(data.users);
		bets = JSON.parse(data.bets);
		teams = JSON.parse(data.teams);
		matches = JSON.parse(data.matches);
		users_search = users;
		bets_search = bets;
		teams_search = teams;
		matches_search = matches;

		onMount(() => {
			if (users) createChart();
		});
	}

	let search_user: string;
	$: search_user, searchUser();

	function searchUser() {
		if (search_user) {
			if (search_user.startsWith('@')) {
				is_command = true;
				if (search_user.toLowerCase().startsWith('@admin')) {
					is_command = false;
					users_search = users.filter((u) => u.isAdmin);
					const search = search_user.slice('@admin'.length).trim();
					if (search) users_search = users_search.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));
				} else if (search_user.toLowerCase().startsWith('@banned')) {
					is_command = false;
					users_search = users.filter((u) => u.isBanned);
					const search = search_user.slice('@banned'.length).trim();
					if (search) users_search = users_search.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));
				} else if (search_user.toLowerCase().startsWith('@new')) {
					is_command = false;
					users_search = [...users].sort((u1, u2) => new Date(u2.created).getTime() - new Date(u1.created).getTime());
					const search = search_user.slice('@new'.length).trim();
					if (search) users_search = users_search.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));
				} else if (search_user.toLowerCase().startsWith('@rich')) {
					is_command = false;
					users_search = [...users].sort((u1, u2) => u2.total_points - u1.total_points);
					const search = search_user.slice('@rich'.length).trim();
					if (search) users_search = users_search.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));
				} else if (search_user.toLowerCase().startsWith('@bankrupt')) {
					is_command = false;
					users_search = users.filter((u) => u.total_points == 0);
					const search = search_user.slice('@bankrupt'.length).trim();
					if (search) users_search = users_search.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));
				}
			} else {
				is_command = false;
				users_search = users.filter((u) => u.username.toLowerCase().includes(search_user.toLowerCase()));
			}
		} else {
			is_command = false;
			users_search = users;
		}
	}

	let search_bet: string;
	$: search_bet, searchBet();

	function searchBet() {
		if (search_bet) {
			bets_search = bets.filter((b) => b.question.toLowerCase().includes(search_bet.toLowerCase()));
		} else bets_search = bets;
	}

	let search_team: string;
	$: search_team, searchTeam();

	function searchTeam() {
		if (search_team) {
			teams_search = teams.filter((t) => t.name.toLowerCase().includes(search_team.toLowerCase()));
		} else teams_search = teams;
	}

	let search_match: string;
	$: search_match, searchMatch();

	function searchMatch() {
		if (search_match) {
			matches_search = matches.filter((m) => {
				return m.team1?.name.toLowerCase().includes(search_match.toLowerCase()) || m.team2?.name.toLowerCase().includes(search_match.toLowerCase());
			});
		} else matches_search = matches;
	}

	function bg(user: User) {
		let color = 'background-color: ;';
		if (user.isAdmin) color = 'background-color: #00ffeab6;';
		if (user.isBanned) color = 'background-color: #ff0000b6;';
		return color;
	}

	function getValueString(value: number) {
		if (value < 1000) return value;

		const value_string = value.toString();
		const value_thousand = value_string.substring(0, value_string.length - 3);
		const value_houndred = value_string.substring(value_string.length - 3, value_string.length - 2);
		return `${value_thousand},${value_houndred}k`;
	}

	function showUser(user: User): any {
		window.location.href = `/admin/user?id=${user.id}`;
	}

	function showTeam(team: Team) {
		window.location.href = `/admin/team?id=${team.id}`;
	}

	function showMatch(match: Match) {
		window.location.href = `/admin/match?id=${match.id}`;
	}

	function showBet(bet: Bet) {
		window.location.href = `/admin/bet?id=${bet.id}`;
	}

	function newBet() {
		window.location.href = '/admin/newbet';
	}

	function newTeam() {
		window.location.href = `/admin/newteam`;
	}

	function newMatch() {
		window.location.href = `/admin/newmatch`;
	}

	let canvas: HTMLCanvasElement;

	Chart.register(CategoryScale, BarController, LinearScale, BarElement, Filler);
	Chart.defaults.font.family = 'montserrat';
	Chart.defaults.font.weight = 'bold';

	let chart: Chart;
	function createChart() {
		const points_distribution = [
			{ label: '= 0', max_value: 1, amount: 0 },
			{ label: '< 0,5k', max_value: 500, amount: 0 },
			{ label: '< 1k', max_value: 1000, amount: 0 },
			{ label: '= 1k', max_value: 1001, amount: 0 },
			{ label: '< 1,5k', max_value: 1500, amount: 0 },
			{ label: '< 2k', max_value: 2000, amount: 0 },
			{ label: '< 2,5k', max_value: 2500, amount: 0 },
			{ label: '< 3k', max_value: 3000, amount: 0 },
			{ label: '> 3k', max_value: Number.MAX_VALUE, amount: 0 }
		];

		for (const user of users) {
			total_points += user.total_points;
			if (user.isAdmin || user.isBanned) continue;
			const i = points_distribution.findIndex((d) => user.total_points < d.max_value);
			if (i != -1) points_distribution[i].amount++;
		}

		chart = new Chart(canvas, {
			type: 'bar',
			data: {
				labels: points_distribution.map((row) => row.label),
				datasets: [
					{
						data: points_distribution.map((row) => row.amount),
						borderColor: 'transparent',
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
				responsive: true
			},
			plugins: [Filler]
		});
	}
</script>

<Navbar>
	<li><a href="/leaderboard">Rangliste</a></li>
	<li>
		<a href="/dashboard">Dashboard</a>
	</li>
</Navbar>

<div class="content">
	<h1 id="admin_title">Adminpanel von <span style="color:#3bc5e7">{admin?.username || 'Anonym'}</span></h1>
	<div class="containers">
		<div class="container_box">
			<div class="container">
				<h2 class="container_title">Benutzer ({users_search.length})</h2>
				<input type="text" class="search" placeholder="Benutzer suchen..." bind:value={search_user} />
				<div class="scroler user_container">
					{#if is_command}
						{#each command_search as command}
							<button class="scroler_Element" on:click={() => (search_user = command)}>
								<p>{command}</p>
							</button>
						{/each}
					{:else}
						{#each users_search as user}
							<button class="scroler_Element" style={bg(user)} on:click={() => showUser(user)}>
								<p>{user.username}</p>
							</button>
						{/each}
					{/if}
				</div>
			</div>
		</div>
		<div class="container_box">
			<div class="container">
				<h2 class="container_title">Wetten ({bets_search.length})</h2>
				<input type="text" class="search" placeholder="Wette suchen..." bind:value={search_bet} />
				<div class="scroler user_container">
					<button class="scroler_Element" style="background-color: #00ffeab6;" on:click={() => newBet()}>
						<div class="element_Part">Neue Wette</div>
					</button>
					{#each bets_search as bet}
						<button class="scroler_Element" on:click={() => showBet(bet)}>
							<p>{bet.question}</p>
						</button>
					{/each}
				</div>
			</div>
		</div>
		<div class="container_box">
			<div class="container">
				<h2 class="container_title">Teams ({teams_search.length})</h2>
				<input type="text" class="search" placeholder="Team suchen..." bind:value={search_team} />
				<div class="scroler user_container">
					<button class="scroler_Element" style="background-color: #00ffeab6;" on:click={() => newTeam()}>
						<div class="element_Part">Neues Team</div>
					</button>
					{#each teams_search as team}
						<button class="scroler_Element" on:click={() => showTeam(team)}>
							<p>{team.name}</p>
						</button>
					{/each}
				</div>
			</div>
		</div>
		<div class="container_box">
			<div class="container">
				<h2 class="container_title">Spiele ({matches_search.length})</h2>
				<input type="text" class="search" placeholder="Spiel suchen..." bind:value={search_match} />
				<div class="scroler user_container">
					<button class="scroler_Element" style="background-color: #00ffeab6;" on:click={() => newMatch()}>
						<div class="element_Part">Neues Spiel</div>
					</button>
					{#each matches_search as match}
						{#if match.team1 && match.team2}
							<button class="scroler_Element" style="background-color: {match.finished ? '' : '#169916'};" on:click={() => showMatch(match)}>
								<p>{match.team1.name} vs. {match.team2.name}</p>
							</button>
						{/if}
					{/each}
				</div>
			</div>
		</div>
	</div>
	<br />
	<div class="view_box">
		<a class="view" href="/panel?id=1" on:click|preventDefault={() => location.replace(`/panel?id=1`)}>Bildschirm 1</a>
		<a class="view" href="/panel?id=2" on:click|preventDefault={() => location.replace(`/panel?id=2`)}>Bildschirm 2</a>
	</div>
	<br />
	<h2 class="container_title">Kapitalverteilung</h2>
	<p class="container_subtitle">Insgesamt: {getValueString(total_points)}</p>
	<div class="bet_chart">
		<canvas bind:this={canvas} />
	</div>
</div>

<Footer />

<style>
	.content {
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

	#admin_title {
		width: 100%;
		text-align: center;
		color: white;
		margin-bottom: 20px;
	}

	.containers {
		max-width: 1220px;
		width: calc(100% - 20px);
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
		padding: 0 10px;
	}

	.container_box {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.container {
		max-width: 600px;
		width: 100%;
		height: 60vh;
		background-color: black;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.container_title {
		width: 100%;
		text-align: center;
		color: white;
		margin: 20px 0 5px 0;
	}

	.container_subtitle {
		width: 100%;
		text-align: center;
		color: #999;
		font-style: italic;
		font-size: 0.85rem;
		margin: 2px 0 10px 0;
	}

	.search {
		width: 60%;
		padding: 5px 10px;
		margin-bottom: 5px;
		border-radius: 25px;
		border: none;
		font-size: 1rem;
		outline: none;
		border: 3px solid transparent;
	}

	.search::placeholder {
		text-align: center;
	}

	.search:focus {
		border: 3px solid #398dd1;
	}

	.user_container {
		width: 100%;
		margin-bottom: 10px;
	}

	.scroler {
		height: calc(100% - 69px);
		overflow-y: scroll;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.scroler_Element {
		min-height: 50px;
		width: 90%;
		margin-top: 10px;
		background-color: rgba(255, 255, 255, 0.221);
		color: rgb(255, 255, 255);
		font-size: clamp(1rem, 3vw, 1.3rem);
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 5px;
		border: none;
		cursor: pointer;
	}

	.bet_chart {
		width: min(80%, 750px);
		background-color: #323232;
		border-radius: 25px;
		aspect-ratio: 3 / 2;
		padding: 10px;
	}

	.view_box {
		color: white;
		width: min(100%, 400px);
		margin: 10px 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: row;
	}

	.view {
		border: none;
		margin-top: 5px;
		padding: 8px;
		margin: 0 10px;
		min-width: max(200px, 50%);
		border-radius: 25px;
		cursor: pointer;
		font-weight: bold;
		color: #1eb3d8;
		background-color: white;
		font-size: 1.1rem;
		text-align: center;
		text-decoration: none;
	}

	.view:hover {
		background-color: #1eb3d8;
		color: white;
	}

	@media screen and (max-width: 600px) {
		.containers {
			grid-template-columns: repeat(1, 1fr);
		}

		.bet_chart {
			width: calc(100% - 30px);
		}

		.view_box {
			flex-direction: column;
			margin: 0;
		}

		.view {
			margin: 10px;
		}
	}
</style>
