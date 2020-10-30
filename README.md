# Covid-19_Ampel, Ein Scriptable Widget
Ein Scriptable Widget zum Anzeigen der 7-Tage-Inzidenz und zusätzlichen Infos zu einen ausgwählten Region Deutschlands.

<img src="pic-1.jpg" width="400" /> &nbsp; <img src="pic-2.jpg" width="400" />
Auswahl der Region über den Parameter des Widgets. Alernativ per GPS ohne Parametereingabe.
<img src="pic-3.jpg" width="400" /> &nbsp; <img src="pic-4.jpg" width="400" />

## Verwendung

* Download Scriptable App für iOS Geräte - https://scriptable.app
* Download/Import der Covid-19_Ampel.js Datei nach iCloud/Scriptable
* Auf dem Homescreen ein neues kleines Scriptable Widget erstellen
* Als Widget-Parameter kann die OBJECTID der Region verwendet
* Wird kein Widget-Parameter verwendet, wird die Region per GPS ermittelt

Die Region kann gemäß JSON-Eintrag -> RKI NPGEO Corona -> Corona Landkreise -> Key = OBJECTID als Parameter des Widget ausgewählt werden.
Hier findest du die Landkarte mit den Regionen: https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/917fc37a709542548cc3be077a786c17_0
Mit einem Klick in die Karte öffnet sich eine Tabelle mit den zugehörigen Infos. Die benötigte OBJECTID ist der erste Eintrag der Tabelle. 

Das Skript ist für kleine Widgets ausgelegt und wurde auf einem iPhone Xs und SE getestet.
Auf anderen Geräten kann es ggf. zu Abweichungen in der Darstellung kommen.


## Features

* Quelle der Daten: https://npgeo-corona-npgeo-de.hub.arcgis.com
* Zeigt neben der 7-Tage-Inzidenz auch Einwohnerzahl, Anzahl der bisherigen Fälle und der Verstorbenen
* Wechselt gemäß der Geräteeinstellung automatisch in den Darkmode
* Immer Darkmode verwenden: const allwaysDark = true 
* Warnstufen: <35 Grün, >35 Orange, >50 Rot, >100 Lila 
* Freie Wahl der Region durch Eingabe des Parameters im Widget
* Wird kein Widget-Parameter verwendet, wird die Region per GPS ermittelt


## Bekannte Probleme

* Beim Umschalten des Darkmode kann es zu Verzögerunen kommen.
* Darstellungsfehler bei anderen Geräten z. B. iPad

## Changelog
v1.1 GPS Funktionalität ergänzt
v1.0 Release GitHub

## Hinweis zur Quelle und Lizenz
Die Daten sind die „Fallzahlen in Deutschland“ des Robert Koch-Institut (RKI) stehen unter der Open Data Datenlizenz Deutschland – Namensnennung – Version 2.0 zur Verfügung.
Robert Koch-Institut (RKI), dl-de/by-2-0, https://www.govdata.de/dl-de/by-2-0
https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html
