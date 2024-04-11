let city = "Berlin";
let lat = 52.51;
let lon = 13.4;
let config = {};

const inpSearch = document.querySelector("#inpSearch");
const modalSearchResults = document.querySelector("#modalSearchResults");
const currentCity = document.querySelector("#currentCity");
const btnLightMode = document.querySelector("#btnLightMode");
const btnDarkMode = document.querySelector("#btnDarkMode");


	// ###### HELPERS ######

const toggleLightMode = () => {
	document.body.classList.add("light-mode");
	btnLightMode.style.display = "none";
	btnDarkMode.style.display = "block";
	config.mode = "light";
	localStorage.setItem("fablogWetterConfig", JSON.stringify(config));
}

const toggleDarkMode = () => {
	document.body.classList.remove("light-mode");
	btnDarkMode.style.display = "none";
	btnLightMode.style.display = "block";
	config.mode = "dark";
	localStorage.setItem("fablogWetterConfig", JSON.stringify(config));
}

const iconPicker = (clouds, rain, time, sunrise, sunset) => {
	let imagePath = "pix/sunny.webp";
	if (rain > 50) {imagePath = "pix/rain.webp"}
	else if (time > sunset && clouds > 33 && clouds <= 75) {imagePath = "pix/partially_cloudy_night.webp"}
	else if (time <= sunrise && clouds > 33 && clouds <= 75) {imagePath = "pix/partially_cloudy_night.webp"}
	else if (clouds > 33 && clouds <= 75) {imagePath = "pix/partially_cloudy.webp"}
	else if (clouds > 75) {imagePath = "pix/cloudy.webp"}
	else if (time > sunset || time <= sunrise) {imagePath = "pix/sunny_night.webp"}
	return imagePath;
}

const pickLocation = (location, latitude, longitude) => {
	lat = latitude;
	lon = longitude;
	let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation_probability,cloud_cover,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,cloud_cover,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset&timezone=Europe%2FBerlin`;
	getData(url);
	currentCity.innerHTML = location;
	modalSearchResults.style.display = "none";
	config.city = location;
	config.lat = latitude;
	config.lon = longitude;
	localStorage.setItem("fablogWetterConfig", JSON.stringify(config));
};

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
	if (localStorage.getItem("fablogWetterConfig") === null) {
			config = {
					city: "Berlin",
					lat: 52.51,
					lon: 13.4,
					mode: "dark"
			}
	} else {
			config = JSON.parse(localStorage.getItem("fablogWetterConfig"));
			city = config.city;
			lat = config.lat;
			lon = config.lon;
			mode = config.mode;
	};
	console.log("config: " + JSON.stringify(config, null, 2));
}

getConfig();
if (config.mode === "light") {toggleLightMode()};


// ###### SEARCH ######

const search = () => {
	searchName = inpSearch.value;
	let searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${searchName}&count=5&language=de&format=json`;
	if (inpSearch.value === "" || inpSearch.value.trim() === "") {return;}
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
				pickLocation(results.name, results.latitude, results.longitude);
				return;
			} else {
				modalSearchResults.innerHTML = "<h3>Bitte wählen</h3>";
				modalSearchResults.style.display = "block";
				let index = 1;
				data.results.forEach(e => {
					modalSearchResults.insertAdjacentHTML("beforeend", `
					<p id="index${index}" onclick="pickLocation('${e.name}', ${e.latitude}, ${e.longitude})">${e.name}, ${e.country}</p>
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
				let windColor = "var(--color1)";
				let tempColor = "var(--color1)";
				if (current.temperature_2m > 29.9) {tempColor = "var(--accent-orange)"};
				if (current.temperature_2m <= 0) {tempColor = "var(--accent-light)"};
				if (current.wind_speed_10m > 30) {windColor = "var(--accent-orange)"};
				document.querySelector(".currentTiles").innerHTML = `
					<div class="tile" style="text-align: left; grid-area: legende;">
						<p>${(current.time).substring(8, 10)}.${(current.time).substring(5, 7)}.${(current.time).substring(0, 4)}</p>
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
					<div class="tile" style="grid-area: werte";>
						<p>${current.time.substring(11)}</p>
						<hr>
						<p style="color: ${tempColor}">${current.temperature_2m.toFixed(0)}°C</p>
						<hr>
						<p style="color: ${windColor};">${current.wind_speed_10m.toFixed(0)} km/h</p>
						<hr>
						<p style="transform: rotate(${current.wind_direction_10m}deg); scale: 1.5;" title="${current.wind_direction_10m}°">↓</p>
						<hr>
						<p>${current.relative_humidity_2m}%</p>
						<hr>
						<p>${current.precipitation_probability}%</p>
					</div>
					<div class="tile" style="background-color: transparent; grid-area: icon;">
						<img src=${iconPicker(current.cloud_cover, current.precipitation_probability, Number(current.time.substring(11, 13)), Number(data.daily.sunrise[0].substring(11, 13)), Number(data.daily.sunset[0].substring(11, 13)))} title="Wolkendecke: ${current.cloud_cover}%" />
					</div>
				`;
			}

			renderCurrent();			
				
			let start = Number(current.time.substring(11, 13)) + 1;
			let length = 6;
			let hourly = data.hourly;
			let forecastTiles = document.querySelector(".forecastTiles");
			let forecastFirstColumn = `
			<div class="tile" style="text-align: left;">
				<img src="pix/dummy.webp" class="icon">
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

			/* for (let i = 0; i < 48; i++) {
				console.log("########################");
				console.log(hourly.time[i].substring(0, 10) + " | " + hourly.time[i].substring(11));
				console.log("temp: " + hourly.temperature_2m[i]);
				console.log("wind: " + hourly.wind_speed_10m[i]);
				console.log("direction: " + hourly.wind_direction_10m[i]);
				console.log("humidity: " + hourly.relative_humidity_2m[i]);
				console.log("precipitation: " + hourly.precipitation_probability[i]);
				console.log("cloud cover: " + hourly.cloud_cover[i]);
			} */
			
			const renderHourly = () => {
				forecastTiles.innerHTML = forecastFirstColumn;
				document.querySelector("#forecast").innerHTML = `
					<img src="pix/sunrise.webp" class="sun-icon"> ${data.daily.sunrise[0].substring(11)} · <img src="pix/sunset.webp" class="sun-icon"> ${data.daily.sunset[0].substring(11)}
				`;
				if (window.innerWidth < 850) {
					length = 24;
					document.querySelectorAll(".arrows").forEach(e => {
						e.style.display = "none"
					});
				}
				for(let i = start; i < start + length; i++) {
					let time = `${hourly.time[i].substring(11)}`;
					let windColor = "var(--color1)";
					let tempColor = "var(--color1)";
					if (hourly.temperature_2m[i] > 29.9) {tempColor = "var(--accent-orange)"};
					if (hourly.temperature_2m[i] <= 0) {tempColor = "var(--accent-light)"};
					if (hourly.wind_speed_10m[i] > 30) {windColor = "var(--accent-orange)"};
					forecastTiles.insertAdjacentHTML("beforeend", `
						<div class="tile" id="index${i}">
							<img src=${iconPicker(hourly.cloud_cover[i], hourly.precipitation_probability[i], Number(hourly.time[i].substring(11, 13)), Number(data.daily.sunrise[0].substring(11, 13)), Number(data.daily.sunset[0].substring(11, 13)))} class="icon" title="Wolkendecke: ${hourly.cloud_cover[i]}%">
							<hr>
							<p>${time}</p>
							<hr>
							<p style="color: ${tempColor}">${hourly.temperature_2m[i].toFixed(0)}°C</p>
							<hr>
							<p style="color: ${windColor};">${hourly.wind_speed_10m[i].toFixed(0)} km/h</p>
							<hr>
							<p style="transform: rotate(${hourly.wind_direction_10m[i]}deg); scale: 1.5;" title="${hourly.wind_direction_10m[i]}°">↓</p>
							<hr>
							<p>${hourly.relative_humidity_2m[i]}%</p>
							<hr>
							<p>${hourly.precipitation_probability[i]}%</p>
						</div>
					`);
				};
			}

			renderHourly();

			if (window.innerWidth < 850) {
				setTimeout(() => {
					document.querySelector("#index20").scrollIntoView();
				}, 2500);
				setTimeout(() => {
					document.querySelector(".forecastTiles").scrollIntoView({ inline: "end" });
				}, 4000);
			}

			let arrowRight = document.querySelector("#arrowRight");
			let arrowLeft = document.querySelector("#arrowLeft");
			arrowLeft.classList.add("disabled");
			arrowRight.classList.remove("disabled");
			let page = 1;

			arrowRight.addEventListener("click", () => {
				if (page > 2) {
					arrowRight.classList.add("disabled");
				}
				if (page >= 4) {return;}
				arrowLeft.classList.remove("disabled");
				start += 6;
				page += 1;
				forecastTiles.innerHTML = forecastFirstColumn;
				renderHourly();
			});

			arrowLeft.addEventListener("click", () => {
				if (page < 3) {
					arrowLeft.classList.add("disabled");
				}
				if (page <= 1) {return;}
				arrowRight.classList.remove("disabled");
				start -= 6;
				page -= 1;
				forecastTiles.innerHTML = forecastFirstColumn;
				renderHourly();
			});

    })
    .catch(error => {
        console.error(error);
				showAlert(error);
    });
}

pickLocation(city, lat, lon);

setInterval(() => {
	pickLocation(city, lat, lon);
}, 900000);
