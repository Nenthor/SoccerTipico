<script lang="ts">
	import { fly } from 'svelte/transition';

	let isOpen = false;
	function onClick() {
		isOpen = !isOpen;
	}

	let total_width: number;
	let title_width: number;
	let list_width: number;

	$: total_width, checkNavSize();

	let isMobileMenu = false;
	function checkNavSize() {
		if (!total_width || !title_width || !list_width) return;

		if (title_width + list_width >= total_width) isMobileMenu = true;
		else isMobileMenu = false;
	}
</script>

<nav bind:clientWidth={total_width}>
	<a href="/dashboard" id="title"><h3 id="nav_title" bind:clientWidth={title_width}>SoccerTipico</h3></a>
	{#if isMobileMenu}
		<button id="nav_toggle" on:click={onClick}>
			<span class="nav_bar {isOpen ? 'nav_bar_open' : ''}" />
			<span class="nav_bar {isOpen ? 'nav_bar_open' : ''}" />
			<span class="nav_bar {isOpen ? 'nav_bar_open' : ''}" />
		</button>
		{#if isOpen}
			<ul id="nav_list_open" style="display: flex;" transition:fly={{ y: -150, duration: 1000 }} bind:clientWidth={list_width}>
				<slot />
			</ul>
		{/if}
	{:else}
		<ul id="nav_list" bind:clientWidth={list_width}>
			<slot />
		</ul>
	{/if}
</nav>

<style>
	nav {
		width: 100%;
		height: 75px;
		position: fixed;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: white;
		z-index: 1;
	}

	#title {
		text-decoration: none;
	}

	#nav_title {
		padding: 0 clamp(10px, 3vw, 40px);
		font-weight: bold;
		font-size: 1.5rem;
		letter-spacing: 0.1rem;
		color: #3bc5e7;
		text-shadow: 0 0 2px #398dd1;
		user-select: none;
	}

	#nav_list {
		list-style: none;
	}

	#nav_toggle {
		display: inline-block;
		cursor: pointer;
		margin-right: 15px;
		color: #161616;
		border: none;
		background-color: transparent;
		-webkit-tap-highlight-color: rgba(255, 255, 255, 0);
	}

	.nav_bar {
		display: block;
		width: 30px;
		height: 3px;
		background-color: #161616;
		margin: 6px 0;
		border-radius: 25px;
		transition: transform 0.3s ease-out, opacity 0.3s ease-out;
	}

	.nav_bar_open:nth-child(1) {
		transform: translateX(-5px) rotate(-45deg) translateY(12.5px);
	}

	.nav_bar_open:nth-child(2) {
		opacity: 0;
	}

	.nav_bar_open:nth-child(3) {
		transform: translateX(-5px) rotate(45deg) translateY(-12.5px);
	}

	#nav_list_open {
		display: none;
		position: fixed;
		top: 75px;
		background-color: #333;
		width: 100%;
		animation: none;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	:global(#nav_list li) {
		float: left;
		margin: 0 clamp(10px, 1vw, 15px);
		transition: transform 0.3s ease;
	}

	:global(.nav_item:hover) {
		transform: translateY(4px);
	}

	:global(#nav_list li a) {
		text-decoration: none;
		color: #161616;
		font-size: 1.25rem;
		text-align: center;
		font-weight: normal;
		transition: color 0.3s ease;
	}

	:global(#nav_list li a:hover) {
		color: #3bc5e7;
		text-shadow: none;
	}

	:global(#nav_list_open li) {
		height: fit-content;
		margin: 12.5px 0;
	}

	:global(#nav_list_open li:hover) {
		transform: none;
	}

	:global(#nav_list_open li a) {
		text-decoration: none;
		color: white;
		font-size: 1.25rem;
		transition: color 0.3s ease;
	}

	:global(#nav_list_open li a:hover) {
		color: #3bc5e7;
		text-shadow: none;
	}
</style>
