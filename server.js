import express from 'express';
import axios from 'axios';
import colors from "colors"

const app = express();
const PORT = process.env.PORT || 3000;

// API URLs
const IP_INFO_URL = 'https://ipinfo.io';
const WEATHER_API_URL = "http://api.openweathermap.org";
const OPENWEATHERMAP_API_KEY = '2c8eabe93880743d7be63a1000ce77c2'

// API Token
const IPINFO_TOKEN = '57c6fec78b4d38';
const testClientIp = '8.8.8.8'

// Function to get the client IP address

    

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Guest';

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '8.8.8.8';


    try {
        // Fetch location data using IPinfo API
        const locationResponse = await axios.get(`${IP_INFO_URL}/${clientIp}/json`, {
            params: { token: IPINFO_TOKEN }
        });

        // Extract location data
        const locationData = locationResponse.data;
        const city = locationData.city;
        console.log(`City: ${city}`.blue)

        // Log locationData and check for 'loc' field
        console.log(`Location data: ${JSON.stringify(locationData, null, 2)}`);

        // Handle missing 'loc' field
        if (!locationData.loc) {
            throw new Error('Location coordinates are missing from the API response.');
        }

        // Extract latitude and longitude from 'loc'
        const [lat, lon] = locationData.loc.split(',');

        // Log extracted latitude and longitude
        console.log(`Extracted coordinates - Latitude: ${lat}, Longitude: ${lon}`.grey);

        if (!lat || !lon) {
            throw new Error('Latitude or longitude is missing from the API response.');
        }

        // Fetch weather data using OpenWeatherMap API
        const weatherRes = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`)
        const weatherData = weatherRes.data

        // Extract temperature from the weather data
        const temperature = weatherData.main.temp;
        console.log(`Temp: ${temperature}`.magenta)

        // Check if temperature is available
        if (temperature === undefined) {
            throw new Error('Temperature data is missing from the weather API response.');
        }

        // Create the response object
        const response = {
            client_ip: clientIp,
            location: city,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${city}.`
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Error fetching data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});