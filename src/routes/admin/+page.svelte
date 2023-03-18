<script lang="ts">
	import Footer from "$lib/Footer.svelte";
    import Navbar from "$lib/Navbar.svelte";
	import type { Bet, User } from "$lib/server/database";
	import type { PageData } from "./$types";


    //####### Diese Seite darf nur von Administratoren Aufgerufen werden dürgen ########//

    export let data: PageData;

    let users: User[];
    let bets: Bet[];

    if (data.success && data.users && data.bets){
        users = JSON.parse(data.users);
        bets = JSON.parse(data.bets);
    }


    let modal: HTMLDivElement;

    function showUser(user: User){
        modal.style.display = "block";
        //Anzeigen der Informationen des jehweiligen Users muss noch implementiert werden(03:16)
    }

    function showBet(bet: Bet){
        modal.style.display = "block";
        //möglichkeit des Auflösens der Wette und ausschüttung der Gewinne
        //evtl möglichkeit daten der Wette anzeigen: Frage; Punkte für Ergebnisse(03:25)
    }

    function hideModal(){
        modal.style.display = "none";
    }

    function delUser(){}

    function wetteAufloesen(){}

    function newBet(){
        modal.style.display = "block";
        //aus eingabe feldern daten für neue Wette holen
        //neue Wette in datenbank schreiben
    }

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
                    <div class="scroler_Element" >
                        <div class="user_element" on:click={() => showUser(user)}>
                            <div class="user_element_Part">{user.username}</div>
                            <div class="user_element_Part">{user.points}</div>
                        </div>
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
                        <div class="element_Part">{bet.question}</div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
<div class="modal" bind:this={modal}>
    <div class="modal-content">
        <input type="button" value="Schließen" on:click={hideModal}>
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
    
}

.user_element{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}

.user_element_Part{
    height: 100%;
    width: 50%;
}

.element_Part{
    height: 100%;
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
    background-color: #24242492;
    backdrop-filter: blur(5px);
    margin: auto;
    padding: 20px;
}


</style>