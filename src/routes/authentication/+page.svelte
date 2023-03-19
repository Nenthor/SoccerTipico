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
	const not_allowed_characters = /[ 1234567890`!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?~]/;

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
	let firstname: string;
	let lastname: string;
	let password: string;

	let errorMessage = '';

	async function onAuthentication() {
		var type = 'login';
		if (reg) type = 'register';

		if (dataIsEmpty()) return;

		const res = await fetch(`/api/${type}`, {
			method: 'POST',
			headers: { username: `${firstname} ${lastname}`, password: password }
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
		if (!firstname || firstname.trim() == '' || !lastname || lastname.trim() == '' || !password || password.trim() == '') {
			setErrorMessage('Fülle das Formular aus.');
			return true;
		}

		firstname = firstname.trim();
		lastname = lastname.trim();

		if (reg && firstname.length < 3) {
			setErrorMessage('Der Vorname muss mindestens 3 Buchstaben lang sein.');
			return true;
		} else if (reg && lastname.length < 3) {
			setErrorMessage('Der Nachname muss mindestens 3 Buchstaben lang sein.');
			return true;
		} else if (reg && not_allowed_characters.test(firstname)) {
			setErrorMessage('Kein gültiger Vorname.');
			return true;
		} else if (reg && not_allowed_characters.test(lastname)) {
			setErrorMessage('Kein gültiger Nachname.');
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
			{#if reg}
				<p class="form_description">
					Gebe deinen <span style="font-weight: bold; text-decoration-line: underline;">echten</span> Vor- und Nachnamen an, um Wetten abschließen zu können. Andernfalls könnte dein Account gesperrt werden.
				</p>
			{:else}
				<p class="form_description">Gebe deine Benutzerdaten ein, um weitere Wetten abschließen zu können.</p>
			{/if}
			<p class="form_input_text">Vornamen:</p>
			<input type="text" id="firstname" class="form_input" autocomplete="off" maxlength="15" placeholder="Vorname" bind:this={autoFocus} bind:value={firstname} />
			<br />
			<p class="form_input_text">Nachname:</p>
			<input type="text" id="lastname" class="form_input" autocomplete="off" maxlength="15" placeholder="Nachname" bind:value={lastname} />
			<br />
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
			{#if reg}
				<p class="datenschutz">
					Mit der Erstellung eines Kontos stimmst du unserer <a href="/datenschutz" on:click|preventDefault={() => location.replace('/datenschutz')}>Datenschutzerklärung</a> zu.
				</p>
			{/if}
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
		min-height: 500px;
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
		border-radius: 5px;
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
		border-radius: 25px;
	}

	#form_submit:hover {
		background-color: #ffffff3d;
		color: white;
	}

	.datenschutz {
		color: rgb(219, 219, 219);
		text-align: center;
		font-size: 0.9rem;
		margin: 10px 0;
	}

	.datenschutz a {
		text-decoration: none;
		color: #1fceec;
	}
</style>
