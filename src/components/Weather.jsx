import React, { useState } from "react";
import axios from "axios";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Function to map weather code with emoji
  const getWeatherIcon = (code) => {
    if ([0].includes(code)) return "☀️ Clear sky";
    if ([1, 2].includes(code)) return "🌤️ Partly cloudy";
    if ([3].includes(code)) return "☁️ Cloudy";
    if ([45, 48].includes(code)) return "🌫️ Fog";
    if ([51, 53, 55, 56, 57].includes(code)) return "🌦️ Drizzle";
    if ([61, 63, 65, 80, 81, 82].includes(code)) return "🌧️ Rain";
    if ([66, 67].includes(code)) return "🌨️ Freezing rain";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️ Snow";
    if ([95].includes(code)) return "⛈️ Thunderstorm";
    if ([96, 99].includes(code)) return "🌩️ Thunder + hail";
    return "🌍 Unknown";
  };

  // ✅ Fetch city suggestions as user types
  const handleCityChange = async (e) => {
    const value = e.target.value;
    setCity(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${value}`
      );
      if (res.data.results) {
        setSuggestions(res.data.results);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Error fetching city suggestions:", err);
      setSuggestions([]);
    }
  };

  // ✅ When user clicks a suggestion
  const handleSelectCity = (name) => {
    setCity(name);
    setSuggestions([]);
  };


  // Weather fetch function
  const getWeather = async () => {
    if (!city) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Get latitude and longitude of city
      const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);

      console.log("GeoResponse: "+JSON.stringify(geoResponse.data.results))

      if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
        setError("City not found. Please enter a valid name.");
        setLoading(false);
        return;
      }
    //  Object destructuring to create variables latitude, longitude, name, and country
      const { latitude, longitude, name, country } = geoResponse.data.results[0];
      console.log(latitude, longitude, name, country)

      // Get current weather using latitude and longitude
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );

      console.log("Current weather: ",weatherResponse.data.current_weather)

      const current = weatherResponse.data.current_weather;

    //   set waether with current data

      setWeather({
        city: name,
        country: country,
        temperature: current.temperature,
        windspeed: current.windspeed,
        weathercode: current.weathercode,
        time: current.time,
      });

      console.log("Result",weather)
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[url('https://cdn.pixabay.com/photo/2016/11/29/07/19/clouds-1868060_1280.jpg')] bg-cover bg-center flex items-center justify-center p-6">
      <div className="backdrop-blur bg-white/30 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">Weather Now</h1>
        <p className="text-center text-gray-700 mt-2 mb-6">
          Check the current weather for any city
        </p>

        <div className="relative ">
            <div className="flex  ">
        <input
          type="text"
          value={city}
          onChange={handleCityChange}
          placeholder="Enter city name"
          className="w-full border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={getWeather}
          className=" bg-blue-500 text-white rounded-r-lg px-4 py-2 hover:bg-blue-600"
        >
          Search
        </button>
        </div>

    {/* Dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-lg shadow-md mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSelectCity(s.name)}
                className="px-3 py-2 cursor-pointer hover:bg-blue-100"
              >
                {s.name}, {s.country}
              </li>
            ))}
          </ul>
        )}
      </div>


        {loading && <p className="text-center text-gray-600">Loading...</p>}
        {error && <p className="text-center font-semibold text-red-800">{error}</p>}

        {weather && (
          <div className="text-center mt-6">
            <h2 className="text-xl font-semibold">
              {weather.city}, {weather.country}
            </h2>
            <p className="mt-2 text-4xl font-bold">
              {weather.temperature}°C
            </p>
            <p className="mt-2 text-2xl">
              {getWeatherIcon(weather.weathercode)}
            </p>
            <p className="mt-2 text-gray-700">
              Wind Speed: {weather.windspeed} km/h
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Last updated: {new Date(weather.time).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
