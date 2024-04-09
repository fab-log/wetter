const cities = [
	["Berlin", 52.51, 13.40],
	["Hamburg", 53.51, 10.00],
	["Munich", 48.13, 11.57],
	["Düsseldorf", 51.23, 6.78],
	["Frankfurt", 50.11, 8.68],
	["Stuttgart", 48.78, 9.18],
	["Leipziig", 51.33, 12.38]
]

console.log("window width: " + window.innerWidth + "px");

let city = "Berlin";
let lat = 52.51;
let lon = 13.4;
let config = {};

const getConfig = () => {
	if (localStorage.getItem("fablogWetterConfig") === null) {
			config = {
					city: "Berlin",
					lat: 52.51,
					lon: 13.4
			}
	} else {
			config = JSON.parse(localStorage.getItem("fablogWetterConfig"));
	};
	console.log("config: " + JSON.stringify(config, null, 2));
}

getConfig();

city = config.city;
lat = config.lat;
lon = config.lon;

let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,relative_humidity_2m,precipitation_probability,weather_code,cloud_cover&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation_probability,weather_code,cloud_cover`;
// const url = "https://api.open-meteo.com/v1/forecast?latitude=51.48&longitude=7.22&current=temperature_2m,wind_speed_10m,relative_humidity_2m,precipitation_probability,weather_code&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code";

const inpSearch = document.querySelector("#inpSearch");
const modalSearchResults = document.querySelector("#modalSearchResults");
const currentCity = document.querySelector("#currentCity");
// const btnSearch = document.querySelector("#btnSearch");

const pickLocation = (location, latitude, longitude) => {
	lat = latitude;
	lon = longitude;
	url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,relative_humidity_2m,precipitation_probability,weather_code,cloud_cover&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation_probability,weather_code,cloud_cover`;
	getData(url);
	currentCity.innerHTML = location;
	modalSearchResults.style.display = "none";
	config = {
		city: location,
		lat: latitude,
		lon: longitude
	}
	localStorage.setItem("fablogWetterConfig", JSON.stringify(config));
}

const search = () => {
	searchName = inpSearch.value;
	let searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${searchName}&count=5&language=de&format=json`;
	if (inpSearch.value === "" || inpSearch.value.trim() === "") {return;}
	fetch(searchUrl)
		.then(response => {
			if (!response.ok) {
				throw new Error("API issues.");
		}
		return response.json();
		})
		.then(data => {			
			console.log("search response" + JSON.stringify(data, null, 2));
			modalSearchResults.innerHTML = "<h3>Bitte wählen</h3>";
			modalSearchResults.style.display = "block";
			let index = 1;
			
			data.results.forEach(e => {;
				modalSearchResults.insertAdjacentHTML("beforeend", `
				<p id="index${index}" onclick="pickLocation('${e.name}', ${e.latitude}, ${e.longitude})">${e.name}, ${e.country}</p>
				`);

				index += 1;
			});
			inpSearch.value = "";
		})
		.catch(error => {
			console.error(error);
	});
}

inpSearch.addEventListener("change", search);
// btnSearch.addEventListener("click", search);

const iconPicker = (clouds, rain) => {
	let imagePath = "pix/sunny.webp";
	if (rain > 50) {imagePath = "pix/rain.webp"}
	else if (clouds > 33 && clouds <= 75) {imagePath = "pix/partially_cloudy.webp"}
	else if (clouds > 75) {imagePath = "pix/cloudy.webp"};
	return imagePath;
}

const getData = (url) => {
	fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error("API issues.");
        }
        return response.json();
    })
    .then(data => {
			let current = data.current;

			const renderCurrent = () => {
				currentCity.innerHTML = config.city;
				let currentTime = `${Number(current.time.substring(11, 13)) + 2}:${current.time.substring(14)}`;
				if ((Number(current.time.substring(11, 13)) + 2) === 25) {currentTime = "01:00"};
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
						<p>${currentTime}</p>
						<hr>
						<p>${current.temperature_2m.toFixed(0)}°C</p>
						<hr>
						<p>${current.wind_speed_10m.toFixed(0)} km/h</p>
						<hr>
						<p style="transform: rotate(${current.wind_direction_10m}deg); scale: 1.5">⇈</p>
						<hr>
						<p>${current.relative_humidity_2m}%</p>
						<hr>
						<p>${current.precipitation_probability}%</p>
					</div>
					<div class="tile" style="background-color: transparent; grid-area: icon;">
						<img src=${iconPicker(current.cloud_cover, current.precipitation_probability)} title="Wolkendecke: ${current.cloud_cover}%" />
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

			for (let i = 0; i < 48; i++) {
				console.log("########################");
				console.log(hourly.time[i].substring(0, 10) + " | " + hourly.time[i].substring(11));
				console.log("temp: " + hourly.temperature_2m[i]);
				console.log("wind: " + hourly.wind_speed_10m[i]);
				console.log("direction: " + hourly.wind_direction_10m[i]);
				console.log("humidity: " + hourly.relative_humidity_2m[i]);
				console.log("precipitation: " + hourly.precipitation_probability[i]);
				console.log("cloud cover: " + hourly.cloud_cover[i]);
			}
			
			const renderHourly = () => {
				forecastTiles.innerHTML = forecastFirstColumn;
				if (window.innerWidth < 850) {
					length = 24;
					document.querySelectorAll(".arrows").forEach(e => {
						e.style.display = "none"
					});
				}
				for(let i = start; i < start + length; i++) {
					let time = `${Number(hourly.time[i].substring(11, 13)) + 2}:00`;
					if ((Number(hourly.time[i].substring(11, 13)) + 2) === 25) {time = "01:00"}
					forecastTiles.insertAdjacentHTML("beforeend", `
						<div class="tile" id="index${i}">
							<img src=${iconPicker(hourly.cloud_cover[i], hourly.precipitation_probability[i])} class="icon" title="Wolkendecke: ${hourly.cloud_cover[i]}%">
							<hr>
							<p>${time}</p>
							<hr>
							<p>${hourly.temperature_2m[i].toFixed(0)}°C</p>
							<hr>
							<p>${hourly.wind_speed_10m[i].toFixed(0)} km/h</p>
							<hr>
							<p style="transform: rotate(${hourly.wind_direction_10m[i]}deg); scale: 1.5">⇈</p>
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
				}, 1500);
				setTimeout(() => {
					document.querySelector(".forecastTiles").scrollIntoView({ inline: "end" });
				}, 2750);
			}

			let arrowRight = document.querySelector("#arrowRight");
			let arrowLeft = document.querySelector("#arrowLeft");
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
    });
}

getData(url);
