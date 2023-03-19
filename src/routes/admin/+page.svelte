<script lang="ts">
	import Footer from "$lib/Footer.svelte";
    import Navbar from "$lib/Navbar.svelte";
	import type { Bet, User } from "$lib/server/database";
	import type { PageData } from "./$types";
	import { onMount } from 'svelte';

    export let data: PageData;

    let users: User[];
    let bets: Bet[];
    let error_message = '';

    if (data.success && data.users && data.bets){
        users = JSON.parse(data.users);
        bets = JSON.parse(data.bets);
    }

    function bg(user: User){
        let color = 'background-color: ;'
        if(user.isBanned) color = 'background-color: #ff0000b6;'
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

    let modal: HTMLDivElement;
    let modal_title: HTMLHeadElement,
        modal_username: HTMLParagraphElement,
        modal_totaluserpoints: HTMLParagraphElement,
        modal_userpoints: HTMLParagraphElement,
        modal_userisBanned: HTMLParagraphElement,
        modal_userstatebutton: HTMLButtonElement,
        modaluser: User;
        

    function showUser(user: User){
        modal.style.display = "block";
        modaluser = user;
        modal_title.textContent = modaluser.username;
        modal_username.textContent = modaluser.username;
        modal_totaluserpoints.textContent = modaluser.total_points.toString();
        modal_userpoints.textContent = modaluser.points.toString();
        modal_userisBanned.textContent = "nicht Gebannt";
        modal_userstatebutton.textContent = "Bannen";
        if(user.isBanned) {
            modal_userisBanned.textContent = "Gebannt";
            modal_userstatebutton.textContent = "Entbannen";
        }
    }

    async function banUser(){
        let res;
        if(modaluser.isBanned){
            res = await fetch('/api/user/ban', {method: 'POST', headers: {userID: modaluser.id, unban: 'true'}});
        }else{
            res = await fetch('/api/user/ban', {method: 'POST', headers: {userID: modaluser.id}});
        }
        if (!res) {
			setErrorMessage('Der Server ist momentan nicht erreichbar.');
		}else{
            const result = await res.json();
			setErrorMessage(result.message);
        }
        location.reload();
    }


    let modal_question: HTMLParagraphElement;

    function showBet(bet: Bet){
        modal.style.display = "block";
        modal_title.textContent = bet.id;
        
    }

    function hideModal(){
        modal.style.display = "none";
    }


    function wetteAufloesen(){}

    function newBet(){
        modal.style.display = "block";
        //aus eingabe feldern daten für neue Wette holen
        //neue Wette in datenbank schreiben
    }

    onMount(() => {
		modal_userstatebutton.addEventListener("click", banUser);
	});

</script>

<Navbar>
    <li><a href="/leaderboard">Rangliste</a></li>
	<li>
		<a href="/dashboard" >Dashboard</a>
	</li>
</Navbar>

<div class="content">
    <h1 id="admin_title">Adminpanel von: </h1>
    <div class="containers">
        <div class="container">
            <h2 class="container_title">Benutzer</h2>
            <div class="scroler" id="user_container">
                {#each users as user}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="scroler_Element" style={bg(user)} on:click={() => showUser(user)}>
                        <p>{user.username}</p>
                    </div>
                {/each}
            </div>
        </div>
        <div class="container">
            <h2 class="container_title">Wetten</h2>
            <div class="scroler" id="user_container">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="scroler_Element" on:click={() => newBet()}>
                    <div class="element_Part">Neue Wette</div>
                </div>
                {#each bets as bet}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="scroler_Element" on:click={() => showBet(bet)}>
                        <p>{bet.question}</p>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
<div class="modal" bind:this={modal}>
    <div class="modal-content">
        <h1 id="modal_title" bind:this={modal_title}>title</h1>
        <div class="modal_page">
            <div class="data_box">
                <h2>Name:</h2>
                <div class="line"></div>
                <p bind:this={modal_username}>name</p>
            </div>
            <div class="data_box">
                <h2>Gesamtpunktzahl:</h2>
                <div class="line"></div>
                <p bind:this={modal_totaluserpoints}>totalPoints</p>
            </div>
            <div class="data_box">
                <h2>Punktzahl:</h2>
                <div class="line"></div>
                <p bind:this={modal_userpoints}>points</p>
            </div>
            <div class="data_box">
                <h2>Status:</h2>
                <div class="line"></div>
                <p bind:this={modal_userisBanned}>state</p>
            </div>
            <div class="buttons">
                <p id="error" bind:this={error_element}>{error_message}</p>
                <button class="button" bind:this={modal_userstatebutton}></button>
                <input type="button" class="button" value="Schließen" on:click={hideModal}>
            </div>
        </div>
    </div>   
</div>

<Footer>

</Footer>

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

.containers{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    list-style: none;
}

.container{
    width: 40%;
    height: 600px;
    background-color: black;
}

.container_title{
	width: 100%;
	text-align: center;
	color: white;
	margin: 20px 0;
}

.scroler{
    height: calc(100% - 69px);
    overflow-y: scroll;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.scroler_Element{
    height: 50px;
    width: 90%;
    margin-top: 10px;
    background-color: rgba(255, 255, 255, 0.221);
    color: rgb(255, 255, 255);
    font-size: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
}

.modal {
    display: none;  /*Hidden by default */
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

.modal_page{
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

.button{
    width: 49%;
    height: 40px;
    border: none;
}
</style>