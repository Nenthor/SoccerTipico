# SoccerTipico

Webserver, um auf Fußballspiele zu wetten

## Installationsanleitung

**Schritt 1:**
Lade die LTS Version von Node.js von dieser [Website](https://nodejs.org/en/) herunter und installiere das Programm.

**Schritt 2:**
Lade dieses Projekt [hier](https://github.com/TheDavido/SoccerTipico/archive/refs/heads/main.zip) herunter.

**Schritt 3:**
Öffne im heruntergeladenem Ordner eine Befehlszeile.

**Schritt 4:**
Installiere alle npm Packete mit `npm install`.

**Schritt 5:**
Im Ordner `database` ist die ausführbare Datei `pocketbase` hinterlegt. Allerdings nur für linux_amd64. Sollte ein anderes Betriebssystem vorliegen, so lade die entsprechende Version von [GitHub](https://github.com/pocketbase/pocketbase/releases/) herunter und befolge die Installalationsanweisungen.

**Schritt 6:**
Starte den Datenbank-Server mit dem Befehl `./pocketbase serve --http="{LOKALE ADRESSE EINFÜGEN}:8999"`. Damit das Webinterface im privaten Netzwerk ausgeführt werden kann, muss die ip hinterlegt werden. WICHTIG: Ändere `./src/backend/data/config.json` entsprechend und ändere die ip und den port.

**Schritt 7:**
Installiere Redis. Befolge dazu diese [Anleitung](https://redis.io/docs/getting-started/installation/).

**Schritt 8:**
Kompiliere den Server mit dem Befehl `npm run build`.

**Schritt 9:**
Starte den Server mit dem Befehl `npm run start`.

**Schritt 10:**
Habe Spaß.
