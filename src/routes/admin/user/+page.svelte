<script lang="ts">
	import Footer from '$lib/Footer.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import type { PageData } from './$types';
	import type { User } from '$lib/Types';

	export let data: PageData;
	let user: User;
	let self: User;
	let is_banned = false;
	let is_admin = false;
	let error_msg = '';
	let global_error_msg = '';
	const number_format = new Intl.NumberFormat();

	if (data.success && data.user) {
		user = JSON.parse(data.user);
		self = JSON.parse(data.self);
		is_banned = user?.isBanned || false;
		is_admin = user?.isAdmin || false;
	}

	function getState(user: User) {
		if (is_admin) return 'Admin';
		else if (is_banned) return 'Gesperrt';
		else return 'Normal';
	}

	function getProfit(user: User) {
		const profit = (user?.total_points || 0) - (user?.default_points || 0);
		return profit < 0 ? number_format.format(profit) : `+${number_format.format(profit)}`;
	}

	let new_name: string;
	async function onRename() {
		if (!new_name) setErrorMessage('Gebe einen neuen Benutzernamen an.');
		else if (new_name.split(' ').length != 2) {
			setErrorMessage('Benutzername muss aus einem Vor- und Nachnamen bestehen.');
		} else if (!user) {
			setErrorMessage('Benutzer-ID nicht gefunden.');
		} else {
			const res = await fetch('/api/user/rename', { method: 'POST', headers: { userID: user.id, username: new_name } });
			if (!res) {
				setErrorMessage('Der Server ist momentan nicht erreichbar.');
				return;
			}
			const result = await res.json();
			if (result.success) {
				user.username = new_name;
				user = user;
				new_name = '';
				setErrorMessage('Benutzername erfolgreich geändert.', true);
			} else if (result.message) setErrorMessage(result.message);
		}
	}

	async function onBan() {
		if (!user) setErrorMessage('Benutzer-ID nicht gefunden.');
		else {
			const res = await fetch('/api/user/ban', { method: 'POST', headers: { userID: user.id, unban: `${user.isBanned}` } });
			if (!res) {
				setErrorMessage('Der Server ist momentan nicht erreichbar.');
				return;
			}
			const result = await res.json();
			if (result.success) {
				user.isBanned = !user.isBanned;
				user = user;
				is_banned = user.isBanned;
				if (user.isBanned) setErrorMessage('Benutzername erfolgreich gesperrt.', true);
				else setErrorMessage('Benutzername erfolgreich entsperrt.', true);
			} else if (result.message) setErrorMessage(result.message);
		}
	}

	let bonus_points: number;
	async function onGiveAll() {
		if (!bonus_points) setGlobalErrorMessage('Gebe einen Wert an.');
		else if (bonus_points >= 10000) setGlobalErrorMessage('Bonus kann max. 9999 sein.');
		else if (bonus_points <= -10000) setGlobalErrorMessage('Bonus kann min. -9999 sein.');
		else {
			const res = await fetch('/api/user/giveall', { method: 'POST', headers: { points: bonus_points.toString() } });
			if (!res) {
				setGlobalErrorMessage('Der Server ist momentan nicht erreichbar.');
				return;
			}
			const result = await res.json();
			if (result.success) {
				if (user) {
					if (user.total_points + bonus_points < 0) user.total_points = 0;
					else user.total_points += bonus_points;
					if (user.points + bonus_points < 0) user.points = 0;
					else user.points += bonus_points;
					user = user;
				}
				setGlobalErrorMessage(`Bonus von ${bonus_points} erfolgreich an jeden verteilt.`, true);
			} else if (result.message) setGlobalErrorMessage(result.message);
		}
	}

	let error: HTMLElement;
	let timeout: any;
	function setErrorMessage(msg: string, success = false) {
		if (timeout) clearTimeout(timeout);
		error_msg = msg;
		if (success) error.style.color = '#32cd32';
		else error.style.color = '#cd3232';
		timeout = setTimeout(() => {
			error_msg = '';
		}, 5000);
	}

	let global_error: HTMLElement;
	let global_timeout: any;
	function setGlobalErrorMessage(msg: string, success = false) {
		if (global_timeout) clearTimeout(global_timeout);
		global_error_msg = msg;
		if (success) global_error.style.color = '#32cd32';
		else global_error.style.color = '#cd3232';
		global_timeout = setTimeout(() => {
			global_error_msg = '';
		}, 5000);
	}

	let is_public: boolean = data.is_public == 'true';
	async function setWebsiteState() {
		const res = await fetch('/api/user/status', { method: 'POST', headers: { status: `${!is_public}` } });
		if (!res) {
			setGlobalErrorMessage('Der Server ist momentan nicht erreichbar.');
			return;
		}
		const result = await res.json();
		if (result.success) {
			const status = is_public ? 'Öffentlich' : 'Privat';
			setGlobalErrorMessage(`Webseite wurde erfolgreich auf ${status} gesetzt.`, true);
		} else if (result.message) setGlobalErrorMessage(result.message);
	}
</script>

<Navbar>
	<li>
		<a href="/admin" on:click|preventDefault={() => location.replace('/admin')}>Zurück</a>
	</li>
</Navbar>

<div class="content_box">
	<h1 class="title">{user?.username || 'Anonym'}</h1>
	<ul class="stats">
		<li class="item">
			<p>Kontostand</p>
			<div class="line" />
			<p>{number_format.format(user?.points || 0)}</p>
		</li>
		<li class="item">
			<p>Platzierte Wetten</p>
			<div class="line" />
			<p>{number_format.format((user?.total_points || 0) - (user?.points || 0))}</p>
		</li>
		<li class="item">
			<p>Profit</p>
			<div class="line" />
			<p>{getProfit(user)}</p>
		</li>
		<li class="item">
			<p>Status</p>
			<div class="line" />
			<p>{getState(user)}</p>
		</li>
	</ul>
	{#if !is_admin || user.id == self.id}
		<h2 class="actions_title">Aktionen</h2>
		<ul class="actions_box">
			{#if user.id != self.id}
				<li class="item">
					<button class="action_ban {is_banned ? 'ban_undo' : 'ban_do'}" on:click={onBan}>Benutzer {is_banned ? 'Entsperren' : 'Sperren'}</button>
				</li>
			{/if}
			<li class="item" style="flex-direction: column;">
				<p>Benutzername ändern:</p>
				<input type="text" class="input" placeholder="Neuer Benutzername" bind:value={new_name} />
				<button class="submit" on:click={onRename}>Speichern</button>
			</li>
			<li class="item" style="margin: 0;">
				<p id="error" bind:this={error}>{error_msg}</p>
			</li>
		</ul>
	{/if}
	<h2 class="actions_title">Globale Aktionen</h2>
	<ul class="actions_box">
		<li class="item" style="flex-direction: column;">
			<p style="text-align: center;">Kontostand für <span style="color: #3bc5e7; font-weight: bold;">ALLE</span> erhöhen:</p>
			<input type="number" class="input" style="text-align: center;" placeholder="Betrag" bind:value={bonus_points} />
			<button class="submit" on:click={onGiveAll}>Senden</button>
		</li>
		<li class="item" style="flex-direction: column;">
			<p style="text-align: center;">Webseite ist Öffentlich:</p>
			<label class="switch">
				<input type="checkbox" bind:checked={is_public} on:click={setWebsiteState} />
				<span class="slider round" />
			</label>
		</li>
		<li class="item" style="margin: 0;">
			<p id="error" bind:this={global_error}>{global_error_msg}</p>
		</li>
	</ul>
</div>

<Footer />

<style>
	.content_box {
		margin-top: 75px;
		padding: 20px 0;
		width: 100%;
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		justify-content: start;
		align-items: center;
		z-index: 0;
	}

	.title {
		color: #3bc5e7;
		text-align: center;
	}

	.stats {
		margin-top: 30px;
		min-width: fit-content;
		padding: 5px 20px;
		width: clamp(200px, 75%, 750px);
		background-color: #323232;
		border-radius: 25px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
		list-style: none;
	}

	.item {
		color: white;
		width: 100%;
		margin: 10px 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.line {
		flex-grow: 1;
		height: 1px;
		border-bottom: 2px dotted #aaa;
		margin: 0 10px;
	}

	.actions_title {
		margin-top: 30px;
		color: white;
	}

	.actions_box {
		margin-top: 5px;
		min-width: fit-content;
		padding: 5px 20px;
		width: clamp(200px, 75%, 750px);
		background-color: #323232;
		border-radius: 25px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-evenly;
		list-style: none;
	}

	.action_ban {
		border: none;
		padding: 7.5px 20px;
		border-radius: 25px;
		font-size: 1rem;
		font-weight: bold;
		min-width: 50%;
		cursor: pointer;
		color: white;
	}

	.ban_do {
		background-color: #c52222;
	}

	.ban_do:hover {
		background-color: #9c1313;
	}

	.ban_undo {
		background-color: #22c522;
	}

	.ban_undo:hover {
		background-color: #139c13;
	}

	.input {
		min-width: 185px;
		width: calc(50% - 26px);
		padding: 5px 10px;
		margin: 5px 0;
		border-radius: 25px;
		border: none;
		font-size: 1rem;
		outline: none;
		border: 3px solid transparent;
	}

	.input::placeholder {
		text-align: center;
	}

	.input:focus {
		border: 3px solid #398dd1;
	}

	.submit {
		border: none;
		margin-top: 5px;
		padding: 5px 0;
		min-width: max(125px, 30%);
		border-radius: 25px;
		cursor: pointer;
		font-weight: bold;
		color: #22c522;
		background-color: white;
		font-size: 1rem;
	}

	.submit:hover {
		color: white;
		background-color: #22c522;
	}

	#error {
		text-align: center;
		color: #cd3232;
		overflow-wrap: break-word;
		width: clamp(200px, 50vw, 500px);
		margin: 3px 0;
	}

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
		margin-top: 10px;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #999;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		-webkit-transition: 0.4s;
		transition: 0.4s;
	}

	input:checked + .slider {
		background-color: #2196f3;
	}

	input:focus + .slider {
		box-shadow: 0 0 1px #2196f3;
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(26px);
		-ms-transform: translateX(26px);
		transform: translateX(26px);
	}

	/* Rounded sliders */
	.slider.round {
		border-radius: 34px;
	}

	.slider.round:before {
		border-radius: 50%;
	}
</style>
