import {DateTime} from '../node_modules/luxon/src/luxon.js';

//All Glocal Elements
const cityInput = document.getElementById('city');
const cityName = document.getElementById('cityName');
const getCurrentLocation = document.getElementById('location');
const searchIcon = document.getElementById('searchIcon');
const info = document.querySelector('.current-info');
const errScreen = document.querySelector('.search-something');
const temp = document.querySelector('.temp');
const weatherIcon = document.querySelector('.weather-img');
const toggleTempUnit = document.getElementById('temp-switch');
const weatherDescr = document.querySelector('.weather-type');
const feelsLikeTemp = document.getElementById("feels-like");
const sunsetTime = document.getElementById('sunset');
const sunriseTime = document.getElementById('sunrise');
const windSpeed = document.getElementById('wind-speed');
const windDirection = document.getElementById('wind-direction');
const speedToggle = document.getElementById('speed-switch');
const directionToggle = document.getElementById('direction-switch');
const latitude = document.getElementById('lat');
const longitude = document.getElementById('lon');
const humidity = document.getElementById('humidity');
const minTemp = document.getElementById('min-temperature');
const maxTemp = document.getElementById('max-temperature');
const tempToggle = document.getElementById('temp-switch-2');

const futureImg1 = document.getElementById('future-img-1');
const futureImg2 = document.getElementById('future-img-2');
const futureImg3 = document.getElementById('future-img-3');
const futureImg4 = document.getElementById('future-img-4');
const futureImg5 = document.getElementById('future-img-5');

const futureDay1 = document.getElementById('future-day-1');
const futureDay2 = document.getElementById('future-day-2');
const futureDay3 = document.getElementById('future-day-3');
const futureDay4 = document.getElementById('future-day-4');
const futureDay5 = document.getElementById('future-day-5');

async function loadCountries() {
    return fetch('countries.json')
        .then(response => response.json())
        .catch(error => {
            console.error(`${error}: Unable to load JSON file.`);
            return []; // Return an empty array in case of an error
        });
}

let countries;
const countriesPromise = loadCountries();
countriesPromise.then(data => {
    countries = data;
});

function getCurrentLocationWeather() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError
      );
    } else {
      updateCityName("Location not supported on this browser.");
    }
}

function getLocationWeather () {
    const userInput = cityInput.value.trim();
    const isValidFormat = validateLocationFormat(userInput);

    if (isValidFormat) fetchWeatherData(userInput);
    else updateCityName(`Invalid format of ${userInput}`);
}

function validateLocationFormat(input) {
    const parts = input.split(',');
    return (parts.length === 1 || parts.length === 3);
}
  
function handleLocationSuccess(position) {
    const { latitude, longitude } = position.coords;
    fetchLocationData(latitude, longitude);
}

function handleLocationError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

function fetchLocationData(latitude, longitude) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(response => response.json())
        .then(data => {
            if (data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
                const state = data.address.state || data.address.province;
                const country = data.address.country;
                const formattedLocation = `${city}, ${state ? state + ', ' : ''}${country}`;                
                fetchWeatherData(formattedLocation);
            } else {
                updateCityName('Location data not available');
            }
        })
        .catch(error => {
            console.error('Error fetching city:', error);
            updateCityName('Error fetching city');
        });
}

function fetchWeatherData(location) {

    if (!location) {
        cityInput.value = "";
        return;
    }

    const apiKey = "d4bb3287f300f3eb0ffde66cc48bf67d";
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            //Process the weather data here
            if (data && data.sys && data.sys.country){
                info.classList.remove('hide');
                const city = data.name;
                const countryCode = data.sys.country;
                const country = countries.find(item => item.code === countryCode);
                const countryName = country ? country.name : countryCode;
                const formattedLocation = `${city}, ${countryName}`;
                updateCityName(formattedLocation);
                toggleTempUnit.checked = false;
                speedToggle.checked = false;
                directionToggle.checked = false;
                //errScreen.classList.add('hide');
                cityInput.value = "";
                updateWeatherInfo(data);
                console.log(data);
                fetchForecastData(data, apiKey);
            } else {
                alert("City Not Found.");
                cityInput.value = "";
            }
        }).catch(error => {
            console.error('Error fetching weather data:', error);
            cityInput.value = "";
        });
}

function updateCityName(city) {
    cityName.textContent = city;
}

function updateWeatherInfo (data) {
    updateTemperature(data.main);
    updateWeatherIcon(data.weather[0]);
    updateHumidity(data.main.humidity);
    calcSunriseSunset(data);
    calcWindSpeed(data.wind);
    updateWindDirection(data.wind);
    updateLat(data.coord.lat);
    updateLon(data.coord.lon);
}

function updateHumidity (value) {
    humidity.innerHTML = Math.round(Number(value)) + "%";
}

function updateLat (lat) {
    latitude.innerHTML = Math.round(Number(lat)) + "°";
}

function updateLon(lon) {
    longitude.innerHTML = Math.round(Number(lon)) + "°";
}

function updateTemperature (tempObject) {
    let kelvinTemp = tempObject.temp;
    let kelvinFeelsLikeTemp = tempObject.feels_like;
    temp.innerHTML = kelvinToCelsius(kelvinTemp) + "°C";
    feelsLikeTemp.innerHTML = "Feels Like " + kelvinToCelsius(kelvinFeelsLikeTemp) + "°C";
    maxTemp.innerHTML = (kelvinToCelsius(tempObject.temp_max)) + '°C';
    minTemp.innerHTML = (kelvinToCelsius(tempObject.temp_min)) + '°C';
}

function updateDescription (description) {
    weatherDescr.innerText = description;
}

function updateWeatherIcon(weatherObject) {
    let description = weatherObject.description;
    weatherIcon.src = `openweathermap/${weatherObject.icon}.svg`;
    const parts = description.split(' ');
    let newDescription = "";
    for (let part of parts) {
        newDescription += `${part[0].toUpperCase()}${part.slice(1)} `;
    }
    updateDescription(newDescription);
}

function kelvinToCelsius (kelvin) {
    return (Math.round(kelvin - 273.15));
}

function celsiusToFahrenheit (celsius) {
    return Math.round((celsius * 9/5) + 32); 
}

function fahrenheitToCelsius (fahrenheit) {
    return Math.round(((fahrenheit - 32) * 5) / 9);
}

function calcSunriseSunset(data) { 
    const geoAPI = "582630bfc17d473398bba6fd8dce0dc8";
    fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${data.coord.lat}&lon=${data.coord.lon}&format=json&apiKey=${geoAPI}`)
        .then(response => response.json())
        .then(result => {
            const timeZoneName = result.results[0].timezone.name;
            const sunriseDate = DateTime.fromSeconds(data.sys.sunrise, {zone:timeZoneName});
            const sunsetDate = DateTime.fromSeconds(data.sys.sunset, {zone:timeZoneName});
            sunriseTime.innerHTML = sunriseDate.toFormat("h:mm a");
            sunsetTime.innerHTML = sunsetDate.toFormat("h:mm a");
        })
        .catch(error => console.log('error', error));
}

function convertMStoKMH (ms) {
    return Math.round(ms * 3.6);
}

function calcWindSpeed (windObject) {
    windSpeed.innerHTML = convertMStoKMH(windObject.speed) + " km/h";
}

function updateWindDirection (windObject) {
    windDirection.innerHTML = windObject.deg + "°";
}

getCurrentLocation.addEventListener('click', getCurrentLocationWeather);
cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') getLocationWeather();
})

searchIcon.addEventListener('click', () => {
    getLocationWeather();
});

function spliceTemperature (temperature){
    let numericPart = '';
    for (let i = 0; i < temperature.length; i++) {
        if (!isNaN(temperature[i])) numericPart += temperature[i];
    }
    return numericPart;
}

function convertKMHtoMPH (kmh) {
    return Math.round(kmh / 1.6);
}

function convertMPHtoKMH (mph) {
    return Math.round(mph * 1.6);
}

function degreesToBearing(degrees) {
    const primaryDirections = ['N', 'E', 'S', 'W'];
    const secondaryDirections = ['N', 'E', 'S', 'W'];
    
    const primaryIndex = Math.floor((degrees + 22.5) / 90) % 4;
    const secondaryIndex = Math.floor((degrees + 67.5) / 90) % 4;

    const primaryDirection = primaryDirections[primaryIndex];
    const secondaryDirection = secondaryDirections[secondaryIndex];

    return `${primaryDirection} ${Math.round(degrees % 90)}° ${secondaryDirection}`;
}

function bearingToDegrees(bearingNotation) {
    const parts = bearingNotation.split(' ');
    const primaryDirection = parts[0];
    const secondaryDirection = parts[2];
    const degrees = parseInt(parts[1], 10);

    const primaryDirections = ['N', 'E', 'S', 'W'];
    const primaryIndex = primaryDirections.indexOf(primaryDirection);

    if (primaryIndex === -1) {
        return NaN; // Invalid bearing notation
    }

    const secondaryDirections = ['N', 'E', 'S', 'W'];
    const secondaryIndex = secondaryDirections.indexOf(secondaryDirection);

    if (secondaryIndex === -1) {
        return NaN; // Invalid bearing notation
    }

    const baseAngle = primaryIndex * 90;
    let secondaryAngle = 0;

    if (secondaryIndex === 1 || secondaryIndex === 3) {
        secondaryAngle = 45;
    }

    return baseAngle + degrees + secondaryAngle + '°';
}


toggleTempUnit.addEventListener('change', () => {
    const oldTemp = temp.innerHTML;
    const parts = feelsLikeTemp.textContent.split(' ');
    if (oldTemp.endsWith("°C")) {
        let celsiusFeelsLike = Number(parts[2].replace("°C", ""));
        feelsLikeTemp.textContent = "Feels Like " + celsiusToFahrenheit(celsiusFeelsLike) + "°F";
        temp.innerHTML = celsiusToFahrenheit(spliceTemperature(oldTemp)) + "°F";
    } else {
        let fahrenheitFeelsLike = Number(parts[2].replace("°F", ""));
        feelsLikeTemp.textContent = "Feels Like " + fahrenheitToCelsius(fahrenheitFeelsLike) + "°C";
        temp.innerHTML = fahrenheitToCelsius(spliceTemperature(oldTemp)) + "°C";
    }
});

tempToggle.addEventListener('change', () => {
    const oldMin = minTemp.innerHTML;
    const oldMax = maxTemp.innerHTML; 
    if (oldMin.endsWith('°C')) {
        minTemp.innerHTML = celsiusToFahrenheit(spliceTemperature(oldMin)) + "°F";
        maxTemp.innerHTML = celsiusToFahrenheit(spliceTemperature(oldMax)) + "°F";
    } else {
        minTemp.innerHTML = fahrenheitToCelsius(spliceTemperature(oldMin)) + "°C";
        maxTemp.innerHTML = fahrenheitToCelsius(spliceTemperature(oldMax)) + "°C";
    }
});

speedToggle.addEventListener('change', () => {
    const parts = windSpeed.innerHTML.split(' ');
    if (parts[1] === 'km/h') windSpeed.innerHTML = convertKMHtoMPH(Number(parts[0])) + " mph"; 
    else windSpeed.innerHTML = convertMPHtoKMH(Number(parts[0])) + " km/h";
});

directionToggle.addEventListener('change', () => {
    if (windDirection.innerHTML.endsWith('°')) {
        const degrees = windDirection.innerHTML.slice(0, windDirection.innerHTML.indexOf('°'));
        windDirection.innerHTML = degreesToBearing(degrees);
    } else {
        windDirection.innerHTML = bearingToDegrees(windDirection.innerHTML);
    }
}); 

function fetchForecastData(weatherData, key) {
    const futureUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${key}`;
    fetch(futureUrl)
        .then(response => response.json())
        .then(data => {
            console.log("Forecast Data:", data);
            updateForecastData(data);
        })
        .catch(error => {
            console.error("Error fetching forecast data:", error);
        });
};

function updateForecastData(data) {
    const maxMinTemps = getMaxMinForecastTemps(data);
    updateDayNames(maxMinTemps);
    updateDailyWeather(maxMinTemps);
}

function updateDayNames (obj) {
    let counter = 1;
    for (let day in obj) {
        let date = new Date(day);
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let dayOfWeek = daysOfWeek[date.getDay()];
        document.getElementById(`future-day-${counter}`).innerHTML = dayOfWeek;
        counter++;
    }
}

function getMaxMinForecastTemps (data) {
    const dailyTemps = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toISOString().split('T')[0];
        const temperature = kelvinToCelsius(item.main.temp_max);
        if (!dailyTemps[day]) {
            dailyTemps[day] = { max: temperature, min: temperature };
        } else {
            if (temperature > kelvinToCelsius(dailyTemps[day].max)) {
                dailyTemps[day].max = temperature;
            }
            if (temperature < kelvinToCelsius(dailyTemps[day].min)) {
                dailyTemps[day].min = temperature;
            }
        }
    });
    return dailyTemps;
}

function updateDailyWeather (maxMin) {
    let counter = 1;
    for (let day in maxMin){
        document.getElementById(`top-temp-${counter}`).innerHTML = maxMin[day].max + "°C";
        document.getElementById(`bottom-temp-${counter}`).innerHTML = maxMin[day].min + "°C";
        counter++;
    }
}


