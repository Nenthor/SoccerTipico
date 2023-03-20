<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { Bet, User } from '$lib/server/database';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData;

	let admin: User;
	let users: User[];
	let bets: Bet[];
	let error_message = '';

	if (data.success && data.users && data.bets) {
		admin = JSON.parse(data.user);
		users = JSON.parse(data.users);
		bets = JSON.parse(data.bets);
	}

	function bg(user: User) {
		let color = 'background-color: ;';
		if (user.isAdmin) color = 'background-color: #00ffeab6;';
		if (user.isBanned) color = 'background-color: #ff0000b6;';
		return color;
	}

	let timeout: any;
	let error_element: HTMLElement;
	function setErrorMessage(msg: string, success = false) {
		if (timeout) clearTimeout(timeout);
		error_message = msg;
		if (success) error_element.style.color = '#32cd32';
		else error_element.style.color = '#cd3232';

		timeout = setTimeout(() => (error_message = ''), 5000);
	}

	let modal: HTMLDivElement, userpage: HTMLDivElement, betpage: HTMLDivElement, newbetpage: HTMLDivElement;
	let modal_title: HTMLHeadElement,
		modal_username: HTMLParagraphElement,
		modal_totaluserpoints: HTMLParagraphElement,
		modal_userpoints: HTMLParagraphElement,
		modal_userisBanned: HTMLParagraphElement,
		modal_userstatebutton: HTMLButtonElement,
		modaluser: User;

	function showUser(user: User) {
		modal.style.display = 'block';
		userpage.style.display = 'block';
		modaluser = user;
		modal_title.textContent = modaluser.username;
		modal_username.textContent = modaluser.username;
		modal_totaluserpoints.textContent = modaluser.total_points.toString();
		modal_userpoints.textContent = modaluser.points.toString();
		modal_userisBanned.textContent = 'nicht Gebannt';
		modal_userstatebutton.textContent = 'Bannen';
		if (user.isBanned) {
			modal_userisBanned.textContent = 'Gebannt';
			modal_userstatebutton.textContent = 'Entbannen';
		}
	}

	async function banUser() {
		let res;
		if (modaluser.isBanned) {
			res = await fetch('/api/user/ban', { method: 'POST', headers: { userID: modaluser.id, unban: 'true' } });
		} else {
			res = await fetch('/api/user/ban', { method: 'POST', headers: { userID: modaluser.id } });
		}
		if (!res) {
			setErrorMessage('Der Server ist momentan nicht erreichbar.');
		} else {
			const result = await res.json();
			setErrorMessage(result.message);
		}
		location.reload();
	}

	let modal_question: HTMLParagraphElement, modal_betstate: HTMLParagraphElement;

	let bet_values: number[] = [];
	let bet_choices: string[] = [];

	function showBet(bet: Bet) {
		modal.style.display = betpage.style.display = 'block';
		modal_title.textContent = bet.id;
		modal_question.textContent = bet.question;

		let values: number[] = [];
		let choices: string[] = [];

		for (let index in bet.choices) {
			Object.entries(bet.choices[index]).forEach(([key, value]) => {
				choices.push(key);
				values.push(value);
			});
		}

		bet_values = values;
		bet_choices = choices;

		let state = 'Geöffnet';
		const remaining_time = new Date(bet.timelimit).getTime() - new Date().getTime();
		if (remaining_time <= 0) {
			state = 'Geschlossen';
		}
		modal_betstate.textContent = state;
	}

	function wetteAufloesen() {}


	let modal_newquestion: string,
		modal_answer1: string,
		modal_answer2: string,
		modal_answer3: string,
		modal_answer4: string,
		modal_timelimit: string,
		modal_savebetbutton: HTMLButtonElement;

	function newBet() {
		modal.style.display = newbetpage.style.display = 'block';
		modal_title.textContent = 'Neu Wette';
		modal_timelimit  = "5";
	}

	async function savenewBet() {
		if(modal_newquestion && modal_answer1 && modal_answer2 && modal_timelimit){
			let newchoice1: string = '"'+modal_answer1+'"',
				newchoice2: string = ' ,"'+modal_answer2+'"',
				newchoice3: string = '',
				newchoice4: string = '';
			
			if(modal_answer3) newchoice3 = ' ,"'+modal_answer3+'"';
			if(modal_answer4) newchoice4 = ' ,"'+modal_answer4+'"';
			let newchoices = '['+newchoice1+newchoice2+newchoice3+newchoice4+']';

			const umtdate = new Date();
			if(parseInt(modal_timelimit)>10)modal_timelimit ="10";
			if(parseInt(modal_timelimit)<1)modal_timelimit ="1";
			umtdate.setMinutes(umtdate.getMinutes() + parseInt(modal_timelimit));
			umtdate.setHours(umtdate.getHours() + 2);
			const date = umtdate.toISOString();

			const res = await fetch('/api/bet/create', {method: 'POST', headers: {question: modal_newquestion, choices: newchoices, timelimit: date}});
			if (!res) {
			setErrorMessage('Der Server ist momentan nicht erreichbar.');
			return;
			}

			const result = await res.json();
			if (result.success) {
			} else if (result.message) setErrorMessage(result.message);
			location.reload();
		}else{
			setErrorMessage('da klapt aber etwas nicht guck mal wo der fehler sein könnte');
		}
	}

	function hideModal() {
		modal.style.display = userpage.style.display = betpage.style.display = newbetpage.style.display = 'none';
	}

	onMount(() => {
		modal_userstatebutton.addEventListener('click', banUser);
		modal_savebetbutton.addEventListener('click', savenewBet);
	});
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
			<div class="scroler" id="user_container">
				{#each users as user}
					<button class="scroler_Element" style={bg(user)} on:click={() => showUser(user)}>
						<p>{user.username}</p>
					</button>
				{/each}
			</div>
		</div>
		<div class="container">
			<h2 class="container_title">Wetten</h2>
			<div class="scroler" id="user_container">
				<button class="scroler_Element" on:click={() => newBet()}>
					<div class="element_Part">Neue Wette</div>
				</button>
				{#each bets as bet}
					<button class="scroler_Element" on:click={() => showBet(bet)}>
						<p>{bet.question}</p>
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
<div class="modal" bind:this={modal}>
	<div class="modal-content">
		<h1 id="modal_title" bind:this={modal_title}>title</h1>
		<div class="modal_page" bind:this={userpage}>
			<div class="data_box">
				<h2>Name:</h2>
				<div class="line" />
				<p bind:this={modal_username}>name</p>
			</div>
			<div class="data_box">
				<h2>Gesamtpunktzahl:</h2>
				<div class="line" />
				<p bind:this={modal_totaluserpoints}>totalPoints</p>
			</div>
			<div class="data_box">
				<h2>Punktzahl:</h2>
				<div class="line" />
				<p bind:this={modal_userpoints}>points</p>
			</div>
			<div class="data_box">
				<h2>Status:</h2>
				<div class="line" />
				<p bind:this={modal_userisBanned}>state</p>
			</div>
			<div class="buttons">
				<button class="button" bind:this={modal_userstatebutton} />
				<input type="button" class="button" value="Schließen" on:click={hideModal} />
			</div>
		</div>
		<div class="modal_page" bind:this={betpage}>
			<div class="data_box">
				<h2>Frage:</h2>
				<div class="line" />
				<p bind:this={modal_question} />
			</div>
			{#each bet_choices as choice, index}
				<div class="data_box">
					<h2>{choice}:</h2>
					<div class="line" />
					<p>{bet_values[index]}</p>
				</div>
			{/each}
			<div class="data_box">
				<h2>Status:</h2>
				<div class="line" />
				<p bind:this={modal_betstate}>state</p>
			</div>
			<div class="buttons">
				<button class="button">Wette beenden / Gewinne ausschütten</button>
				<input type="button" class="button" value="Schließen" on:click={hideModal} />
			</div>
		</div>
		<div class="modal_page" bind:this={newbetpage}>
			<div class="data_box">
				<h2>Frage:</h2>
				<div class="line" />
				<input class="input" type="text" name="" placeholder="Frage" bind:value={modal_newquestion}>
			</div>
			<div class="data_box">
				<h2>1.Antwort:</h2>
				<div class="line" />
				<input class="input" type="text" name="" placeholder="Antwortmöglichkeit1" bind:value={modal_answer1}>
			</div>
			<div class="data_box">
				<h2>2.Antwort:</h2>
				<div class="line" />
				<input class="input" type="text" name="" placeholder="Antwortmöglichkeit2" bind:value={modal_answer2}>
			</div>
			<div class="data_box">
				<h2>3.Antwort:</h2>
				<div class="line" />
				<input class="input" type="text" name=""placeholder="Antwortmöglichkeit3(lehrlassen wenn nicht genutzt)" bind:value={modal_answer3}>
			</div>
			<div class="data_box">
				<h2>4.Antwort:</h2>
				<div class="line" />
				<input class="input" type="text" name=""placeholder="Antwortmöglichkeit4(lehrlassen wenn nicht genutzt)" bind:value={modal_answer4}>
			</div>
			<div class="data_box">
				<h2>timelimit:</h2>
				<div class="line" />
				<input class="input" type="number" name="" min="1" max="10" bind:value={modal_timelimit}>
			</div>
			<div class="buttons">
				<button class="button" bind:this={modal_savebetbutton}>Veröffentlichen</button>
				<input type="button" class="button" value="Schließen" on:click={hideModal} />
			</div>
		</div>
		<p id="error" bind:this={error_element}>{error_message}</p>
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
		height: 600px;
		background-color: black;
		border-radius: 10px;
	}

	.container_title {
		width: 100%;
		text-align: center;
		color: white;
		margin: 20px 0;
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

	.modal {
		display: none; /*Hidden by default */
		position: fixed; /* Stay in place */
		z-index: 1; /* Sit on top */
		padding-top: 100px; /* Location of the box */
		left: 0;
		top: 0;
		width: 100%; /* Full width */
		height: 100%; /* Full height */
		overflow: auto; /* Enable scroll if needed */
	}

	.modal-content {
		width: 50%;
		height: 70%;
		background-color: #242424b6;
		backdrop-filter: blur(5px);
		margin: auto;
		padding: 20px;
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		border-radius: 5px;
		color: #fff;
		font-size: 1.5rem;
	}

	.modal_page {
		display: none;
		width: 90%;
	}

	.data_box {
		width: 100%;
		height: 80px;
		margin-top: 20px;
		display: flex;
		align-items: center;
	}

	.data_box > h2 {
		margin: 0;
	}

	.line {
		flex: 1;
		height: 1px;
		border-bottom: 2px dotted rgb(255, 255, 255);
		margin: 0 10px;
	}

	.data_box > p {
		margin: 0;
	}

	.button {
		width: 49%;
		height: 40px;
		border: none;
	}

	.input{
		width: 50%;
		height: 50%;
		font-size: 1rem;
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
		}
	}
</style>
