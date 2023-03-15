<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import { onMount } from 'svelte';

	//change title
	let r: HTMLButtonElement;
	let l: HTMLButtonElement;

	var reg = true;
	var bga = 'rgb(255, 255, 255, 0.0)',
		bgp = 'rgb(255, 255, 255, 0.030)',
		tca = 'rgb(255, 255, 255)',
		tcp = 'rgb(255, 255, 255, 0.25)';

	function showfstat(state: boolean) {
		autoFocus.focus();
		reg = state;
		if (reg) {
			l.style.backgroundColor = bgp;
			l.style.color = tcp;
			r.style.backgroundColor = bga;
			r.style.color = tca;
		} else {
			l.style.backgroundColor = bga;
			l.style.color = tca;
			r.style.backgroundColor = bgp;
			r.style.color = tcp;
		}
	}

	let autoFocus: HTMLElement;
	onMount(() => {
		if (autoFocus) autoFocus.focus();
		showfstat(true);
	});

	//authentication
	let username: string;
	let password: string;

	let errorMessage = '';

	async function onAuthentication() {
		var type = 'login';
		if (reg) type = 'register';

		if (dataIsEmpty()) return;

		const res = await fetch(`/api/${type}`, {
			method: 'POST',
			headers: { username: username, password: password }
		});
		if (!res) {
			setErrorMessage('Der Server ist momentan nicht erreichbar.');
			return;
		}

		const result = await res.json();
		if (result.success) {
			window.location.href = '/dashboard';
		} else if (result.message) setErrorMessage(result.message);
	}

	function dataIsEmpty() {
		if (!username || username.trim() == '' || !password || password.trim() == '') {
			setErrorMessage('Fülle das Formular aus.');
			return true;
		} else if (reg && username.length < 3) {
			setErrorMessage('Der Benutzername muss mindestens 3 Buchstaben lang sein.');
			return true;
		}
		return false;
	}

	let timeout: any;
	function setErrorMessage(msg: string) {
		if (timeout) clearTimeout(timeout);
		errorMessage = msg;
		timeout = setTimeout(() => (errorMessage = ''), 5000);
	}
</script>

<svelte:head>
	<script defer type="text/javascript" src="/background.js"></script>
</svelte:head>

<Navbar />

<div class="content" id="content_box">
	<div class="form">
		<div class="titles">
			<button class="title" bind:this={r} on:click={() => showfstat(true)}><h2>Registrieren</h2></button>
			<button class="title" bind:this={l} on:click={() => showfstat(false)}><h2>Anmelden</h2></button>
		</div>
		<form id="form_box">
			<p class="form_description">Gebe dein Benutzername und Passwort ein um weiter Wetten abschließen zu können.</p>
			<p class="form_input_text">Benutzername:</p>
			<input type="text" id="username" class="form_input" autocomplete="off" maxlength="20" placeholder="Benutzername" bind:this={autoFocus} bind:value={username} />
			<br>
			<p class="form_input_text">Passwort:</p>
			<input type="password" id="password" class="form_input" maxlength="25" placeholder="Passwort" bind:value={password} />
			<p id="form_error">{errorMessage}</p>
			<button id="form_submit" on:click|preventDefault={() => onAuthentication()}>
				{#if reg}
					Registrieren
				{:else}
					Anmelden
				{/if}
			</button>
		</form>
	</div>
</div>

<Footer />

<style>
	:global(.background) {
		display: block;
	}

	.content {
		position: relative;
		padding: 85px 0 10px 0;
		display: flex;
		flex-grow: 1;
		align-items: center;
		justify-content: center;
		z-index: 0;
	}

	.form {
		background-color: rgba(108, 108, 108, 0.053);
		backdrop-filter: blur(10px);
		box-shadow: 3px 3px rgba(0, 0, 0, 0.427), 0 0 10px 5px #8000ff17;
	}

	#form_box {
		position: relative;
		width: clamp(350px, 70vw, 500px);
		min-height: 400px;
		height: fit-content;
	}

	.titles {
		width: 100%;
		height: 60px;
	}

	.title {
		width: 50%;
		height: 100%;
		text-align: center;
		float: left;
		cursor: pointer;
		color: #ffffff;
		border: none;
	}
	
	.form_description {
		text-align: center;
		color: white;
		margin: 20px 10px;
	}

	.form_input_text {
		margin-top: 35px;
		position: relative;
		left: 10%;
		margin-bottom: 10px;
		color: #ffffff;
		font-size: 1rem;
	}

	.form_input {
		height: 40px;
		margin-left: 10%;
		width: 80%;
		background-color: #ffffff1f;
		color: #ffffff;
		font-size: 1rem;
		border: none;
		outline: none;
		padding: 0 5px;
	}

	#form_error {
		margin-top: 20px;
		min-height: 30px;
		text-align: center;
		color: #cd3232;
	}

	#form_submit {
		position: relative;
		left: 20%;
		width: clamp(125px, 60%, 300px);
		height: 40px;
		font-size: 1.02rem;
		background-color: #ffffff1f;
		color: #ffffff;
		font-weight: bold;
		border: none;
		cursor: pointer;
	}

	#form_submit:hover {
		background-color: #ffffff3d;
		color: white;
	}
</style>
