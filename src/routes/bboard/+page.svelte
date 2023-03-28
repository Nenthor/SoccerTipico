<script lang="ts">
	import Leaderboard from "$lib/Leaderboard.svelte";
	import Navbar from "$lib/Navbar.svelte";
    import Footer from "$lib/Footer.svelte";
	import type { User } from '$lib/server/database';
	import type { Leader } from '$lib/Types';
    import type { PageData } from './$types';

	export let data: PageData;

	let self: User;
	let leaders: Leader[];
	let ranking = -1;

	if (data.success && data.leaders) {
		self = JSON.parse(data.user);
		leaders = JSON.parse(data.leaders);
		ranking = parseInt(data.ranking);
		if (leaders && leaders.length < 10) {
			leaders.push(...Array(10 - leaders.length).fill({ username: '-', total_points: 0 }));
		}
	}

</script>

<Navbar></Navbar>
<div class="content">
	<div class="element" id="leaderboard">
		<Leaderboard self={self} leaders={leaders} ranking={ranking} />
	</div>
	<div class="element" >
		<div id="match">
			<div class="team_element"><h1>Team 1</h1></div>
			<div class="team_element"><h1>Team 2</h1></div>
		</div>
		<div id="wettquoten">
			<div class="element" id="wettquoten">
				<h1>Wettquoten</h1>
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
		justify-content: start;
		align-items: center;
		z-index: 0;
	}

	.element{
		margin: 10px;
		height: fit-content;
		border-radius: 10px;
		display: flex;
		flex-grow: 1;
		justify-content: start;
		align-items: center;
		text-align: center;
		color: #fff;
	}

	#leaderboard{
		background-color: #383838;
		display: flex;
		flex-grow: 1;
		flex-direction:column;
		justify-content: center;
		align-items: center;
	}

	#match{
		display: flex;
		flex-direction:column;
		justify-content: center;
		align-items: center;
		flex-grow: 1;
		
	}
	.team_element{
		width: 95%;
		margin: 10px;
		border-radius: 10px;
		background-color: #383838;
	}

	#wettquoten{
		border-radius: 10px;
		background-color: #383838;
		flex-grow: 1;
	}

	@media screen and (max-width: 600px) {
		.content {
			display: grid;
			grid-template-columns: repeat(1, 1fr);
		}
	}
</style>