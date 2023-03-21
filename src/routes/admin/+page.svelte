<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { Bet, User } from '$lib/server/database';
	import type { PageData } from './$types';

	export let data: PageData;

	let admin: User;
	let users: User[];
	let users_search: User[];
	let bets: Bet[];
	let bets_search: Bet[];
	let error_message = '';

	if (data.success && data.users && data.bets) {
		admin = JSON.parse(data.user);
		users = JSON.parse(data.users);
		bets = JSON.parse(data.bets);
		users_search = users;
		bets_search = bets;
	}

	let search_user: string;
	$: search_user, searchUser();

	function searchUser() {
		if (search_user) {
			if (search_user.toLowerCase().startsWith('@admin')) {
				users_search = users.filter((u) => u.isAdmin);
			} else if (search_user.toLowerCase().startsWith('@banned')) {
				users_search = users.filter((u) => u.isBanned);
			} else users_search = users.filter((u) => u.username.toLowerCase().includes(search_user.toLowerCase()));
		} else users_search = users;
	}

	let search_bet: string;
	$: search_bet, searchBet();

	function searchBet() {
		if (search_bet) {
			bets_search = bets.filter((b) => b.question.toLowerCase().includes(search_bet.toLowerCase()));
		} else bets_search = bets;
	}

	function bg(user: User) {
		let color = 'background-color: ;';
		if (user.isAdmin) color = 'background-color: #00ffeab6;';
		if (user.isBanned) color = 'background-color: #ff0000b6;';
		return color;
	}

	function showUser(user: User): any {
		window.location.href = `/admin/user?id=${user.id}`;
	}

	function showBet(bet: Bet) {
		window.location.href = `/admin/bet?id=${bet.id}`;
	}

	function newBet() {
		window.location.href = '/admin/newbet';
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
		<div class="container">
			<h2 class="container_title">Benutzer</h2>
			<input type="text" class="search" placeholder="Benutzer suchen..." bind:value={search_user} />
			<div class="scroler user_container">
				{#each users_search as user}
					<button class="scroler_Element" style={bg(user)} on:click={() => showUser(user)}>
						<p>{user.username}</p>
					</button>
				{/each}
			</div>
		</div>
		<div class="container">
			<h2 class="container_title">Wetten</h2>
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
		margin: 20px 0;
	}

	.containers {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-around;
		list-style: none;
	}

	.container {
		width: 45%;
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
		margin: 20px 0;
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

	@media screen and (max-width: 600px) {
		.containers {
			width: 100%;
			display: flex;
			list-style: none;
			flex-direction: column;
		}

		.container {
			width: 90%;
			margin-top: 10px;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
	}
</style>
