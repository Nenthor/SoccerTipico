<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let autoFocus: HTMLElement;
	onMount(() => {
		if (autoFocus) autoFocus.focus();
	});

	$: isRegister = $page.url.searchParams.get('type') === 'register';

	let username: string;
	let password: string;

	let errorMessage = '';

	async function onAuthentication(type: string) {
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
		} else if (isRegister && username.length < 3) {
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

<Navbar>
	<li>
		{#if isRegister}
			<a href="/authentication?type=login">Anmelden</a>
		{:else}
			<a href="/authentication?type=register">Registrieren</a>
		{/if}
	</li>
</Navbar>

<div class="content_box">
	<div class="form_frame">
		<h2 class="form_title">{isRegister ? 'Registrieren' : 'Anmelden'}</h2>
		{#if isRegister}
			<p class="form_description">Wähle einen Benutzernamen um Wetten abschließen zu können.</p>
		{:else}
			<p class="form_description">Gebe dein Benutzername und Passwort ein um weiter Wetten abschließen zu können.</p>
		{/if}
		<form id="form_box">
			<div class="form_input_box">
				<p class="form_input_text">Benutzername:</p>
				<input type="text" class="form_input" autocomplete="off" maxlength="25" bind:this={autoFocus} bind:value={username} />
			</div>
			<div class="form_input_box">
				<p class="form_input_text">Passwort:</p>
				<input type="password" class="form_input" maxlength="25" bind:value={password} />
			</div>
			<p id="form_error">{errorMessage}</p>
			{#if isRegister}
				<button id="form_submit" on:click|preventDefault={() => onAuthentication('register')}>Registrieren</button>
			{:else}
				<button id="form_submit" on:click|preventDefault={() => onAuthentication('login')}>Anmelden</button>
			{/if}
		</form>
	</div>
</div>

<Footer />

<style>
	.content_box {
		margin-top: 75px;
		padding: 20px 0;
		width: 100%;
		background-color: #161616;
		display: flex;
		flex-grow: 1;
		align-items: center;
		justify-content: center;
		z-index: 0;
	}

	.form_frame {
		position: relative;
		width: clamp(350px, 65vw, 750px);
		background-color: #323232;
		margin: 0 10px;
		border-radius: 30px;
	}

	.form_frame::before {
		content: '';
		position: absolute;
		top: -4px;
		bottom: -4px;
		left: -4px;
		right: -4px;
		background-image: linear-gradient(#3bc5e7, #398dd1);
		border-radius: 30px;
		z-index: -1;
	}

	.form_title {
		color: #3bc5e7;
		margin-top: 20px;
		text-align: center;
		text-shadow: 0 0 3px #398dd1;
	}

	.form_description {
		text-align: center;
		color: white;
		margin: 20px 10px;
	}

	#form_box {
		width: calc(100% - 20px);
		margin: 0 10px 20px 10px;
		flex-grow: 1;
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		flex-direction: column;
		color: white;
	}

	.form_input_box {
		width: calc(100% - 20px);
		margin: 10px 0;
	}

	.form_input_text {
		margin-bottom: 5px;
	}

	.form_input {
		height: 30px;
		margin-left: 10%;
		width: 80%;
		border-style: solid;
		border: 3px solid #aaa;
		border-radius: 10px;
		outline: none;
		padding: 0 5px;
	}

	.form_input:focus {
		border: 3px solid #3bc5e7;
	}

	#form_error {
		margin-top: 10px;
		height: 25px;
		text-align: center;
		color: #cd3232;
	}

	#form_submit {
		width: clamp(125px, 60%, 300px);
		height: 40px;
		border-radius: 20px;
		margin-top: 20px;
		font-size: 1.02rem;
		color: #161616;
		font-weight: bold;
		border: none;
		cursor: pointer;
	}

	#form_submit:hover {
		background-color: #3bc5e7;
		color: white;
	}
</style>
