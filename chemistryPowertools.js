//**********************************************
/*
PWR-CHEM_REBOOT v. 2.4
by Craig Bartle, c. 2014
craigbartle@comcast.net

Changes:
v. 1.0
06/03/14	1) Initial issue of PWR-CHEM_REBOOT, converted from Visual Basic 4.0
     		   based on PWR-CHEM from NWT, Inc.
			   Converted to procedural JavaScript

v. 1.1
06/04/14	1) Added comments and changed formatting for code readability and sustainability

v. 2.2
06/010/14	1) Converted code to an object oriented style to maintain portability and sustainability

v. 2.3
06/15/14	1) Addressed bug where the value of H+ was calculating slightly high
			2) began specificSpeciesConductivity() method 
			
v. 2.4
06/16/14	1) Completed specificSpeciesConductivity() method. This file is ready for initial release.
//**********************************************/

//**********************************************/
// GLOBAL VARIABLES
//
// These variables may need to be accessed by multiple functions
// and this is a bit of a 'cleaner' way to integrate these variables as
// opposed to passing the values from function to function.
//**********************************************/

	// Plant licensed to use this file
	var plant = "Seabrook Station";

	// Temperature globals
 	var temperature_celcius;
	var temperature_kelvin; 
	
	// molar conducatances for H+ and OH-  
	var lOH;
	var lH; // H+, CRC
	
	// Borate compounds
	var Q3;
	var Q4; // B2(OH)7--, BAES & MESMER
	var Q5; // B3(OH)10
	var QT6; // B4(OH)14
	var b1;
	var b2;
	var b3;
	var b4;
	
	// Ionic strength variables
    var hf;
    var HNO2;
    var SiO3;
    var HSiO3;
    var SO42;
    var HSO4;
    var HPO4;
    var H2PO4;
    var HCO3;
    var CO3;
    var CC1;
    var CC2;
    var CC3;
    var Li1;
    var NH4;
    var N2H5;
    var Mo1;
    var ETA1;
	
	// values used in multiple calculations
	var kWater;
	var A;
	var ConvH;
	var ConvBO;
	var Ionic;
	var OldIonic;	
	var ACoef;
	var KW;
	var H;
	var OH;	
	var Q6;
	var BO;
	var NewH;
	var Bal;
	var DBal;
	
	// species
	var speciesArray;
	var B;
	var Na;
	var F;
	var K;
	var Cl;
	var Mg;
	var NO2;
	var Ca;
	var NO3;
	var Li;
	var SO4;
	var NH3;
	var PO4;
	var N2H4;
	var SiO2;
	var Mo;
	var CO2;
	var ETA;
	var C1;
	var C2;
	var C3;
//**********************************************/
// END GLOBAL VARIABLES
//**********************************************/


//**********************************************/
// SPECIE Object Definition
//
// This is the only real 'object' defined in this script.
// Its purpose is to hold the information about a given specie in one
// place to avoid a confusing clutter of variables as in the original code 
// for PWR-CHEM written in Visual Basic 4.0 without the use of objects.
//**********************************************/
function Specie(name, concentration, molarMass, formula){
	this.name = name;
	this.concentration = parseFloat(concentration);
	this.molarMass = parseFloat(molarMass);
	this.formula = formula;
	//this.molarConcentration() = this.concentration / (1 - this.concentration * 0.000000001) / this.molarMass * Math.pow(10,-6);
}
Specie.prototype.molarConcentration = function(){
	return this.concentration / (1 - this.concentration * 0.000000001) / this.molarMass * Math.pow(10,-6);
}
Specie.prototype.setIonicStrength = function(ionicArray){
	this.ionicStrength = ionicArray;
	}
Specie.prototype.getEquilibriumConstants = function(temperature_celcius){
		var eqArray = new Array();
		switch(this.name){
			case "Propionate":
				KC3 = 0.0001475; // Glycolic, CRC
				eqArray.push(KC3);
				break;
			case "Fluoride":
				var KF = 0.000353; // HF, CRC
				eqArray.push(KF);
				break;
			case "Sulfate":
				var KS = 0.012; // H2SO4, CRC / SKOOG
				eqArray.push(KS);
				break;
			case "Phosphate":
				var K1 = (7.516 - (temperature_celcius - 25) * 0.07) * 0.001; // H3PO4,1, CRC
		        var K2 = (4.84972 + 0.08340093 * temperature_celcius - 0.0009934732 * Math.pow(temperature_celcius,2)) * 0.00000001; // H3PO4,2, CRC
				eqArray.push(K1, K2);
				break;
			case "Silica":
				var KS1 = 0.0000000002; // H2SiO3,1, CRC
				var KS2 = 0.000000000001; // H2SiO3,2, CRC
				eqArray.push(KS1, KS2);
				break;
			case "Carbon Dioxide":
				var K1CO3 = (2.60119 + 0.09542937 * temperature_celcius - 0.0008671329 * Math.pow(temperature_celcius,2)) * 0.0000001; // H2CO3,1, CRC
				var K2CO3 = 0.000000000056; // H2CO3,2, CRC
				eqArray.push(K2CO3, K2CO3);
				break;
			case "Formate":
				var KC1 = (1.6428 + 0.01016368 * temperature_celcius - 0.00020331 * Math.pow(temperature_celcius,2)) * 0.0001; // FORMIC, CRC
				eqArray.push(KC1);
				break;
			case "Acetate":
			    var KC2 = (1.66137 + 0.00813543 * temperature_celcius - 0.0001756177 * Math.pow(temperature_celcius,2)) * 0.00001; // ACETIC, CRC				return Array[lC2];
				eqArray.push(KC2);
				break;
			case "Nitrite":
				var KNO2 = 0.00051; // HNO2, SKOOG
				eqArray.push(KNO2);
				break;
			case "Lithium":
				var KLi = Math.pow(10,(-0.7532 - 0.0048 * temperature_celcius + 0.000006746 * Math.pow(temperature_celcius,2)));
				eqArray.push(KLi);
				break;
			case "Ammonia":
				var KNH3 = Math.pow(10,(-(4.791672829 - 0.002861645 * temperature_celcius + 0.00003708194 * temperature_celcius * temperature_celcius - 0.000000021604385 * Math.pow(temperature_celcius,3)))); // NH3 COBBLE
				eqArray.push(KNH3);
				break;
			case "Hydrazine":
				var KN2H4 = Math.pow(10,(-(6.21907 - 0.00918579 * temperature_celcius + 0.0000393641 * temperature_celcius * temperature_celcius - 0.0000000246853 * Math.pow(temperature_celcius,3)))); // N2H4 COBBLE
				eqArray.push(KN2H4);
				break;
			case "Morpholine":
				var KMo = Math.pow(10,(-(5.82653 - 0.0154384 * temperature_celcius + 0.000119513 * temperature_celcius * temperature_celcius - 0.000000328924 * Math.pow(temperature_celcius,3) + 0.000000000424793 * Math.pow(temperature_celcius,4)))); // MORPOLINE COBBLE
				eqArray.push(KMo);
				break;
			case "ETA":
				var KETA = Math.pow(10,(-(4.4986 - 0.0015693 * temperature_celcius + 0.000025243 * temperature_celcius * temperature_celcius))); // ETA COBBLE
				eqArray.push(KETA);
				break;
		}
		return eqArray;
	}
Specie.prototype.getMolarConductances = function(temperature_celcius){
		var conductanceArray = new Array();
		var TempTerm = (1 + (temperature_celcius - 25) * 0.02);
		switch(this.name){
			case "Boron":
				var lb1 = 39.2 * TempTerm; // B(OH)4-, NWT
				var lb2 = 33.2 * TempTerm; // B2(OH)7-, NWT
				var lb3 = 27.1 * TempTerm; // B3(OH)10-, NWT
				var lb4 = 2 * 20 * TempTerm; // B4(OH)14--, EST.
				conductanceArray.push(lb1,lb2,lb3,lb4);
				break;
			case "Fluoride":
				var lf = 54.4 * TempTerm; // F-, LANGE
				conductanceArray.push(lf);
				break;
			case "Chloride":
				var lCl = 41.2774 + 1.234343 * temperature_celcius + 0.005808502 * Math.pow(temperature_celcius,2) - 0.00001498141 * Math.pow(temperature_celcius,3); // Cl-, CRC
				conductanceArray.push(lCl);
				break;
			case "Sulfate":
				var lSO4 = 2 * (41.3729 + 1.308762 * temperature_celcius + 0.00821465 * Math.pow(temperature_celcius,2) - 0.00001978143 * Math.pow(temperature_celcius,3)); // SO4--, CRC
				var lHSO4 = 50 * TempTerm; // HSO4-, LANGE
				conductanceArray.push(lSO4, lHSO4);
				break;
			case "Phosphate":
				var lH2PO4 = 33 * TempTerm; // H2PO4-, LANGE
	            var lHPO4 = 57 * 2 * TempTerm; // HPO4--, LANGE
				conductanceArray.push(lH2PO4, lHPO4);
				break;
			case "Silica":
				var lHSiO3 = 56 * TempTerm; // HSIO3-, EST.
				var lSiO3 = 64 * TempTerm; // SIO3--, EST.
				conductanceArray.push(lHSiO3, lSiO3);
				break;
			case "Carbon Dioxide":
				var lHCO3 = 44.5 * TempTerm; // HCO3-, LANGE
				var lCO3 = 72 * 2 * TempTerm; // CO3--, LANGE
				conductanceArray.push(lHCO3, lCO3);
				break;
			case "Formate":
				var lC1 = 54.6 * TempTerm; // HCOO-, LANGE
				conductanceArray.push(lC1);
				break;
			case "Acetate":
				var lC2 = 20.5117 + 0.680196 * temperature_celcius + 0.00541356 * Math.pow(temperature_celcius,2) - 0.00001240436 * Math.pow(temperature_celcius,3); // CH3COO-, CRC
				conductanceArray.push(lC2);
				break;
			case "Propionate":
				var lC3 = 40 * TempTerm; // OHCH2C00-, EST.
				conductanceArray.push(lC3);
				break;
			case "Nitrite":
				var	lNO2 = 71.8 * TempTerm; // NO2-, LANGE
				conductanceArray.push(lNO2);
				break;
			case "Nitrate":
				var lNO3 = 40.6325 + 1.092511 * temperature_celcius + 0.004098988 * Math.pow(temperature_celcius,2) - 0.00001253312 * Math.pow(temperature_celcius,3); // NO3-, CRC
				conductanceArray.push(lNO3);
				break;
			case "Lithium":
				var lLi = 38.7 * TempTerm; // Li+, LANGE
				conductanceArray.push(lLi);
				break;
			case "Ammonia":
				var lNH4 = 40.3981 + 1.223188 * temperature_celcius + 0.005999165 * Math.pow(temperature_celcius,2) - 0.00001526403 * Math.pow(temperature_celcius,3); // NH4+, CRC
				conductanceArray.push(lNH4);
				break;
			case "Hydrazine":
				var lN2H5 = 59 * TempTerm; // N2H5+, LANGE
				conductanceArray.push(lN2H5);
				break;
			case "Morpholine":
				var lMo = 40 * TempTerm; // NH2C4H8O+, EST.
				conductanceArray.push(lMo);
				break;
			case "ETA":
				var lETA = 45 * TempTerm; // NH3C2H4OH+, EST.
				conductanceArray.push(lETA);
				break;
			case "Sodium":
				var lNa = 26.2544 + 0.846777 * temperature_celcius + 0.005770065 * Math.pow(temperature_celcius,2) - 0.00001300899 * Math.pow(temperature_celcius,3); // Na+, CRC
				conductanceArray.push(lNa);
				break;
			case "Calcium":
				var lCa = 2 * (30.2528 + 1.000752 * temperature_celcius + 0.0078587 * Math.pow(temperature_celcius,2) - 0.00001719949 * Math.pow(temperature_celcius,3)); // Ca++, CRC
				conductanceArray.push(lCa);
				break;
			case "Magnesium":
				var lMg = 53.1 * 2 * TempTerm; // MG++, LANGE
				conductanceArray.push(lMg);
				break;
			case "Potassium":
				var lK = 40.5523 + 1.2225 * temperature_celcius + 0.005948526 * Math.pow(temperature_celcius,2) - 0.00001546855 * Math.pow(temperature_celcius,3); // K+, CRC
				conductanceArray.push(lK);
				break;
		}
		return conductanceArray;
	}
//**********************************************/
// END SPECIE Object Definition
//**********************************************/

//**********************************************/
// Function Definitions
//**********************************************/

/*
Function name: specificSpeciesConductivity
		This is the entrance point for specificSpecies.html

 PRECONDITIONS
	None
 POSTCONDITIONS
	The details of the conductivity calculation are displayed on the page
 RETURN
	None
*/
function specificSpeciesConductivity(){
	// grab the values from the user form
	var initialValue = parseFloat(document.getElementById("initial_value").value);
	var finalValue = parseFloat(document.getElementById("final_value").value);
	var temperature = parseFloat(document.getElementById("temp_val").value);
	var temperatureUnits = getCheckedRadioButton("temp_unit");
	var checkedSpecie = getCheckedRadioButton("specie");
	var specieUnits = getCheckedRadioButton("units");
	
	// 1 ppm = 1,000 ppb... convert accordingly
	if(specieUnits == "ppm"){
		var multiplicationFactor = 1000;
	} 
	else{
		var multiplicationFactor = 1;
	}
	initialValue = initialValue*multiplicationFactor;
	finalValue = finalValue*multiplicationFactor;
	
	// steps between values for the output
	var step = (finalValue - initialValue) / 10;
	
	// check that final value is more than initial value
	if(initialValue > finalValue){
	alert("Initial value must be less than the final value");
	return;
	}
	
	// convert temperature, uses the temperature globals
	if(temperatureUnits == "f"){
		temperature_celcius = (temperature-32)*5/9;
	}
	else{
		temperature_celcius = temperature;
	}
	temperature_kelvin = parseFloat(temperature_celcius) + 273; 
	
	// set up the initial variables
	setInitialVariables();
	
	// initialize all species at 0 concentration...
	B = new Specie("Boron", 0, 10.8, "B");
	Na = new Specie("Sodium", 0, 23, "Na");
	F = new Specie("Fluoride", 0, 19, "F");
	K = new Specie("Potassium", 0, 39.1, "K");
	Cl = new Specie("Chloride", 0, 35.5, "Cl");
	Mg = new Specie("Magnesium", 0, 24.3, "Mg");
	NO2 = new Specie("Nitrite", 0, 46, "NO2");
	Ca = new Specie("Calcium", 0, 40, "Ca");
	NO3 = new Specie("Nitrate", 0, 62, "NO3");
	Li = new Specie("Lithium", 0, 7, "Li");
	SO4 = new Specie("Sulfate", 0, 96, "SO4");
	NH3 = new Specie("Ammonia", 0, 17, "NH3");
	PO4 = new Specie("Phosphate", 0, 95, "PO4");
	N2H4 = new Specie("Hydrazine", 0, 32, "N2H4");
	SiO2 = new Specie("Silica", 0, 60, "SiO2");
	Mo = new Specie("Morpholine", 0, 87, "C4H9NO");
	CO2 = new Specie("Carbon Dioxide", 0, 44, "CO2");
	ETA = new Specie("ETA", 0, 61, "ETA");
	C1 = new Specie("Formate", 0, 46, "HCO2");
	C2 = new Specie("Acetate", 0, 60, "C2H3O2");
	C3 = new Specie("Propionate", 0, 76, "C3H5O2");
	
	// ... then modify the selected specie to give it the proper initial concentration
	var selectedSpecie;
	switch(checkedSpecie){
		case "B":
			B.concentration = initialValue;
			selectedSpecie = B;
			break;
		case "Na":
			Na.concentration = initialValue;
			selectedSpecie = Na;
			break;
		case "F":
			F.concentration = initialValue;		
			selectedSpecie = F;
			break;
		case "K":
			K.concentration = initialValue;
			selectedSpecie = K;
			break;
		case "Cl":
			Cl.concentration = initialValue;
			selectedSpecie = Cl;
			break;
		case "Mg":
			Mg.concentration = initialValue;
			selectedSpecie = Mg;
			break;
		case "NO2":
			NO2.concentration = initialValue;
			selectedSpecie = NO2;
			break;
		case "Ca":
			Ca.concentration = initialValue;
			selectedSpecie = Ca;
			break;
		case "NO3":
			NO3.concentration = initialValue;
			selectedSpecie = NO3;
			break;
		case "Li":
			Li.concentration = initialValue;
			selectedSpecie = Li;
			break;
		case "SO4":
			SO4.concentration = initialValue;
			selectedSpecie = SO4;
			break;
		case "NH3":
			NH3.concentration = initialValue;
			selectedSpecie = NH3;
			break;
		case "PO4":
			PO4.concentration = initialValue;
			selectedSpecie = PO4;
			break;
		case "N2H4":
			N2H4.concentration = initialValue;
			selectedSpecie = N2H4;
			break;
		case "SiO2":
			SiO2.concentration = initialValue;
			selectedSpecie = SiO2;
			break;
		case "Mo":
			Mo.concentration = initialValue;
			selectedSpecie = Mo;
			break;
		case "CO2":
			CO2.concentration = initialValue;
			selectedSpecie = CO2;
			break;
		case "ETA":
			ETA.concentration = initialValue;
			selectedSpecie = ETA;
			break;
		case "Formate":
			C1.concentration = initialValue;
			selectedSpecie = C1;
			break;
		case "Acetate":
			C2.concentration = initialValue;
			selectedSpecie = C2;
			break;
		case "Propionate":
			C3.concentration = initialValue;
			selectedSpecie = C3;
			break;
	}
	speciesArray = Array(B,Na,F,K,Cl,Mg,NO2,Ca,NO3,Li,SO4,NH3,PO4,N2H4,SiO2,Mo,CO2,ETA,C1,C2,C3);
	
	// kWater and A
	kWater = getKWater(temperature_celcius);
	A = debyeHuckel(temperature_celcius);
	
	// Initial values of global variables needed for calculations
	ConvH = 0.0000001;
	ConvBO = B.molarConcentration();
	Ionic = 0;
	OldIonic = Ionic;
	
	ACoef=Math.pow(10,(A * -1 * Math.sqrt(Ionic) / (1 + Math.sqrt(Ionic))));
	KW = kWater / Math.pow(ACoef,2);
	H = Math.sqrt(KW);
	OH = H;	
	Q6 = QT6 / Math.pow(ACoef,2);
	BO = B.molarConcentration();
	
	// loop through the steps between the values and output the answers
	for(var i=initialValue;i<finalValue+(step/2);i+=step){
		selectedSpecie.concentration = i;
		setBO();
		var check = check_relationship();
		if(check = "true"){
			setIonic();
		}
		else{
			ConvBO = BO;
			ConvH = H;
		setH();
		}
	var thisph = pHCalc();
	var thiscond = conductivityCalc();
	document.input_form.output.value += "Concentration: "+i/multiplicationFactor+" "+specieUnits+" ---- Conductivity: "+thiscond+" ---- pH: "+thisph+"\n";
	}
}

/*
Function name: calculateConductivity
		This is the entrance point for conductivityPH.html
 PRECONDITIONS
	None
 POSTCONDITIONS
	The program is executed fully.
 RETURN
	None
*/
function calculateConductivity(){
	// get temperature input
 	temperature_celcius = document.input_form.temperature.value;
	temperature_kelvin = parseFloat(temperature_celcius) + 273; 
	
	setInitialVariables();

	// get array of inputs
	var inputs = document.input_form.elements['species[]'];
	
	// create objects from input array
	B = new Specie("Boron", inputs[0].value, 10.8, "B");
	Na = new Specie("Sodium", inputs[1].value, 23, "Na");
	F = new Specie("Fluoride", inputs[2].value, 19, "F");
	K = new Specie("Potassium", inputs[3].value, 39.1, "K");
	Cl = new Specie("Chloride", inputs[4].value, 35.5, "Cl");
	Mg = new Specie("Magnesium", inputs[5].value, 24.3, "Mg");
	NO2 = new Specie("Nitrite", inputs[6].value, 46, "NO2");
	Ca = new Specie("Calcium", inputs[7].value, 40, "Ca");
	NO3 = new Specie("Nitrate", inputs[8].value, 62, "NO3");
	Li = new Specie("Lithium", inputs[9].value, 7, "Li");
	SO4 = new Specie("Sulfate", inputs[10].value, 96, "SO4");
	NH3 = new Specie("Ammonia", inputs[11].value, 17, "NH3");
	PO4 = new Specie("Phosphate", inputs[12].value, 95, "PO4");
	N2H4 = new Specie("Hydrazine", inputs[13].value, 32, "N2H4");
	SiO2 = new Specie("Silica", inputs[14].value, 60, "SiO2");
	Mo = new Specie("Morpholine", inputs[15].value, 87, "C4H9NO");
	CO2 = new Specie("Carbon Dioxide", inputs[16].value, 44, "CO2");
	ETA = new Specie("ETA", inputs[17].value, 61, "ETA");
	C1 = new Specie("Formate", inputs[18].value, 46, "HCO2");
	C2 = new Specie("Acetate", inputs[19].value, 60, "C2H3O2");
	C3 = new Specie("Propionate", inputs[20].value, 76, "C3H5O2");
	
	speciesArray = Array(B,Na,F,K,Cl,Mg,NO2,Ca,NO3,Li,SO4,NH3,PO4,N2H4,SiO2,Mo,CO2,ETA,C1,C2,C3);
	
	// kWater and A
	kWater = getKWater(temperature_celcius);
	A = debyeHuckel(temperature_celcius);
	// Initial values of global variables needed for calculations
	ConvH = 0.0000001;
	ConvBO = B.molarConcentration();
	Ionic = 0;
	OldIonic = Ionic;
	
	ACoef=Math.pow(10,(A * -1 * Math.sqrt(Ionic) / (1 + Math.sqrt(Ionic))));
	KW = kWater / Math.pow(ACoef,2);
	H = Math.sqrt(KW);
	OH = H;	
	Q6 = QT6 / Math.pow(ACoef,2);
	BO = B.molarConcentration();
	setBO();
	var check = check_relationship(); // added until 366, phCalc is original
	if(check = "true"){
	setIonic();
	}
	else{
	ConvBO = BO;
    ConvH = H;
	setH();
	}
	document.input_form.output_ph.value = pHCalc();
	document.input_form.output_cond.value = conductivityCalc();
}

/*
Function name: setInitialVariables
 PRECONDITIONS
	Value from the user form are available.
 POSTCONDITIONS
	Values of certain global variables are set.
 RETURN
	None. Values of the global variables are set within the function and are not returned.
*/
function setInitialVariables(){	
	// molar conducatances for H+ and OH-  
	lOH = 105.7785 + 3.577795 * temperature_celcius - 0.001106061 * Math.pow(temperature_celcius,2) - 0.00001152991 * Math.pow(temperature_celcius,3); // OH-, CRC
	lH = 236.042 + 4.737213 * temperature_celcius - 0.002899112 * Math.pow(temperature_celcius,2) - 0.00003389607 * Math.pow(temperature_celcius,3); // H+, CRC
	
	// Borate compounds
	Q3 = Math.pow(10,(1573.21/temperature_kelvin+28.6059+0.012078*temperature_kelvin-13.2258*Math.log(temperature_kelvin)/Math.LN10)); // B(OH)4;
	Q4 = Math.pow(10,(2756.1/temperature_kelvin-18.966+5.835*Math.log(temperature_kelvin)/Math.LN10)); // B2(OH)7--, BAES & MESMER
	Q5 = Math.pow(10,(3339.5/temperature_kelvin-8.084+1.497*Math.log(temperature_kelvin)/Math.LN10)); // B3(OH)10
	QT6 = Math.pow(10,(12820/temperature_kelvin-134.56+42.105*Math.log(temperature_kelvin)/Math.LN10)); // B4(OH)14
}

/*
Function name: getKWater
 PRECONDITIONS
	The value of 'temperature_celcius' is set from the user form.
 POSTCONDITIONS
	Nothing is altered by this function.
 RETURN
	Float representing the value of Kw from MULTEQ
*/
function getKWater(temperature_celcius){
	//Kw FROM MULTEQ
	var MA = -14.9378;
	var MB = 0.0424044;
	var MC = -0.000210252;
	var MD = 0.0000006220251;
	var MEe = -0.000000000873825;
	return Math.pow(10,( (MA) + (MB*temperature_celcius) + (MC*Math.pow(temperature_celcius,2)) + (MD*Math.pow(temperature_celcius,3)) + (MEe*Math.pow(temperature_celcius,4)) ));
}

/*
Function name: debyeHuckel
 PRECONDITIONS
	The value of 'temperature_celcius' is set from the user form.
 POSTCONDITIONS
	Nothing is altered by this function.
 RETURN
	Float representing the value of A (conjugate acid)
*/
function debyeHuckel(temperature_celcius){
	//Debye-Huckel Const.
	var A1 = -0.3071160078;
	var A2 = 0.0002968960123;
	var A3 = 0.000008800712752;
	var A4 = -0.00000003827047128;
	var A5 = 0.00000000006905972035;
	return Math.pow(10,( (A1) + (A2*temperature_celcius) + (A3*Math.pow(temperature_celcius,2)) + (A4*Math.pow(temperature_celcius,3)) + (A5*Math.pow(temperature_celcius,4)) ));
}

/*
Function name: precise_round

 PRECONDITIONS
	"num" is a float, double, int, or other numerical type
 POSTCONDITIONS
	None ("num" is not permanately changed)
 RETURN
	Float representing "num" rounded to "decimals" places.
*/
function precise_round(num,decimals){
    var sign = num >= 0 ? 1 : -1;
    return (Math.round((num*Math.pow(10,decimals))+(sign*0.001))/Math.pow(10,decimals)).toFixed(decimals);
}

/*
Function name: check_relationship

 PRECONDITIONS
	"ConvH", "H", "ConvBO", and "BO" are set
 POSTCONDITIONS
	The correlation of H and BO are checked
 RETURN
	Boolean
*/
function check_relationship(){
	if(Math.abs(ConvH - H) <= .00001 * ConvH && Math.abs(ConvBO - BO) <= .00001 * ConvBO){
		return true;
	}
	else{
		return false;
	}
}

/*
Function name: setBO

 PRECONDITIONS
	"Q" variables, "B", "BO", and "OH" are initialized
 POSTCONDITIONS
	Borated compounds are calculated and setIonic() is called and the function exited.
	After 500 attempts, the user is alerted that the relationship did not converge. 
	After failure, the program does not exit.
 RETURN
	None. Calls setIonic().
*/
function setBO(){
	for(var i=0;i<500;i++){
		var FBO = (1 + Q3 * OH) * BO + 2 * Q4 * OH * Math.pow(BO,2) + 3 * Q5 * OH * Math.pow(BO,3) + 4 * Q6 * Math.pow(OH,2) * Math.pow(BO,4) - B.molarConcentration();
		var DFBO = 1 + Q3 * OH + 4 * Q4 * OH * BO + 9 * Q5 * OH * Math.pow(BO,2) + 16 * Q6 * Math.pow(OH,2) * Math.pow(BO,3);
		var NEWBO = BO - FBO / DFBO;
			if(Math.abs(BO - NEWBO) <= 0.00001 * BO){
				var check = check_relationship();
					if(check = "true"){
					setIonic();
					return;
					}
			}
			else{
				BO = NEWBO;
			}
	}
	alert("relationship did not converge within 500 iterations");
}

/*
Function name: setH

 PRECONDITIONS
	Equilibrium constants and molal concentrations are set
 POSTCONDITIONS
	The values of "H" and "OH" are set and setBO() is called.
	After 500 attempts, the function exits with the last value of "H" set.
	The user is not alerted of the failure in this function.
 RETURN
	None. Calls setBO().
*/
function setH(){
	for(var i=0;i<500;i++){
        Bal = H + Na.molarConcentration() + Ca.molarConcentration() * 2 + Mg.molarConcentration() * 2 + K.molarConcentration();
        Bal = Bal + Li.molarConcentration() * Li.getEquilibriumConstants(temperature_celcius)[0] / (KW / H + Li.getEquilibriumConstants(temperature_celcius)[0]); // Li
        Bal = Bal + NH3.molarConcentration() * NH3.getEquilibriumConstants(temperature_celcius)[0] / (KW / H + NH3.getEquilibriumConstants(temperature_celcius)[0]); // NH3
        Bal = Bal + N2H4.molarConcentration() * N2H4.getEquilibriumConstants(temperature_celcius)[0] / (KW / H + N2H4.getEquilibriumConstants(temperature_celcius)[0]); // N2H4
        Bal = Bal + Mo.molarConcentration() * Mo.getEquilibriumConstants(temperature_celcius)[0] / (KW / H + Mo.getEquilibriumConstants(temperature_celcius)[0]); // MORPHOLINE
        Bal = Bal + ETA.molarConcentration() * ETA.getEquilibriumConstants(temperature_celcius)[0] / (KW / H + ETA.getEquilibriumConstants(temperature_celcius)[0]);// ETA
        Bal = Bal - KW / H - Cl.molarConcentration() - NO3.molarConcentration();
        BC1 = Q3 * BO + Q4 * Math.pow(BO,2) + Q5 * Math.pow(BO,3);
        Bal = Bal - (BC1 * KW / H + 2 * Q6 * Math.pow(BO,4) * Math.pow((KW / H),2));
        Bal = Bal - F.getEquilibriumConstants(temperature_celcius)[0] * F.molarConcentration() / (F.getEquilibriumConstants(temperature_celcius)[0] + H);   // F-
        Bal = Bal - NO2.molarConcentration() * NO2.getEquilibriumConstants(temperature_celcius)[0] / (H + NO2.getEquilibriumConstants(temperature_celcius)[0]); // NO2
        Bal = Bal - SO4.molarConcentration() * (H + SO4.getEquilibriumConstants(temperature_celcius)[0] * 2) / (H + SO4.getEquilibriumConstants(temperature_celcius)[0]); // SO4
        Bal = Bal - PO4.molarConcentration() * (PO4.getEquilibriumConstants(temperature_celcius)[0] * H + 2 * PO4.getEquilibriumConstants(temperature_celcius)[0] * PO4.getEquilibriumConstants(temperature_celcius)[1]) / (Math.pow(H,2) + H * PO4.getEquilibriumConstants(temperature_celcius)[0] + PO4.getEquilibriumConstants(temperature_celcius)[0] * PO4.getEquilibriumConstants(temperature_celcius)[1]); // PO4
        Bal = Bal - SiO2.molarConcentration() * (SiO2.getEquilibriumConstants(temperature_celcius)[0] * H + 2 * SiO2.getEquilibriumConstants(temperature_celcius)[0] * SiO2.getEquilibriumConstants(temperature_celcius)[1]) / (Math.pow(H,2) + H * SiO2.getEquilibriumConstants(temperature_celcius)[0] + SiO2.getEquilibriumConstants(temperature_celcius)[0] * SiO2.getEquilibriumConstants(temperature_celcius)[1]); // SiO2
        Bal = Bal - CO2.molarConcentration() * CO2.getEquilibriumConstants(temperature_celcius)[0] * (H + 2 * CO2.getEquilibriumConstants(temperature_celcius)[1]) / (Math.pow(H,2) + H * CO2.getEquilibriumConstants(temperature_celcius)[0] + CO2.getEquilibriumConstants(temperature_celcius)[0] * CO2.getEquilibriumConstants(temperature_celcius)[1]); // CO2
        Bal = Bal - C1.molarConcentration() * C1.getEquilibriumConstants(temperature_celcius)[0] / (H + C1.getEquilibriumConstants(temperature_celcius)[0]); // HCOO-
        Bal = Bal - C2.molarConcentration() * C2.getEquilibriumConstants(temperature_celcius)[0] / (H + C2.getEquilibriumConstants(temperature_celcius)[0]); // CH3COO-
        Bal = Bal - C3.molarConcentration() * C3.getEquilibriumConstants(temperature_celcius)[0] / (H + C3.getEquilibriumConstants(temperature_celcius)[0]); // CH3CH2COO-
		
        DBal = 1 + Li.molarConcentration() * Li.getEquilibriumConstants(temperature_celcius)[0] * KW / Math.pow((KW + H * Li.getEquilibriumConstants(temperature_celcius)[0]),2); 
        DBal = DBal + NH3.molarConcentration() * NH3.getEquilibriumConstants(temperature_celcius)[0] * KW / Math.pow((KW + H * NH3.getEquilibriumConstants(temperature_celcius)[0]),2); 
        DBal = DBal + N2H4.molarConcentration() * N2H4.getEquilibriumConstants(temperature_celcius)[0] * KW / Math.pow((KW + H * N2H4.getEquilibriumConstants(temperature_celcius)[0]),2); 
        DBal = DBal + Mo.molarConcentration() * Mo.getEquilibriumConstants(temperature_celcius)[0] * KW / Math.pow((KW + H * Mo.getEquilibriumConstants(temperature_celcius)[0]),2); 
        DBal = DBal + ETA.molarConcentration() * ETA.getEquilibriumConstants(temperature_celcius)[0] * KW / Math.pow((KW + H * ETA.getEquilibriumConstants(temperature_celcius)[0]),2); 
        DBal = DBal + KW / Math.pow(H,2); 
        DBal = DBal + BC1 * KW / Math.pow(H,2) + 4 * Q6 * Math.pow(BO,4) * Math.pow(KW,2) / Math.pow(H,3); 
        DBal = DBal + F.getEquilibriumConstants(temperature_celcius)[0] * F.molarConcentration() / Math.pow((F.getEquilibriumConstants(temperature_celcius)[0] + H),2); 
        DBal = DBal + NO2.molarConcentration() * NO2.getEquilibriumConstants(temperature_celcius)[0] / Math.pow((H + NO2.getEquilibriumConstants(temperature_celcius)[0]),2); 
        DBal = DBal + SO4.molarConcentration() * SO4.getEquilibriumConstants(temperature_celcius)[0] / Math.pow((H + SO4.getEquilibriumConstants(temperature_celcius)[0]),2); 
        DBal = DBal + PO4.molarConcentration() * PO4.getEquilibriumConstants(temperature_celcius)[0] * (Math.pow(H,2) + 4 * PO4.getEquilibriumConstants(temperature_celcius)[1] * H + PO4.getEquilibriumConstants(temperature_celcius)[0] * PO4.getEquilibriumConstants(temperature_celcius)[1]) * 100000000000000000000 / Math.pow(((Math.pow(H,2) + PO4.getEquilibriumConstants(temperature_celcius)[0] * H + PO4.getEquilibriumConstants(temperature_celcius)[0] * PO4.getEquilibriumConstants(temperature_celcius)[1]) * 10000000000),2); 
		if(SiO2.molarConcentration() != 0){DBal = DBal + SiO2.molarConcentration() * SiO2.getEquilibriumConstants(temperature_celcius)[0] * (Math.pow(H,2) + 4 * SiO2.getEquilibriumConstants(temperature_celcius)[1] * H + SiO2.getEquilibriumConstants(temperature_celcius)[0] * SiO2.getEquilibriumConstants(temperature_celcius)[1]) * 100000000000000000000 / Math.pow(((Math.pow(H,2) + SiO2.getEquilibriumConstants(temperature_celcius)[0] * H + SiO2.getEquilibriumConstants(temperature_celcius)[0] * SiO2.getEquilibriumConstants(temperature_celcius)[1]) * 10000000000),2);}
		DBal = DBal + CO2.molarConcentration() * CO2.getEquilibriumConstants(temperature_celcius)[0] * (Math.pow(H,2) + 4 * CO2.getEquilibriumConstants(temperature_celcius)[1] * H + CO2.getEquilibriumConstants(temperature_celcius)[0] * CO2.getEquilibriumConstants(temperature_celcius)[1]) * 100000000000000000000 / Math.pow(((Math.pow(H,2) + CO2.getEquilibriumConstants(temperature_celcius)[0] * H + CO2.getEquilibriumConstants(temperature_celcius)[0] * CO2.getEquilibriumConstants(temperature_celcius)[1]) * 10000000000),2);
        DBal = DBal + C1.molarConcentration() * C1.getEquilibriumConstants(temperature_celcius)[0] / Math.pow((H + C1.getEquilibriumConstants(temperature_celcius)[0]),2);
        DBal = DBal + C2.molarConcentration() * C2.getEquilibriumConstants(temperature_celcius)[0] / Math.pow((H + C2.getEquilibriumConstants(temperature_celcius)[0]),2);
        DBal = DBal + C3.molarConcentration() * C3.getEquilibriumConstants(temperature_celcius)[0] / Math.pow((H + C3.getEquilibriumConstants(temperature_celcius)[0]),2);

		while(H<Bal/DBal){
			Bal=Bal/2;
		}
        NewH = H - Bal / DBal;
        if(Math.abs(H - NewH) <= H * 0.00001){
			setBO();
			return; // exit loop if conditions are met
		}
		else{ // continute loop with new values
			H = NewH;
			OH = KW / H;
		}
	} // end looping
}

/*
Function name: setIonic

 PRECONDITIONS
	Values of "OH", "H", and conjugate acids are available.
 POSTCONDITIONS
	Ionic strength is set and ACoef, KW, and Q6 are updated.
	setH() is called upon failure of the value check.
 RETURN
	None. Value of Ionic global variable is updated.
*/
function setIonic(){
	OldIonic = Ionic;
	
	b1 = Q3 * BO * OH;
	b2 = Q4 * Math.pow(BO,2) * OH;
	b3 = Q5 * Math.pow(BO,3) * OH;
	b4 = Q6 * Math.pow(BO,4) * Math.pow(OH,2);
	B.setIonicStrength([b1,b2,b3,b4]);

    hf = F.getEquilibriumConstants(temperature_celcius)[0] * F.molarConcentration() / (F.getEquilibriumConstants(temperature_celcius)[0] + H);
    F.setIonicStrength([hf]);
	
	HNO2 = NO2.molarConcentration() * NO2.getEquilibriumConstants(temperature_celcius)[0] / (H + NO2.getEquilibriumConstants(temperature_celcius)[0]);
    NO2.setIonicStrength([HNO2]);
	
	SiO3 = SiO2.molarConcentration() * SiO2.getEquilibriumConstants(temperature_celcius)[0] * SiO2.getEquilibriumConstants(temperature_celcius)[1] / (Math.pow(H,2) + SiO2.getEquilibriumConstants(temperature_celcius)[0] * H + SiO2.getEquilibriumConstants(temperature_celcius)[0] * SiO2.getEquilibriumConstants(temperature_celcius)[1]);
    HSiO3 = SiO2.molarConcentration() * SiO2.getEquilibriumConstants(temperature_celcius)[0] * H / (Math.pow(H,2) + SiO2.getEquilibriumConstants(temperature_celcius)[0] * H + SiO2.getEquilibriumConstants(temperature_celcius)[0] * SiO2.getEquilibriumConstants(temperature_celcius)[1]);
    SiO2.setIonicStrength([HSiO3,SiO3]);
	
	SO42 = SO4.molarConcentration() * SO4.getEquilibriumConstants(temperature_celcius)[0] / (H + SO4.getEquilibriumConstants(temperature_celcius)[0]);
    HSO4 = SO4.molarConcentration() * H / (H + SO4.getEquilibriumConstants(temperature_celcius)[0]);
    SO4.setIonicStrength([HSO4,SO42]);
	
	HPO4 = PO4.molarConcentration() * PO4.getEquilibriumConstants(temperature_celcius)[0] * PO4.getEquilibriumConstants(temperature_celcius)[1] / (Math.pow(H,2) + PO4.getEquilibriumConstants(temperature_celcius)[0] * H + PO4.getEquilibriumConstants(temperature_celcius)[0] * PO4.getEquilibriumConstants(temperature_celcius)[1]);
    H2PO4 = PO4.molarConcentration() * PO4.getEquilibriumConstants(temperature_celcius)[0] * H / (Math.pow(H,2) + PO4.getEquilibriumConstants(temperature_celcius)[0] * H + PO4.getEquilibriumConstants(temperature_celcius)[0] * PO4.getEquilibriumConstants(temperature_celcius)[1]);
    PO4.setIonicStrength([H2PO4,HPO4]);
	
	HCO3 = CO2.molarConcentration() * CO2.getEquilibriumConstants(temperature_celcius)[0] * H / (Math.pow(H,2) + CO2.getEquilibriumConstants(temperature_celcius)[0] * H + CO2.getEquilibriumConstants(temperature_celcius)[0] * CO2.getEquilibriumConstants(temperature_celcius)[1]);
    CO3 = CO2.molarConcentration() * CO2.getEquilibriumConstants(temperature_celcius)[0] * CO2.getEquilibriumConstants(temperature_celcius)[1] / (Math.pow(H,2) + CO2.getEquilibriumConstants(temperature_celcius)[0] * H + CO2.getEquilibriumConstants(temperature_celcius)[0] * CO2.getEquilibriumConstants(temperature_celcius)[1]);
    CO2.setIonicStrength([HCO3,CO3]);
	
	CC1 = C1.molarConcentration() * C1.getEquilibriumConstants(temperature_celcius)[0] / (H + C1.getEquilibriumConstants(temperature_celcius)[0]);
    C1.setIonicStrength([CC1]);
	
	CC2 = C2.molarConcentration() * C2.getEquilibriumConstants(temperature_celcius)[0] / (H + C2.getEquilibriumConstants(temperature_celcius)[0]);
    C2.setIonicStrength([CC2]);
	
	CC3 = C3.molarConcentration() * C3.getEquilibriumConstants(temperature_celcius)[0] / (H + C3.getEquilibriumConstants(temperature_celcius)[0]);
	C3.setIonicStrength([CC3]);
	
    Li1 = Li.molarConcentration() * Li.getEquilibriumConstants(temperature_celcius)[0] / (OH + Li.getEquilibriumConstants(temperature_celcius)[0]);
    Li.setIonicStrength([Li1]);
	
	NH4 = NH3.molarConcentration() * NH3.getEquilibriumConstants(temperature_celcius)[0] / (OH + NH3.getEquilibriumConstants(temperature_celcius)[0]);
    NH3.setIonicStrength([NH4]);
	
	N2H5 = N2H4.molarConcentration() * N2H4.getEquilibriumConstants(temperature_celcius)[0] / (OH + N2H4.getEquilibriumConstants(temperature_celcius)[0]);
    N2H4.setIonicStrength([N2H5]);
	
	Mo1 = Mo.molarConcentration() * Mo.getEquilibriumConstants(temperature_celcius)[0] / (OH + Mo.getEquilibriumConstants(temperature_celcius)[0]);
    Mo.setIonicStrength([Mo1]);
	
	ETA1 = ETA.molarConcentration() * ETA.getEquilibriumConstants(temperature_celcius)[0] / (OH + ETA.getEquilibriumConstants(temperature_celcius)[0]);
	ETA.setIonicStrength([ETA1]);
	
	Na.setIonicStrength([Na.molarConcentration()]);
	Ca.setIonicStrength([Ca.molarConcentration()]);
	Mg.setIonicStrength([Mg.molarConcentration()]);
	K.setIonicStrength([K.molarConcentration()]);
	Cl.setIonicStrength([Cl.molarConcentration()]);
	NO3.setIonicStrength([NO3.molarConcentration()]);
	var ionicTotals = 0;
	for(var i=0;i<speciesArray.length;i++){
	  for(var j=0;j<speciesArray[i].ionicStrength.length;j++){
		ionicTotals = ionicTotals + speciesArray[i].ionicStrength[j];
		}
	}
	Ionic = ionicTotals + 3*(Mg.ionicStrength[0]+Ca.ionicStrength[0]+B.ionicStrength[3]+SO4.ionicStrength[1]+PO4.ionicStrength[1]+SiO2.ionicStrength[1]+CO2.ionicStrength[1]);
	Ionic = Ionic + H+OH;
	Ionic = 0.5*Ionic;
	if(Math.abs(OldIonic - Ionic) > (0.00001 * OldIonic)){
		ACoef=Math.pow(10,(A * -1 * Math.sqrt(Ionic) / (1 + Math.sqrt(Ionic))));
		KW = kWater / Math.pow(ACoef,2);
		Q6 = QT6 / Math.pow(ACoef,2);
		setH(); // If the values pass the check, set new values for ACoef, KW, and Q6. Proceed to setH().
	}
	else{
		return; // exit function
	}
}

/*
Function name: pHCalc

 PRECONDITIONS
	Value of "H" is set
 POSTCONDITIONS
	The value of the pH global variable is set and then displayed on the user form.
 RETURN
	Float representing the pH of the solution
*/
function pHCalc(){
	var pH = -Math.log(H) / Math.log(10); // Math.log() returns the natural log. Divide by the natural log 10 to obtain log base 10	
	pH = precise_round(pH,2);
	return pH;
}


/*
Function name: conductivityCalc

 PRECONDITIONS
	Values of ionic strength, borated compounds, H and OH are properly set.
 POSTCONDITIONS
	TCond, Cond, and TotEq global variables are set. The conductivity is displayed on the user form. 
 RETURN
	Float representing the total conductivity of the species
*/
function conductivityCalc(){
    TCond = H * lH + Na.molarConcentration() * Na.getMolarConductances(temperature_celcius)[0] + Ca.molarConcentration() * Ca.getMolarConductances(temperature_celcius)[0] + Mg.molarConcentration() * Mg.getMolarConductances(temperature_celcius)[0] + K.molarConcentration() * K.getMolarConductances(temperature_celcius)[0] + Li1 * Li.getMolarConductances(temperature_celcius)[0] + NH4 * NH3.getMolarConductances(temperature_celcius)[0] + N2H5 * N2H4.getMolarConductances(temperature_celcius)[0] + Mo1 * Mo.getMolarConductances(temperature_celcius)[0] + ETA1 * ETA.getMolarConductances(temperature_celcius)[0];
	TCond = TCond + OH * lOH + b1 * B.getMolarConductances(temperature_celcius)[0] + b2 * B.getMolarConductances(temperature_celcius)[1] + b3 * B.getMolarConductances(temperature_celcius)[2] + b4 * B.getMolarConductances(temperature_celcius)[3] + hf * F.getMolarConductances(temperature_celcius)[0] + Cl.molarConcentration() * Cl.getMolarConductances(temperature_celcius)[0] + HNO2 * NO2.getMolarConductances(temperature_celcius)[0] + NO3.molarConcentration() * NO3.getMolarConductances(temperature_celcius)[0];
    TCond = TCond + HSO4 * SO4.getMolarConductances(temperature_celcius)[1] + SO42 * SO4.getMolarConductances(temperature_celcius)[0];
    TCond = TCond + H2PO4 * PO4.getMolarConductances(temperature_celcius)[1] + HPO4 * PO4.getMolarConductances(temperature_celcius)[0];
    TCond = TCond + HSiO3 * SiO2.getMolarConductances(temperature_celcius)[1] + SiO3 * SiO2.getMolarConductances(temperature_celcius)[0];
    TCond = TCond + HCO3 * CO2.getMolarConductances(temperature_celcius)[1] + CO3 * CO2.getMolarConductances(temperature_celcius)[0];
    TCond = TCond + CC1 * C1.getMolarConductances(temperature_celcius)[0] + CC2 * C2.getMolarConductances(temperature_celcius)[0] + CC3 * C3.getMolarConductances(temperature_celcius)[0];
    Cond = TCond * 1000;
 
    TotEq = Na.molarConcentration() + Ca.molarConcentration() + Mg.molarConcentration() + K.molarConcentration() + Li1 + NH4 + N2H5 + Mo1 + ETA1 + hf + Cl.molarConcentration() + HNO2 + NO3.molarConcentration();
    TotEq = TotEq + HSO4 + SO42 + H2PO4 + HPO4 + HSiO3 + SiO3 + HCO3 + CO3 + CC1 + CC2 + CC3
 	
	//print conductivity on form
	Cond = precise_round(Cond,3);
	return Cond;
}

/*
Function name: detail

 PRECONDITIONS
	"analyte" is the displayed name, "input value" is the value from the user form corresponding
	to the analyte, "molal" is the molal concentration of that analyte, and "lmolal" is its molar conductance.
 POSTCONDITIONS
	None
 RETURN
	STRING of HTML table formated information for the analyte input. If the value on the user form is not a positive number greater than 0, 
	then an empty string is returned.
*/
function detail(analyteText, specieObject, ionicStrength, molalConcentration){
		return '<tr><td>&nbsp &nbsp '+analyteText+'</td><td>'+parseFloat(ionicStrength).toExponential(2)+'&nbsp mol/kg</td><td>'+precise_round((ionicStrength*molalConcentration*1000),4)+'&nbsp uS/cm</td></tr>';
}
	
function getDetails(specieObject){
	var header;
	var details;
	var a = specieObject.concentration;
	if(a > 0){
		 header = '<tr><td>'+specieObject.name+'</td><td>'+specieObject.concentration+'&nbsp ppb</td><td></td></tr>';
			switch(specieObject.name){
				case "Boron":
					details = detail("B(OH) 4-", B, B.ionicStrength[0], B.getMolarConductances(temperature_celcius)[0])+
								  detail("B2(OH) 7-", B, B.ionicStrength[1], B.getMolarConductances(temperature_celcius)[1])+
								  detail("B3(OH) 10-", B, B.ionicStrength[2], B.getMolarConductances(temperature_celcius)[2])+
								  detail("B4(OH) 14-", B, B.ionicStrength[3], B.getMolarConductances(temperature_celcius)[3]); 
					break;
				case "Sulfate":
					details = detail("HSO4 -", SO4, SO4.ionicStrength[0], SO4.getMolarConductances(temperature_celcius)[0])+
							  detail("SO4 2-", SO4, SO4.ionicStrength[1], SO4.getMolarConductances(temperature_celcius)[1]);
					break;
				case "Phosphate":
					details = detail("H2PO4 -", PO4, PO4.ionicStrength[0], PO4.getMolarConductances(temperature_celcius)[0])+
							  detail("HPO4 2-", PO4, PO4.ionicStrength[1], PO4.getMolarConductances(temperature_celcius)[1]); 
					break;
				case "Propionate":
					details = detail("OHC2H2O2", C3, C3.ionicStrength[0], C3.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Fluoride":
					details = detail("F -", F, F.ionicStrength[0], F.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Silica":
					details = detail("HSiO3 -", SiO2, SiO2.ionicStrength[0], SiO2.getMolarConductances(temperature_celcius)[0])+
							  detail("SiO3 2-", SiO2, SiO2.ionicStrength[1], SiO2.getMolarConductances(temperature_celcius)[1]);
					break;
				case "Carbon Dioxide":
					details = detail("HCO3 -", CO2, CO2.ionicStrength[0], CO2.getMolarConductances(temperature_celcius)[0])+
						      detail("CO3 2-", CO2, CO2.ionicStrength[1], CO2.getMolarConductances(temperature_celcius)[1]);
					break;
				case "Formate":
					details = detail("CHO2 -", C1, C1.ionicStrength[0], C1.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Acetate":
					details = detail("C2H3O2 -", C2, C2.ionicStrength[0], C2.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Nitrite":
					details = detail("NO2 -", NO2, NO2.ionicStrength[0], NO2.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Lithium":
					details = detail("Li +", Li, Li.ionicStrength[0], Li.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Ammonia":
					details = detail("NH4+", NH3, NH3.ionicStrength[0], NH3.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Hydrazine":
					details = detail("N2H5 +", N2H4, N2H4.ionicStrength[0], N2H4.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Morpholine":
					details = detail("NH2C4H8O +", Mo, Mo.ionicStrength[0], Mo.getMolarConductances(temperature_celcius)[0]);
					break;
				case "ETA":
					details = detail("NH3C2H4OH +", ETA, ETA.ionicStrength[0], ETA.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Chloride":
					details = detail("Cl -", Cl, Cl.ionicStrength[0], Cl.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Nitrate":
					details = detail("NO3 -", NO3, NO3.ionicStrength[0], NO3.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Sodium":
					details = detail("Na +", Na, Na.ionicStrength[0], Na.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Potassium":
					details = detail("K +", K, K.ionicStrength[0], K.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Magnesium":
					details = detail("Mg 2+", Mg, Mg.ionicStrength[0], Mg.getMolarConductances(temperature_celcius)[0]);
					break;
				case "Calcium":
					details = detail("Ca 2+", Ca, Ca.ionicStrength[0], Ca.getMolarConductances(temperature_celcius)[0]);
					break;
			}
		 }
		else{
			return "";
		 }
		return header+details;
}

/*
Function name: showDetails

 PRECONDITIONS
	None
 POSTCONDITIONS
	The details of the conductivity calculation are displayed on the page
 RETURN
	None
*/
function showDetails(){

	var out = document.getElementById("details");
	var currentdate = new Date(); 
	var minutes;
	if(currentdate.getMinutes()<10){
	 minutes = "0"+currentdate.getMinutes();
	}
	else{
	minutes = currentdate.getMinutes();
	}
	var datetime = (currentdate.getMonth()+1) + "/"
                + currentdate.getDate()  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + minutes;
				
	var header = '<span id="plant_name">'+plant+'</span><br/><span id="datetime">'+datetime+'</span>';
	var tableSetup = '<br/><br/><table name="details_table" style="border:1px solid black;padding:6px;border-spacing:2px;padding:8px;"><tr><th>PARAMETER</th><th>CONCENTRATION&nbsp&nbsp&nbsp&nbsp</th><th>CONDUCTIVITY</th></tr>';
	var blank_row = "<tr><td></td><td></td><td></td></tr>";
	
	var fullTable = header+tableSetup;
	for(var i=0;i<speciesArray.length;i++){
		fullTable += blank_row + getDetails(speciesArray[i]);
	}
	
	var h_row = '<tr><td>&nbsp &nbsp Hydronium Ion (H +)</td><td>'+H.toExponential(2)+'&nbsp mol/kg</td><td>'+precise_round((H*lH*1000),4)+'&nbsp uS/cm</td></tr>';
	var oh_row = '<tr><td>&nbsp &nbsp Hydroxyl Ion (OH -)</td><td>'+OH.toExponential(2)+'&nbsp mol/kg</td><td>'+precise_round((OH*lOH*1000),4)+'&nbsp uS/cm</td></tr>';
	
	fullTable += h_row+oh_row+"</table>";
	
	out.innerHTML = fullTable; // print the table on the page
}

/*
Function name: getCheckedRadioButton

 PRECONDITIONS
	None
 POSTCONDITIONS
	None
 RETURN
	The value of the checked radio button of the radioButtonGroup array
*/
function getCheckedRadioButton(radioButtonGroup){
	var radioGroup = document.getElementsByName(radioButtonGroup);
	var checkedRadioButton;
	for(var i=0;i<radioGroup.length;i++){
		if(radioGroup[i].checked){
			checkedRadioButton = radioGroup[i].value;
		}
	}
	return checkedRadioButton;
}
