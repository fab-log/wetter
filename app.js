let city = "Berlin";
let country = "Deutschland"
let lat = 52.51;
let lon = 13.4;
let favourites = [];
let config = {
	city: "Berlin",
	country: "Deutschland",
	lat: 52.51,
	lon: 13.4,
	mode: "dark",
	favourites: []
};

const images = document.querySelectorAll("img");
const inpSearch = document.querySelector("#inpSearch");
const modalSearchResults = document.querySelector("#modalSearchResults");
const modalFavourites = document.querySelector("#modalFavourites");
const currentCity = document.querySelector("#currentCity");
const btnLightMode = document.querySelector("#btnLightMode");
const btnDarkMode = document.querySelector("#btnDarkMode");
const threeDaysTiles = document.querySelector(".threeDaysTiles");
const toggleIcon = document.querySelector(".toggle-icon");
const linkToTerms = document.querySelector("#linkToTerms");
const terms = document.querySelector("#terms");
const closeTerms = document.querySelector("#closeTerms");
const favourite_empty = document.querySelector("#favourite_empty");
const favourite_full = document.querySelector("#favourite_full");

const iconMap = {
	0: ["Klarer Himmel", "pix/sunny.webp", "pix/sunny_night.webp"],
	1: ["Überwiegend klar", "pix/mainly_clear.webp", "pix/mainly_clear_night.webp"],
	2: ["Teilweise wolkig", "pix/partially_cloudy.webp", "pix/partially_cloudy_night.webp"],
	3: ["bewölkt", "pix/cloudy.webp", "pix/cloudy.webp"],
	45: ["Nebel", "pix/cloudy.webp", "pix/cloudy.webp"],
	48: ["Nebel", "pix/cloudy.webp", "pix/cloudy.webp"],
	51: ["Leichter Nieselregen", "pix/rain_light.webp", "pix/rain_light.webp"],
	53: ["Nieselregen", "pix/rain_moderate.webp", "pix/rain_moderate.webp"],
	55: ["Starker Nieselregen", "pix/rain_heavy.webp", "pix/rain_heavy.webp"],
	56: ["Leichter gefrierender Nieselregen", "pix/cloudy.webp", "pix/cloudy.webp"],
	57: ["Starker gefrierender Nieselregen", "pix/rain_heavy.webp", "pix/rain_heavy.webp"],
	61: ["Leichter Regen", "pix/rain_light.webp", "pix/rain_light.webp"],
	63: ["Regen", "pix/rain_moderate.webp", "pix/rain_moderate.webp"],
	65: ["Starker Regen", "pix/rain_heavy.webp", "pix/rain_heavy.webp"],
	66: ["Leichter Eisregen", "pix/rain_light.webp", "pix/rain_light.webp"],
	67: ["Starker Eisregen", "pix/rain_heavy.webp", "pix/rain_heavy.webp"],
	71: ["Leichter Schneefall", "pix/snowfall_light.webp", "pix/snowfall_light.webp"],
	73: ["Schneefall", "pix/snowfall_moderate.webp", "pix/snowfall_moderate.webp"],
	75: ["Starker Schneefall", "pix/snowfall_heavy", "pix/snowfall_heavy"],
	77: ["Altschnee", "pix/snowfall_light.webp", "pix/snowfall_light.webp"],
	80: ["Leichte Regenschauer", "pix/showers.webp", "pix/showers_night.webp"],
	81: ["Regenschauer", "pix/showers.webp", "pix/showers_night.webp"],
	82: ["Starke Regenschauer", "pix/showers_strong.webp", "pix/showers_strong_night.webp"],
	85: ["Leichte Schneeschauer", "pix/snowfall_light.webp", "pix/snowfall_light.webp"],
	86: ["Starke Schneeschauer", "pix/snowfall_heavy", "pix/snowfall_heavy"],
	95: ["Gewitter", "pix/thunderstorm.webp", "pix/thunderstorm.webp"],
	96: ["Gewitter mit Hagel", "pix/thunderstorm.webp", "pix/thunderstorm.webp"],
	99: ["Gewitter mit Hagel", "pix/thunderstorm.webp", "pix/thunderstorm.webp"],
}


// ###### HELPERS ######

const compareArrays = (a, b) => {
	return a.toString() === b.toString();
};

const closeModals = () => {
	document.querySelectorAll(".modal").forEach(e => {
		e.style.display = "none"
	})
}

const toggleLightMode = () => {
	document.body.classList.add("light-mode");
	btnLightMode.style.display = "none";
	btnDarkMode.style.display = "block";
	config.mode = "light";
	localStorage.setItem("fablogWeatherConfig", JSON.stringify(config));
}

const toggleDarkMode = () => {
	document.body.classList.remove("light-mode");
	btnDarkMode.style.display = "none";
	btnLightMode.style.display = "block";
	config.mode = "dark";
	localStorage.setItem("fablogWeatherConfig", JSON.stringify(config));
}

const markAsFavourite = () => {
	let newFavourite = [config.city, config.country, config.lat, config.lon];
	config.favourites.push(newFavourite);
	localStorage.setItem("fablogWeatherConfig", JSON.stringify(config));
	favourite_empty.style.display = "none";
	favourite_full.style.display = "inline";
}

const unmarkFavourite = () => {
	let currentCityString = `${config.city},${config.country},${config.lat},${config.lon}`;
	let index;
	for (let i = 0; i < config.favourites.length; i++) {
		if (currentCityString === config.favourites[i].toString()) {
			index = i;
		};
	}
	config.favourites.splice(index, 1);
	localStorage.setItem("fablogWeatherConfig", JSON.stringify(config));
	favourite_empty.style.display = "inline";
	favourite_full.style.display = "none";
}

const favouritesMenu = () => {
	if (config.favourites.length === 0) {
		showAlert("Keine Favoriten vorhanden");
		return;
	}
	modalFavourites.innerHTML = `
		<img src="pix/x.webp" alt="close" style="width: 20px; float: right; margin: 12px;" onclick="closeModals()">
		<h2>Favoriten</h2>
		`;
	modalFavourites.style.display = "block";
	let index = 1;
	config.favourites.forEach(e => {
		modalFavourites.insertAdjacentHTML("beforeend", `
		<p id="index${index}" onclick="pickLocation('${e[0]}', '${e[1]}', ${e[2]}, ${e[3]})">${e[0]}, ${e[1]}</p>
		`);
		index += 1;
	});
}

const iconPicker = (time, sunrise, sunset, weatherCode) => {
	let imagePath = "pix/sunny.webp";
	let index = 1;
	if (time > sunset || time <= sunrise) { index = 2 };
	imagePath = iconMap[weatherCode][index];
	return imagePath;
}

const tempColorPicker = (temp) => {
	if (temp > 29.9) { return "var(--accent-orange)" }
	else if (temp <= 0) { return "var(--accent-light)" }
	else { return "var(--color1)" }
}

const windColorPicker = (wind) => {
	if (wind > 30) { return "var(--accent-orange)" }
	else { return "var(--color1)" };
}

const pickLocation = (location, country, latitude, longitude) => {
	lat = latitude;
	lon = longitude;
	let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation_probability,cloud_cover,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,cloud_cover,wind_speed_10m,wind_direction_10m,weather_code&daily=sunrise,sunset&timezone=auto`;
	getData(url);
	currentCity.innerHTML = location;
	closeModals();
	config.city = location;
	config.country = country;
	config.lat = latitude;
	config.lon = longitude;
	localStorage.setItem("fablogWeatherConfig", JSON.stringify(config));
};

const daysOfTheWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const dayPicker = (dateString) => {
	let date = new Date(dateString);
	let dayName = date.getDay();
	return daysOfTheWeek[dayName];
}

const showAlert = (text) => {
	const alert = document.querySelector(".alert");
	alert.style.display = "block";
	alert.innerHTML = `<p>${text}</p>`;
	setTimeout(() => {
		alert.innerHTML = "";
		alert.style.display = "none";
	}, 3000);
};

const getConfig = () => {
	if (localStorage.getItem("fablogWeatherConfig") === null) {
		config = {
			city: "Berlin",
			country: "Deutschland",
			lat: 52.51,
			lon: 13.4,
			favourites: [],
			mode: "dark"
		}
	} else {
		config = JSON.parse(localStorage.getItem("fablogWeatherConfig"));
		city = config.city;
		country = config.country;
		lat = config.lat;
		lon = config.lon;
		favourites = config.favourites;
		mode = config.mode;
	};
	console.log("config: " + JSON.stringify(config, null, 2));
}

getConfig();
if (config.mode === "light") { toggleLightMode() };


// ###### SEARCH ######

const search = () => {
	let searchName = inpSearch.value;
	let searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${searchName}&count=10&language=de&format=json`;
	if (inpSearch.value === "" || inpSearch.value.trim() === "") { return; }
	fetch(searchUrl)
		.then(response => {
			if (!response.ok) {
				showAlert("Verbindungsproblem!");
				throw new Error("API issues.");
			}
			return response.json();
		})
		.then(data => {
			// console.log("search response" + JSON.stringify(data, null, 2));
			if (data.results === undefined) {
				showAlert("Keine Treffer für<br>" + inpSearch.value);
				inpSearch.value = "";
				return;
			} else if (data.results.length === 1) {
				let results = data.results[0];
				inpSearch.value = "";
				inpSearch.blur();
				pickLocation(results.name, results.country, results.latitude, results.longitude);
				return;
			} else {
				modalSearchResults.innerHTML = `
					<img src="pix/x.webp" alt="close" style="width: 20px; float: right; margin: 12px;" onclick="closeModals()">
					<h3>Bitte wählen</h3>
				`;
				modalSearchResults.style.display = "block";
				let index = 1;
				data.results.forEach(e => {
					modalSearchResults.insertAdjacentHTML("beforeend", `
					<p id="index${index}" onclick="pickLocation('${e.name}', '${e.country}', ${e.latitude}, ${e.longitude})">${e.name}, ${e.country}</p>
					`);
					index += 1;
				});
				inpSearch.value = "";
			}
		})
		.catch(error => {
			showAlert("Fehler!");
			console.error(error);
		});
}

inpSearch.addEventListener("change", search);


// ###### FETCH DATA ######

const getData = (url) => {
	fetch(url)
		.then(response => {
			if (!response.ok) {
				showAlert("Verbindungsproblem!");
				throw new Error("API issues.");
			}
			return response.json();
		})
		.then(data => {
			let current = data.current;
			// console.log(JSON.stringify(data, null, 2));

			const renderCurrent = () => {

				currentCity.innerHTML = config.city;

				let isFavourite = false;
				config.favourites.forEach(e => {
					if (e[2] === config.lat && e[3] === config.lon) {
						isFavourite = true;
					}
				});
				if (isFavourite === true) {
					favourite_empty.style.display = "none";
					favourite_full.style.display = "inline";
				} else {
					favourite_empty.style.display = "inline";
					favourite_full.style.display = "none";
				}

				document.querySelector(".currentTiles").innerHTML = `
					<div class="tile" style="text-align: left; grid-area: legende;">
						<p>${(current.time).substring(8, 10)}.${(current.time).substring(5, 7)}.${(current.time).substring(0, 4)}</p>
						<hr>
						<p>Wind</p>
						<hr>
						<p>Windrichtung</p>
						<hr>
						<p>Luftfeuchte</p>
						<hr>
						<p>Regen</p>
						<hr>
						<p>Sonne ↑</p>
						<hr>
						<p>Sonne ↓</p>
					</div>
					<div class="tile" style="grid-area: werte";>
						<p>${current.time.substring(11)}</p>
						<hr>
						<p style="color: ${windColorPicker(current.wind_speed_10m)};">${current.wind_speed_10m.toFixed(0)}<span class="unit">&#8239km/h</span></p>
						<hr>
						<p style="transform: rotate(${current.wind_direction_10m}deg);" title="${current.wind_direction_10m} °">↓</p>
						<hr>
						<p>${current.relative_humidity_2m}<span class="unit">&#8239%</span></p>
						<hr>
						<p>${current.precipitation_probability}<span class="unit">&#8239%</span></p>
						<hr>
						<p>${data.daily.sunrise[0].substring(11)}</p>
						<hr>
						<p>${data.daily.sunset[0].substring(11)}</p>
					</div>
					<div class="tile" style="background-color: var(--bg-color4); grid-area: icon;">
						<img src=${iconPicker(Number(current.time.substring(11, 13)), Number(data.daily.sunrise[0].substring(11, 13)), Number(data.daily.sunset[0].substring(11, 13)), current.weather_code)} alt="Aktuelle Wetterlage" title="Wolkendecke: ${current.cloud_cover}%" />
						<h1 style="color: ${tempColorPicker(current.temperature_2m)}">${current.temperature_2m.toFixed(0)}<span class="unit">&#8239°C</span></h1>
						<p>${iconMap[current.weather_code][0]}</p>
					</div>
				`;

				// <p style="color: ${tempColorPicker(current.temperature_2m)}">${current.temperature_2m.toFixed(0)}<span class="unit">&#8239°C</span></p>

				/* document.querySelector("#sunrise").innerHTML = `
					<img src="pix/sunrise.webp" alt="Sonnenaufgang" class="sun-icon"> ${data.daily.sunrise[0].substring(11)} <br><img src="pix/sunset.webp" alt="Sonnenuntergang" class="sun-icon"> ${data.daily.sunset[0].substring(11)}
				`; */

			}

			renderCurrent();

			let start = Number(current.time.substring(11, 13)) + 1;
			let length = 6;
			let hourly = data.hourly;
			let forecastTiles = document.querySelector(".forecastTiles");
			let forecastFirstColumn = `
			<div class="tile" style="text-align: left;">
				<img src="pix/dummy.webp" alt="Unsichtbarer Platzhalter" class="icon">
				<hr>
				<p>Zeit</p>
				<hr>
				<p>Temperatur</p>
				<hr>
				<p>Wind</p>
				<hr>
				<p>Windrichtung</p>
				<hr>
				<p>Luftfeuchte</p>
				<hr>
				<p>Regen</p>
			</div>
			`;

			/* for (let i = 0; i < hourly.time.length; i++) {
				console.log("[" + i + "] ########################");
				console.log(hourly.time[i].substring(0, 10) + " | " + hourly.time[i].substring(11));
				console.log("temp: " + hourly.temperature_2m[i]);
				console.log("wind: " + hourly.wind_speed_10m[i]);
				console.log("direction: " + hourly.wind_direction_10m[i]);
				console.log("humidity: " + hourly.relative_humidity_2m[i]);
				console.log("precipitation: " + hourly.precipitation_probability[i]);
				console.log("cloud cover: " + hourly.cloud_cover[i]);
				console.log("weather code: " + iconMap[hourly.weather_code[i]][0]);
			} */

			const renderHourly = () => {
				forecastTiles.innerHTML = forecastFirstColumn;
				if (window.innerWidth < 850) {
					length = 24;
					document.querySelectorAll(".arrows").forEach(e => {
						e.style.display = "none"
					});
				}
				for (let i = start; i < start + length; i++) {
					let time = `${hourly.time[i].substring(11)}`;
					forecastTiles.insertAdjacentHTML("beforeend", `
						<div class="tile" id="index${i}">
							<img src=${iconPicker(Number(hourly.time[i].substring(11, 13)), Number(data.daily.sunrise[0].substring(11, 13)), Number(data.daily.sunset[0].substring(11, 13)), hourly.weather_code[i])} alt="Wettersymbol" class="icon" title="${iconMap[hourly.weather_code[i]][0]}, Wolkendecke: ${hourly.cloud_cover[i]}%">
							<hr>
							<p>${time}</p>
							<hr>
							<p style="color: ${tempColorPicker(hourly.temperature_2m[i])}">${hourly.temperature_2m[i].toFixed(0)}<span class="unit">&#8239°C</span></p>
							<hr>
							<p style="color: ${windColorPicker(hourly.wind_speed_10m[i])};">${hourly.wind_speed_10m[i].toFixed(0)}<span class="unit">&#8239km/h</span></p>
							<hr>
							<p style="transform: rotate(${hourly.wind_direction_10m[i]}deg);" title="${hourly.wind_direction_10m[i]} °">↓</p>
							<hr>
							<p>${hourly.relative_humidity_2m[i]}<span class="unit">&#8239%</span></p>
							<hr>
							<p>${hourly.precipitation_probability[i]}<span class="unit">&#8239%</span></p>
						</div>
					`);
				};
			}

			renderHourly();

			if (window.innerWidth < 850) {
				setTimeout(() => {
					document.querySelector("#forecastCard").scrollLeft = 300;
				}, 2500);
				setTimeout(() => {
					document.querySelector("#forecastCard").scrollLeft = -300;
				}, 4000);
			}

			const arrowRight24 = document.querySelector("#arrowRight24");
			const arrowLeft24 = document.querySelector("#arrowLeft24");
			arrowLeft24.classList.add("disabled");
			arrowRight24.classList.remove("disabled");
			let page = 1;

			arrowRight24.addEventListener("click", () => {
				if (page > 2) {
					arrowRight24.classList.add("disabled");
				}
				if (page >= 4) { return; }
				arrowLeft24.classList.remove("disabled");
				start += 6;
				page += 1;
				forecastTiles.innerHTML = forecastFirstColumn;
				renderHourly();
			});

			arrowLeft24.addEventListener("click", () => {
				if (page < 3) {
					arrowLeft24.classList.add("disabled");
				}
				if (page <= 1) { return; }
				arrowRight24.classList.remove("disabled");
				start -= 6;
				page -= 1;
				forecastTiles.innerHTML = forecastFirstColumn;
				renderHourly();
			});

			let threeDaysFirstColumn = `
			<div class="tile" style="text-align: left;">
				<p style="color: transparent;">Datum</p>
				<hr style="border: none;">
				<img src="pix/dummy.webp" alt="Unsichtbarer Platzhalter" class="icon">
				<hr>
				<p>Tageszeit</p>
				<hr>
				<p>Temperatur</p>
				<hr>
				<p>Wind</p>
				<hr>
				<p>Windrichtung</p>
				<hr>
				<p>Luftfeuchte</p>
				<hr>
				<p>Regen</p>
			</div>
			`;

			let counter = 1;

			const renderDaily = () => {

				threeDaysTiles.innerHTML = threeDaysFirstColumn;

				const renderDailyTile = (startNumber, stopNumber) => {
					let daily = {
						temperature: [],
						cloudCover: [],
						windSpeed: [],
						windDirection: [],
						precipitation: [],
						humidity: [],
						weatherCode: []
					}

					let index = startNumber;
					for (let iteration = 0; iteration < 4; iteration++) {
						let temperature = 0;
						let minMaxArray = [];
						for (let i = index; i < index + 6; i++) {
							temperature += hourly.temperature_2m[i];
							minMaxArray.push(hourly.temperature_2m[i]);
						}
						if (iteration === 0 || iteration === 2) {
							daily.temperature.push((temperature / 6).toFixed(0));	// get average temperature for morning and evening
						}
						if (iteration === 1) {
							daily.temperature.push(Math.max(...minMaxArray).toFixed(0));	// get maximum temperature for afternoon
						}
						if (iteration === 3) {
							daily.temperature.push(Math.min(...minMaxArray).toFixed(0));	// get minimum temperature for nights
						}

						let cloudCover = 0;
						for (let i = index; i < index + 6; i++) {
							cloudCover += hourly.cloud_cover[i];
						}
						daily.cloudCover.push((cloudCover / 6).toFixed(0));

						let wind = 0;
						for (let i = index; i < index + 6; i++) {
							wind += hourly.wind_speed_10m[i];
						}
						daily.windSpeed.push((wind / 6).toFixed(0));

						let windDirection = 0;
						for (let i = index; i < index + 6; i++) {
							windDirection += hourly.wind_direction_10m[i];
						}
						daily.windDirection.push((windDirection / 6).toFixed(0));

						let precipitation = 0;
						for (let i = index; i < index + 6; i++) {
							precipitation += hourly.precipitation_probability[i];
						}
						daily.precipitation.push((precipitation / 6).toFixed(0));

						let humidity = 0;
						for (let i = index; i < index + 6; i++) {
							humidity += hourly.relative_humidity_2m[i];
						}
						daily.humidity.push((humidity / 6).toFixed(0));
						daily.weatherCode.push(hourly.weather_code[index + 3]);
						index += 6;
					}

					threeDaysTiles.insertAdjacentHTML("beforeend", `
					<div class="tile" id=id_${counter}>
						<div><p>${dayPicker(hourly.time[startNumber])}, ${(hourly.time[startNumber]).substring(8, 10)}.${(hourly.time[startNumber]).substring(5, 7)}.${(hourly.time[startNumber]).substring(0, 4)}</p></div>
						<hr>
						<div class="subTiles"><div><img src=${iconPicker(9, Number(data.daily.sunrise[0].substring(11, 13)), Number(data.daily.sunset[0].substring(11, 13)), daily.weatherCode[0])} alt="Wettersymbol" class="icon" title="${iconMap[daily.weatherCode[0]][0]}, Wolkendecke: ${daily.cloudCover[0]}%"></div><div><img src=${iconPicker(15, Number(data.daily.sunrise[0].substring(11, 13)), Number(data.daily.sunset[0].substring(11, 13)), daily.weatherCode[1])} alt="Wettersymbol" class="icon" title="${iconMap[daily.weatherCode[1]][0]}, Wolkendecke: ${daily.cloudCover[1]}%"></div><div><img src=${iconPicker(21, Number(data.daily.sunrise[0].substring(11, 13)), Number(data.daily.sunset[0].substring(11, 13)), daily.weatherCode[2])} alt="Wettersymbol" class="icon" title="${iconMap[daily.weatherCode[2]][0]}, Wolkendecke: ${daily.cloudCover[2]}%"></div><div><img src=${iconPicker(3, Number(data.daily.sunrise[0].substring(11, 13)), Number(data.daily.sunset[0].substring(11, 13)), daily.weatherCode[3])} alt="Wettersymbol" class="icon" title="${iconMap[daily.weatherCode[3]][0]}, Wolkendecke: ${daily.cloudCover[3]}%"></div></div>
						<hr>
						<div class="subTiles"><div title="06:00-12:00 Uhr">Vorm.</div><div title="12:00-18:00 Uhr">Nachm.</div><div title="18:00-00:00 Uhr">Abend</div><div title="00:00-06:00 Uhr">Nacht</div></div>
						<hr>
						<div class="subTiles"><div style="color: ${tempColorPicker(daily.temperature[0])}">${daily.temperature[0]}<span class="unit">&#8239°C</span></div><div style="color: ${tempColorPicker(daily.temperature[1])}">${daily.temperature[1]}<span class="unit">&#8239°C</span></div><div style="color: ${tempColorPicker(daily.temperature[2])}">${daily.temperature[2]}<span class="unit">&#8239°C</span></div><div style="color: ${tempColorPicker(daily.temperature[3])}">${daily.temperature[3]}<span class="unit">&#8239°C</span></div></div>
						<hr>
						<div class="subTiles"><div style="color: ${windColorPicker(daily.windSpeed[0])}">${daily.windSpeed[0]}<span class="unit">&#8239km/h</span></div><div style="color: ${windColorPicker(daily.windSpeed[1])}">${daily.windSpeed[1]}<span class="unit">&#8239km/h</span></div><div style="color: ${windColorPicker(daily.windSpeed[2])}">${daily.windSpeed[2]}<span class="unit">&#8239km/h</span></div><div style="color: ${windColorPicker(daily.windSpeed[3])}">${daily.windSpeed[3]}<span class="unit">&#8239km/h</span></div></div>
						<hr>
						<div class="subTiles"><div style="transform: rotate(${daily.windDirection[0]}deg);" title="${daily.windDirection[0]} °">↓</div><div style="transform: rotate(${daily.windDirection[1]}deg);" title="${daily.windDirection[1]} °">↓</div><div style="transform: rotate(${daily.windDirection[2]}deg);" title="${daily.windDirection[2]} °">↓</div><div style="transform: rotate(${daily.windDirection[3]}deg);" title="${daily.windDirection[3]} °">↓</div></div>
						<hr>
						<div class="subTiles"><div>${daily.humidity[0]}<span class="unit">&#8239%</span></div><div>${daily.humidity[1]}<span class="unit">&#8239%</span></div><div>${daily.humidity[2]}<span class="unit">&#8239%</span></div><div>${daily.humidity[3]}<span class="unit">&#8239%</span></div></div>
						<hr>
						<div class="subTiles"><div>${daily.precipitation[0]}<span class="unit">&#8239%</span></div><div>${daily.precipitation[1]}<span class="unit">&#8239%</span></div><div>${daily.precipitation[2]}<span class="unit">&#8239%</span></div><div>${daily.precipitation[3]}<span class="unit">&#8239%</span></div></div>
					</div>
					`);
					counter += 1;
				}
				renderDailyTile(30, 53);
				renderDailyTile(54, 77);
				renderDailyTile(78, 101);
				renderDailyTile(102, 123);
				// console.log(hourly);
			}

			renderDaily();

			const id_1 = document.querySelector("#id_1");
			const id_2 = document.querySelector("#id_2");
			const id_3 = document.querySelector("#id_3");
			const id_4 = document.querySelector("#id_4");
			const arrowRight3Days = document.querySelector("#arrowRight3Days");
			const arrowLeft3Days = document.querySelector("#arrowLeft3Days");

			if (window.innerWidth > 850) {
				id_3.style.display = "none";
				id_4.style.display = "none"
				arrowRight3Days.addEventListener("click", () => {
					id_1.style.display = "none";
					id_2.style.display = "none";
					id_3.style.display = "block";
					id_4.style.display = "block";
					arrowLeft3Days.classList.remove("disabled");
					arrowRight3Days.classList.add("disabled");
				});
				arrowLeft3Days.addEventListener("click", () => {
					id_3.style.display = "none";
					id_4.style.display = "none";
					id_1.style.display = "block";
					id_2.style.display = "block";
					arrowLeft3Days.classList.add("disabled");
					arrowRight3Days.classList.remove("disabled");
				})
			}

		})
		.catch(error => {
			console.error(error);
			showAlert(error);
		});
}

pickLocation(city, country, lat, lon);

setInterval(() => {
	pickLocation(city, country, lat, lon);
}, 900000);

linkToTerms.addEventListener("click", () => {
	if (terms.style.display === "block") {
		window.scrollTo(0, 0);
		terms.style.display = "none";
		closeTerms.style.display = "none"
	} else {
		terms.style.display = "block";
		closeTerms.style.display = "block";
		terms.scrollIntoView();
	}
});

setTimeout(() => {
	document.querySelector(".main").style.display = "block";
	document.querySelector(".loader").style.display = "none";
}, 250);
