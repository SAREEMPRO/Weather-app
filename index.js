const apiKey = '7017e0559046146716f7ed1712011566';

async function getWeatherData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function updateWeatherCards(forecastData) {
    const weatherCards = document.querySelectorAll('.weather-cards li');

    for (let i = 0; i < weatherCards.length; i++) {
        const card = weatherCards[i];
        const date = new Date(forecastData.list[i * 8].dt * 1000); // Fetch data for every 24 hours (8 times per day)
        const dateString = date.toISOString().split('T')[0];

        card.querySelector('h3').textContent = `(${dateString})`;
        card.querySelector('img').src = `https://openweathermap.org/img/w/${forecastData.list[i * 8].weather[0].icon}.png`;
        card.querySelector('h6:nth-of-type(1)').textContent = `Temp: ${forecastData.list[i * 8].main.temp}°C`;
        card.querySelector('h6:nth-of-type(2)').textContent = `Wind: ${forecastData.list[i * 8].wind.speed} M/S`;
        card.querySelector('h6:nth-of-type(3)').textContent = `Humidity: ${forecastData.list[i * 8].main.humidity}%`;
    }
}

function updateCurrentWeather(currentWeatherElement, data, cityName) {
    const date = new Date(data.list[0].dt * 1000);
    const dateString = date.toISOString().split('T')[0];

    currentWeatherElement.querySelector('h2').textContent = `${cityName} (${dateString})`;
    currentWeatherElement.querySelector('img').src = `https://openweathermap.org/img/w/${data.list[0].weather[0].icon}.png`;
    currentWeatherElement.querySelector('h6:nth-of-type(1)').textContent = `Temp: ${data.list[0].main.temp}°C`;
    currentWeatherElement.querySelector('h6:nth-of-type(2)').textContent = `Wind: ${data.list[0].wind.speed} M/S`;
    currentWeatherElement.querySelector('h6:nth-of-type(3)').textContent = `Humidity: ${data.list[0].main.humidity}%`;
}


document.querySelector('.search-btn').addEventListener('click', async function () {
    const cityInput = document.querySelector('.city-input');
    const cityName = cityInput.value.trim();

    if (cityName !== '') {
        const forecastData = await getWeatherData(cityName);

        if (forecastData) {
            updateCurrentWeather(document.querySelector('.current-weather'), forecastData, cityName);
            updateWeatherCards(forecastData);
        }
    }
});

document.querySelector('.location-btn').addEventListener('click', async function () {
    try {
        const position = await getCurrentLocation();
        const { latitude, longitude } = position.coords;

        const cityName = await getCityNameByCoordinates(latitude, longitude);

        if (cityName) {
            document.querySelector('.city-input').value = cityName;
            const forecastData = await getWeatherData(cityName);

            if (forecastData) {
                updateCurrentWeather(document.querySelector('.current-weather'), forecastData, cityName);
                updateWeatherCards(forecastData);
            }
        }
    } catch (error) {
        console.error('Error getting current location:', error);
    }
});

async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

async function getCityNameByCoordinates(latitude, longitude) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        return data.address.city || data.address.town;
    } catch (error) {
        console.error('Error fetching city name:', error);
        return null;
    }
}