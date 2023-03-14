<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { User } from '$lib/server/database';
	import type { PageData } from './$types';

	export let data: PageData;

	let leaders: User[];

	if (data.success) {
		if (data.leaders) {
			leaders = JSON.parse(data.leaders);
		}
	}

	const date = new Date();
	date.setSeconds(date.getSeconds() + 10);

	let leader_elements: { [id: string]: HTMLElement } = {};
	$: for (const index in leader_elements) {
		const element = leader_elements[index];
		const leader = leaders.find((e) => e.id == index);
		if (!element || !leader) continue;
	}
</script>

<Navbar>
	<li>
		<a href="/dashboard">Zurück</a>
	</li>
</Navbar>

<div class="content">
	<h1 id="leadeboard_title">Rangliste</h1>
	<div class="leader_box">
		<ul class="leader_top" id="top_leaders">
			{#each leaders as leader}
				<li class="leader_item">
					<div class="container rand"><p class="leader_text">{leaders.indexOf(leader) + 1}. Platz</p></div>
					<div class="container center"><h2 class="leader_text" id="leader_name">{leader.username}</h2></div>
					<div class="container rand"><p class="leader_text">{leader.points}</p></div>
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
		height: 50px;
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
	}

	.rand {
		width: 20%;
		font-size: clamp(0.5rem, 4vw, 1.7rem);
	}

	.center {
		width: calc(60% - 4px);
		border-width: 2px;
		border-left-style: solid;
		border-right-style: solid;
		border-color: rgb(255, 255, 255);
	}

	.leader_text {
		margin: auto;
		font-size: clamp(0.5rem, 3vw, 1.7rem);
	}

	#leader_name {
		color: aqua;
	}
</style>
