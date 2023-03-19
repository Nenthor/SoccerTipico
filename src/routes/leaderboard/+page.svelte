<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { Leader } from '$lib/Types';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let leaders: Leader[];
	const number_format = new Intl.NumberFormat();

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
	});

	if (data.success && data.leaders) {
		leaders = JSON.parse(data.leaders);
		if (leaders && leaders.length < 10) {
			leaders.push(...Array(10 - leaders.length).fill({ username: '-', total_points: 0 }));
		}
	}

	function getValueString(value: number) {
		if (value == 0) return '-';
		if (value < 10000) return number_format.format(value);

		const value_string = value.toString();
		const value_thousand = value_string.substring(0, value_string.length - 3);
		const value_houndred = value_string.substring(value_string.length - 3, value_string.length - 2);
		return `${value_thousand},${value_houndred}k`;
	}

	const podium_colors: string[] = ['#ffc800', '#b0b1b8', '#a78867'];
	function getStyle(index: number) {
		if (index >= podium_colors.length) return '';

		return `background-color: ${podium_colors[index]}; text-shadow: 0 0 4px #161616;`;
	}
</script>

<Navbar>
	<li>
		<a href="/dashboard" on:click|preventDefault={() => location.replace('/dashboard')}>Zurück</a>
	</li>
</Navbar>

<div class="content">
	<h1 id="leadeboard_title">Rangliste</h1>
	<div class="leader_box">
		<ul class="leader_top" id="top_leaders">
			{#each leaders as leader, index}
				<li class="leader_item">
					<div class="container rand"><p class="leader_text ranking" style={getStyle(index)}>#{index + 1}</p></div>
					<div class="container center"><h2 class="leader_text leader_name">{leader.username}</h2></div>
					<div class="container rand"><p class="leader_text">{getValueString(leader.total_points)}</p></div>
				</li>
			{/each}
		</ul>
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

	#leadeboard_title {
		width: 100%;
		text-align: center;
		color: white;
		margin: 20px 0;
	}

	.leader_box {
		width: 90%;
		align-items: center;
		justify-content: space-around;
		list-style: none;
	}

	.leader_top {
		width: 100%;
		list-style: none;
	}

	.leader_item {
		display: flex;
		align-items: center;
		min-height: 50px;
		margin-top: 10px;
		background-color: rgba(255, 255, 255, 0.091);
		border-width: 1px;
		border-style: solid;
		border-color: rgba(255, 255, 255, 0.372);
		text-align: center;
	}

	.container {
		height: 100%;
		float: left;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.rand {
		min-width: 20%;
		font-size: clamp(1rem, 4vw, 1.7rem);
	}

	.center {
		min-height: 50px;
		width: calc(60% - 4px);
		border-width: 2px;
		border-left-style: solid;
		border-right-style: solid;
		border-color: rgb(255, 255, 255);
	}

	.leader_text {
		font-size: clamp(1rem, 3vw, 1.5rem);
	}

	.ranking {
		padding: 4px 0;
		min-width: clamp(2rem, 7vw, 3rem);
		border-radius: 5px;
	}

	.leader_name {
		width: 95%;
		overflow-wrap: break-word;
		color: aqua;
	}
</style>
