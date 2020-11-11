// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: star-of-life;
//
// Script für https://scriptable.app
//
// Corona Ampel Widget. Zeigt neben der 7-Tage-Inzidenz weitere Infos zu einer Region. 
// Konfiguriert als kleines Widget. Schaltet automatisch auch in den DarkMode
//
// Die Daten sind die „Fallzahlen in Deutschland“ des Robert Koch-Institut (RKI) stehen unter 
// der Open Data Datenlizenz Deutschland – Namensnennung – Version 2.0 zur Verfügung. 
// Robert Koch-Institut (RKI), dl-de/by-2-0, https://www.govdata.de/dl-de/by-2-0
// https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html
// 
// Die Region wird gemäß JSON-Eintrag -> RKI NPGEO Corona -> Corona Landkreise -> Key = OBJECTID
// als Parameter des Widget verwendet. Hier findest du die Landkarte mit den Regionen:
// https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/917fc37a709542548cc3be077a786c17_0
// Mit einem Klick in die Karte öffnet sich eine Tabelle mit den zugehörigen Infos.
// Die benötigte OBJECTID ist der erste Eintrag der Tabelle. 
// 
// Wird keine Region vorausgewählt, wird die Region per GPS ermittelt.
// Für die Inzidenz für gesamt Deutschland kann "de" als Parameter verwendet.
//
// Script by MacSchierer, 10.11.2020, v1.3 
// Download der aktuellen Version hier: https://fckaf.de/JHj oder auf GitHub https://github.com/MacSchierer/Covid-19_Ampel

// Optionale Konfiguration
//
// Widget Theme: default = Hell & Dunkel, color = Farbig & Dunkel
const WidgetTheme = "color"    // Optionen: "default", "color"
//
// Stufen für die Grenzwerte - Ampel: Grün < 35 , Step1st Orange, Step2nd Rot, Step3rd Lila
const Step1st = 35
const Step2nd = 50
const Step3rd = 100

// Debug für Rahmen bei den einzelnen Stacks
const debugMode = false    
//
// Ab hier nichts ändern
let useGPS = false   
let hasError = false
let ErrorTxt = ""  
let MainDataURL = ""

const DateToday = new Date(Date.now()).toISOString().substring(0, 10)
const Date7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)

let NewCasesURL = (Landkreis) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=Landkreis%20%3D%20%27${Landkreis}%27%20AND%20NeuerFall%20IN(1%2C%20-1)&outFields=*&returnGeometry=false&outSR=4326&f=json&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22NeueFalle%22%7D%5D`
let NewDeathsURL = (Landkreis) => `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=Landkreis%20%3D%20%27${Landkreis}%27%20AND%20NeuerTodesfall%20IN(1%2C%20-1)&outFields=*&returnGeometry=false&outSR=4326&f=json&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlTodesfall%22%2C%22outStatisticFieldName%22%3A%22NeueTodesFalle%22%7D%5D`        
let param = args.widgetParameter 	// Abfrage des Parameters vom Widget
if (param != null && param.length > 0) {
	param = param.toLowerCase()
	if (isNaN(param) && param != "de") {
		hasError = true
		ErrorTxt += "Bitte die OBJEKTID oder DE als Parameter verwenden.\r\rBitte überprüfe den Parameter im Widget." 
	} 
	if (param == "de") {
		MainDataURL = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%C3%A4lle_in_den_Bundesl%C3%A4ndern/FeatureServer/0/query?where=1%3D1&returnGeometry=false&outStatistics=%5B%7B%27statisticType%27%3A%27sum%27%2C%27onStatisticField%27%3A%27LAN_ew_EWZ%27%2C%27outStatisticFieldName%27%3A%27EWZ%27%7D%2C%7B%27statisticType%27%3A%27sum%27%2C%27onStatisticField%27%3A%27FallZahl%27%2C%27outStatisticFieldName%27%3A%27cases%27%7D%2C%7B%27statisticType%27%3A%27sum%27%2C%27onStatisticField%27%3A%27Death%27%2C%27outStatisticFieldName%27%3A%27deaths%27%7D%2C%7B%27statisticType%27%3A%27avg%27%2C%27onStatisticField%27%3A%27cases7_bl_per_100k%27%2C%27outStatisticFieldName%27%3A%27cases7_per_100k%27%7D%2C%7B%27statisticType%27%3A%27MAX%27%2C%27onStatisticField%27%3A%27Aktualisierung%27%2C%27outStatisticFieldName%27%3A%27last_update%27%7D%5D&outFields=*&outSR=4326&f=json"
		NewCasesURL = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=%20%20NeuerFall%20IN(1%2C%20-1)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22NeueFalle%22%7D%5D&resultType=standard&cacheHint=true"
		NewDeathsURL = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?f=json&where=NeuerTodesfall%20IN(1%2C%20-1)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlTodesfall%22%2C%22outStatisticFieldName%22%3A%22NeueTodesFalle%22%7D%5D&resultType=standard&cacheHint=true"
		Cases7DaysURL = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=Meldedatum%20%3E%3D%20TIMESTAMP%20%27"+ Date7Days + "%2000%3A00%3A00%27%20AND%20Meldedatum%20%3C%3D%20TIMESTAMP%20%27" + DateToday + "%2000%3A00%3A00%27&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22%2C%22onStatisticField%22%3A%22AnzahlFall%22%2C%22outStatisticFieldName%22%3A%22DE_Falle7Tage%22%7D%5D&outFields=*&returnGeometry=false&outSR=4326&f=json"	
	}
    else {
		MainDataURL = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=OBJECTID=" + param + "&outFields=OBJECTID,GEN,BEZ,EWZ,county,last_update,cases,deaths,cases7_per_100k&returnGeometry=false&outSR=4326&f=json"	
	}
}
else {
// Keine Region vorgewählt -> GPS benutzen
	try {
		Location.setAccuracyToThreeKilometers()
		location = await Location.current()
		let GPSlon = location.longitude.toFixed(3)
		let GPSlat = location.latitude.toFixed(3)
	    MainDataURL = "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=OBJECTID,GEN,BEZ,EWZ,county,last_update,cases,deaths,cases7_per_100k&geometry=" + GPSlon + "%2C" + GPSlat + "&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&returnGeometry=false&outSR=4326&f=json"
		useGPS = true    
	} catch (e) {
		hasError = true
		ErrorTxt += "Das Widget ist nicht berechtigt deinen Standort zu verwenden. Dies kann in den Systemeinstellungen geändert werden." 
	}		
}

//
// Geräteinfos für Widgetgröße - getestet bei iPhone XS
// 
let deviceScreen = Device.screenSize()
let padding = ((deviceScreen.width - 240) /5) // Default immer kleines Widget
let widgetSize = new Size(padding + 110, padding + 110)

// Daten als JSON bei https://npgeo-corona-npgeo-de.hub.arcgis.com abfragen
let MainItems = ""
let NewCasesItems = ""
let NewDeathItems = ""
if (hasError == false) {
	MainItems = await loadItems(MainDataURL)	
	if(!MainItems || !MainItems.features || !MainItems.features.length) {
		hasError = true
		ErrorTxt += "Es konnten keine Daten zur Region gefunden werden.\r\rBitte überprüfe den Parameter im Widget."   
	}
	if (param == "de") { 
		NewCasesItems = await loadItems(NewCasesURL)	
		NewDeathsItems = await loadItems(NewDeathsURL)	
		Cases7DaysItems = await loadItems(Cases7DaysURL)	
	}
	else {
			NewCasesItems = await loadItems(NewCasesURL(SonderToURL(MainItems.features[0].attributes.county)))	
			NewDeathsItems = await loadItems(NewDeathsURL(SonderToURL(MainItems.features[0].attributes.county)))
	}
	
}
else {
	hasError = true
	ErrorTxt += "\r\rDaten konnten nicht abgerufen werden."   	
}
	

// Ausgabe aufgelaufene Fehler oder Widget
if (hasError == true) {
	let widget = errorWidget(ErrorTxt)
	Script.setWidget(widget)
	widget.presentSmall()
	Script.complete()	
} else { 
	if (config.runsInWidget || true) {
		let widget = createWidget(MainItems,widgetSize)
		Script.setWidget(widget)
		widget.presentSmall()
		Script.complete()
	}
	else {
		Script.complete()	
	}
}	

 
function createWidget(MainItems, widgetSize) {
	//
	// Daten zuordnen und egalisieren 
	//	
	let RegTyp = "Bundesrepublik"	
	let Region = "Deutschland"
	let LastUpdate = MainItems.features[0].attributes.last_update

	let NewCases = NewCasesItems.features[0].attributes.NeueFalle
		if (NewCases == null) {
			NewCases = "0"
		}
		else {
			NewCases = "+" + NewCases.toLocaleString('de-DE')	
		}		
	let NewDeaths = NewDeathsItems.features[0].attributes.NeueTodesFalle
		if (NewDeaths == null) {
			NewDeaths = "0"
		}
		else {
			NewDeaths = "+" + NewDeaths.toLocaleString('de-DE')	
		}

	if (param != "de") {
		Region = MainItems.features[0].attributes.GEN
		RegTyp = MainItems.features[0].attributes.BEZ
	}	
	if (param == "de") {
		LastUpdate = new Date(LastUpdate)
		LastUpdate = LastUpdate.toLocaleDateString('de-DE', {day: '2-digit',  month: '2-digit', year: 'numeric',  hour: '2-digit',  minute: '2-digit' }) + " Uhr" 
	}
	let Citizen = MainItems.features[0].attributes.EWZ
		Citizen = Citizen.toLocaleString('de-DE')
	let Cases = MainItems.features[0].attributes.cases.toLocaleString('de-DE')
	// bei DE ist die 7-Tages-Inzidenz der berechnete Durchschnitt der Bundesländer und weicht von der offiziellen RKI-Zahl ab
	let Cases7Per100k = MainItems.features[0].attributes.cases7_per_100k	
	// daher wird für DE die 7-Tages-Inzidenz gemäß des RKI berechnet
	if (param == "de") {
		Cases7Per100k = (100000 / MainItems.features[0].attributes.EWZ * Cases7DaysItems.features[0].attributes.DE_Falle7Tage) 
		console.log(Cases7Per100k)
	}
	
		Cases7Per100k = Cases7Per100k.toFixed(2);
	
	let Deaths = MainItems.features[0].attributes.deaths.toLocaleString('de-DE')

	//
	// Textbausteine
	//
	let SubTitleTxt = RegTyp
	let TitleTxt = Region
	// Content Left   
	let	DetailCasesTxt = new Array ("Fälle:", Cases, NewCases)
	//  Content Right
	let DetailDeathsTxt = new Array ("Tote:", Deaths, NewDeaths)
	let	InzidenzTitelTxt = "7-Tage-Inzidenz"
	let InzidenzNumberTxt = Cases7Per100k
	let FooterTxt = LastUpdate
	
	
	// Warstufen und zugehörige Farben
	let warnColor = new Array 
	if (Cases7Per100k <= Step1st) {	
		// Ampel grün: hell, dunkel, weiß
		warnColor = [new Color("#33cc33"), new Color("#007711"), new Color("#ffffff")]
	} 
	if (Cases7Per100k > Step1st && Cases7Per100k <= Step2nd ) {
		// Ampel orange: hell, dunkel, weiß
		warnColor = [new Color("#ffb200"), new Color("#ff6000"), new Color("#ffffff")]
	}	
	if (Cases7Per100k > Step2nd) {
		// Ampel rot: hell, dunkel, weiß
		warnColor = [new Color("#ff0000"), new Color("#990000"), new Color("#ffffff")]	
	}	
	if (Cases7Per100k > Step3rd) {
		// Ampel lila: hell, dunkel, weiß
		warnColor = [new Color("#9400D3"), new Color("#851684"), new Color("#ffffff")]	
	}
	
	// Theme definieren
	let myGradient = new LinearGradient()
		myGradient.locations = [0.0,1]
	
	switch(WidgetTheme) {
	// Color Theme: Farbig & Dunkel
		case "color" :			
			// Hintergründe
			ContentBGColor = Color.dynamic(new Color("#00000025"), new Color("#ffffff15"))	
			myGradient.colors = [Color.dynamic(warnColor[1], new Color("#000000")), Color.dynamic(warnColor[0], new Color("#222222"))]
			// Schriftfarben
			MainTextColor = Color.dynamic(new Color("#ffffff"), new Color("#aaaaaa"))
			SubTitelColor = Color.dynamic(new Color("#cccccc"), new Color("#cccccc"))
			TitelColor = MainTextColor
			InzidenzTitelColor = Color.dynamic(new Color("#e5e5e5"), new Color("#dddddd"))	
			InzidenzColor = Color.dynamic(warnColor[2], warnColor[0])
			FooterColor = MainTextColor			
		break
	// Default Theme: Hell & Dunkel
		case "default" :	
		default: 				
			// Hintergründe
			myGradient.colors = [Color.dynamic(new Color("#ffffff"), new Color("#000000")), Color.dynamic(new Color("#f0f0f0"), new Color("#222222"))] 
			ContentBGColor = Color.dynamic(new Color("#00000015"), new Color("#ffffff15"))	
			// Schriftfarben
			MainTextColor = Color.dynamic(new Color("#000000"), new Color("#aaaaaa"))
			SubTitelColor = Color.dynamic(new Color("#666666"), new Color("#cccccc"))
			TitelColor = Color.dynamic(MainTextColor, new Color("#dddddd"))
			InzidenzTitelColor = Color.dynamic(new Color("#555555"), new Color("#dddddd"))	
			InzidenzColor = Color.dynamic(warnColor[0], warnColor[0])
			FooterColor = Color.dynamic(MainTextColor, new Color("#ffffff"))		
	}

	//
	// Widget 
	//
	let w = new ListWidget()
	w.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000) // 60 Minuten Refresh-Intervall
	w.backgroundGradient = myGradient

	if (param == "de") {
		w.url = "https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html"
	} 
	else {
		w.url = "https://experience.arcgis.com/experience/478220a4c454480e823b17327b2bf1d4"
	} 
	
	// Widget Layout und Inhalt
	// SubTitle Stack
	let wSubTitle = w.addStack()
	wSubTitle.size = new Size(widgetSize.width,widgetSize.height*0.10)
	wSubTitle.bottomAlignContent()
	wSubTitle.addSpacer()  
		let SubTitleOut = wSubTitle.addText(SubTitleTxt)
		SubTitleOut.textColor = SubTitelColor
		SubTitleOut.font = Font.boldSystemFont(10)
		SubTitleOut.minimumScaleFactor = 0.5	
	wSubTitle.addSpacer()  
	if (useGPS == true) {
		wSubTitle.setPadding(0,16,0,4)	
		addSymbol({
			  symbol: 'mappin.and.ellipse',
			  stack: wSubTitle,
			  color: SubTitelColor,
			  size: 10,
			})	
	}	
	// Title Stack
	let wTitle = w.addStack()
	wTitle.size = new Size(widgetSize.width,widgetSize.height*0.15)
	wTitle.centerAlignContent()
	wTitle.addSpacer()	
		let TitleOut = wTitle.addText(TitleTxt)
		TitleOut.textColor = TitelColor
		TitleOut.font = Font.boldSystemFont(20)
		TitleOut.minimumScaleFactor = 0.3
	wTitle.addSpacer()	

	// Content Stack
	let wContent = w.addStack()
	wContent.size = new Size(widgetSize.width,widgetSize.height*0.65)
	wContent.backgroundColor = ContentBGColor
	wContent.cornerRadius = 4
	wContent.layoutVertically()
		// Fallzahlen Cases Stack
		let wFallZahlenCases = wContent.addStack()
		wFallZahlenCases.size = new Size(widgetSize.width,widgetSize.height*0.15)
		wFallZahlenCases.centerAlignContent()
		wFallZahlenCases.setPadding(4,6,0,6)
			let fzCasesTitelOut = wFallZahlenCases.addText(DetailCasesTxt[0])
			fzCasesTitelOut.textColor = InzidenzTitelColor
			fzCasesTitelOut.font = Font.boldSystemFont(12)
			fzCasesTitelOut.minimumScaleFactor = 0.5   
		wFallZahlenCases.addSpacer(4)	
			let fzCasesGesamtOut = wFallZahlenCases.addText(DetailCasesTxt[1])
			fzCasesGesamtOut.textColor = MainTextColor
			fzCasesGesamtOut.font = Font.boldSystemFont(12)
			fzCasesGesamtOut.minimumScaleFactor = 0.5  
		wFallZahlenCases.addSpacer(4)	
			let fzCasesNeuOut = wFallZahlenCases.addText("(" + DetailCasesTxt[2] + ")")
			fzCasesNeuOut.textColor = MainTextColor
			fzCasesNeuOut.font = Font.systemFont(8)
			fzCasesNeuOut.minimumScaleFactor = 0.5   		
		// Fallzahlen Deaths Stack
		let wFallZahlenDeaths = wContent.addStack()
		wFallZahlenDeaths.size = new Size(widgetSize.width,widgetSize.height*0.15)
		wFallZahlenDeaths.centerAlignContent()
		wFallZahlenDeaths.setPadding(0,6,0,6)
			let fzDeathsTitelOut = wFallZahlenDeaths.addText(DetailDeathsTxt[0])
			fzDeathsTitelOut.textColor = InzidenzTitelColor
			fzDeathsTitelOut.font = Font.boldSystemFont(12)
			fzDeathsTitelOut.minimumScaleFactor = 0.5   	
		wFallZahlenDeaths.addSpacer(4)	
			let fzDeathGesamtOut = wFallZahlenDeaths.addText(DetailDeathsTxt[1])
			fzDeathGesamtOut.textColor = MainTextColor
			fzDeathGesamtOut.font = Font.boldSystemFont(12)
			fzDeathGesamtOut.minimumScaleFactor = 0.5   					
		wFallZahlenDeaths.addSpacer(4)	
			let fzDeathsNeuOut = wFallZahlenDeaths.addText("(" + DetailDeathsTxt[2] + ")")
			fzDeathsNeuOut.textColor = MainTextColor
			fzDeathsNeuOut.font = Font.systemFont(8)
			fzDeathsNeuOut.minimumScaleFactor = 0.5   					
		// Inzidenz Titel Stack
		let wInzidenzTitel = wContent.addStack()
		wInzidenzTitel.size = new Size(widgetSize.width,widgetSize.height*0.15)
		wInzidenzTitel.bottomAlignContent()
		wInzidenzTitel.addSpacer()	
			let InzidenzTitelOut = wInzidenzTitel.addText(InzidenzTitelTxt)
			InzidenzTitelOut.textColor = InzidenzTitelColor
			InzidenzTitelOut.font = Font.boldSystemFont(14)
			InzidenzTitelOut.minimumScaleFactor = 0.5 
		wInzidenzTitel.addSpacer()		   
		// Inzidenz Number Stack
		let wInzidenzNumber = wContent.addStack()
		wInzidenzNumber.size = new Size(widgetSize.width,widgetSize.height*0.20)
		wInzidenzNumber.topAlignContent() 
		wInzidenzNumber.addSpacer()	
			let InzidenzNumberOut = wInzidenzNumber.addText(InzidenzNumberTxt.replace(".",","))
			InzidenzNumberOut.textColor = InzidenzColor
			InzidenzNumberOut.font = Font.boldSystemFont(24)
			InzidenzNumberOut.minimumScaleFactor = 0.5  
		wInzidenzNumber.addSpacer()		
	 
	// FooterStack
	let wFooter = w.addStack()
	wFooter.size = new Size(widgetSize.width,widgetSize.height*0.10)
	wFooter.addSpacer()
		wFooter.bottomAlignContent()  
		let FooterOut = wFooter.addText("Quelle RKI: " + FooterTxt)
		FooterOut.textColor = FooterColor
		FooterOut.font = Font.systemFont(8)
		FooterOut.minimumScaleFactor = 0.5  
	wFooter.addSpacer()
	

	// Rahmen um Stack anzeigen, DebugMode
	if (debugMode){
		wTitle.borderWidth = 0
		wSubTitle.borderWidth = 0
		
		wFallZahlenTitel.borderWidth = 1
		wFallZahlenGesamt.borderWidth = 1
		wFallZahlenNeu.borderWidth = 1
		
		wInzidenzTitel.borderWidth = 1
		wInzidenzNumber.borderWidth = 1
		wFooter.borderWidth = 0
	} 
  return w
}

//
// Error Widget
//
function errorWidget(reason){
	let w = new ListWidget()
	w.setPadding(5,5,5,5)
	let myGradient = new LinearGradient()

	w.backgroundColor = new Color("#933")
	myGradient.colors = [new Color("#990000"), new Color("#ff0000")]
	myGradient.locations = [0.0,1]
	w.backgroundGradient = myGradient
	
	
	let title = w.addText("Fehler")
	title.centerAlignText()
	title.textColor = Color.white()
	title.font = Font.semiboldSystemFont(24)
	title.minimumScaleFactor = 0.5
		let reasonText = w.addText(reason)
		reasonText.centerAlignText()
		reasonText.textColor = Color.white()
		reasonText.font = Font.semiboldSystemFont(12)
		reasonText.minimumScaleFactor = 0.5
  
  return w
}

//
// JSON holen
//
async function loadItems(APIurl) {
	let req = new Request(APIurl)
	let json = await req.loadJSON()
	return json
}

//
// SF Smbole
//
function addSymbol({
  symbol = 'applelogo',
  stack,
  color = Color.white(),
  size = 20,
  imageOpacity = 1,
}) {
  const _sym = SFSymbol.named(symbol)
  const wImg = stack.addImage(_sym.image)
  wImg.tintColor = color
  wImg.imageSize = new Size(size, size)
  wImg.containerRelativeShape = false
  wImg.imageOpacity = imageOpacity
}

//
// Umlaute und Co. für URL 
//
function SonderToURL(value){
  value = value.toLowerCase();
  value = value.replace(/ä/g, '%C3%A4')
  value = value.replace(/ö/g, '%C3%B6')
  value = value.replace(/ü/g, '%C3%BC')
  value = value.replace(/ß/g, '%C3%9F')
  value = value.replace(/ /g, '%20')
  return value;
}
