import { Component, html, useState, useEffect, mount } from '../../index.js'

class WeatherApp extends Component {
  render () {
    const [city, setCity] = useState('Stockholm')
    const [weather, setWeather] = useState(null)
    const [loading, setLoading] = useState(false)

    // Fetch weather data whenever the city changes
    useEffect(() => {
      let cancelled = false
      setLoading(true)

      // We use Open-Meteo for free, key-less weather data
      // First we geocode the city (mocked for simplicity in this example)
      const coords = {
        Stockholm: { lat: 59.3293, lon: 18.0686 },
        Amsterdam: { lat: 52.3676, lon: 4.9041 },
        Tokyo: { lat: 35.6762, lon: 139.6503 },
        London: { lat: 51.5074, lon: -0.1278 }
      }

      const target = coords[city] || coords.Stockholm

      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${target.lat}&longitude=${target.lon}&current_weather=true`)
        .then(res => res.json())
        .then(data => {
          if (cancelled) return
          setWeather(data.current_weather)
          setLoading(false)
        })

      return () => { cancelled = true }
    }, [city])

    return html`
      <div class="card">
        <h2>${city}</h2>
        ${loading
          ? html`<p class="loading">Fetching current weather...</p>`
          : weather
? html`
              <div class="temp">${Math.round(weather.temperature)}°</div>
              <div class="desc">Wind speed: ${weather.windspeed} km/h</div>
            `
: ''
        }
        
        <select onchange="${(e) => setCity(e.target.value)}" style="background: rgba(255,255,255,0.1); color: white; border: 0.0625rem solid rgba(255,255,255,0.3); padding: 0.3125rem; margin-top: 1.25rem; border-radius: 0.3125rem;">
          <option value="Stockholm">Stockholm</option>
          <option value="Amsterdam">Amsterdam</option>
          <option value="Tokyo">Tokyo</option>
          <option value="London">London</option>
        </select>
      </div>
    `
  }
}

mount(WeatherApp, '#app')
