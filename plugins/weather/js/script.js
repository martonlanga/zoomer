$(document).ready(function () {
  var header = document.getElementById('location')

  // var latCookie = Cookies.get('latitude');
  // var lonCookie = Cookies.get('longitude');

  // show default w/out asking for location
  var latCookie = ''
  var lonCookie = ''

  if (latCookie == null || lonCookie == null) {
    $('#location').html('Please allow the location request.')
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getPosition, showError)
    } else {
      throw 'Navigator Geolocation is unavailable.'
    }
  } else {
    console.log('Cookies exist. Lat:' + latCookie + 'Long: ' + lonCookie)
    getWeatherData(latCookie, lonCookie)
  }

  $('#unit').change(function () {
    var currentTemp = $('#temperature').text().split(' ')[0]
    if (document.getElementById('unit').checked) {
      changeTemperature(toCelsius(currentTemp), true)
    } else {
      changeTemperature(toFahrenheit(currentTemp), false)
    }
  })
})

function changeTemperature(temp, toRight) {
  var outAnimation = toRight ? 'bounceOutRight' : 'bounceOutLeft'
  var inAnimation = toRight ? 'bounceInLeft' : 'bounceInRight'
  $('#temperature')
    .addClass('animated ' + outAnimation)
    .one(
      'webkitAnimationEnd mozAnimationEnd oAnimationEnd animationend MSAnimationEnd',
      function () {
        $(this).removeClass('animated ' + outAnimation)

        $('#temperature')
          .addClass('animated ' + inAnimation)
          .one(
            'webkitAnimationEnd mozAnimationEnd oAnimationEnd animationend MSAnimationEnd',
            function () {
              $(this).removeClass('animated ' + inAnimation)
            },
          )
        $('#temperature').text(temp)
      },
    )
}

function toFahrenheit(celsius) {
  return round(celsius * 1.8 + 32, 1) + ' °F'
}

function toCelsius(fahrenheit) {
  return round((fahrenheit - 32) / 1.8, 1) + ' °C'
}

function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0)
  return Math.round(value * multiplier) / multiplier
}

function getWeatherData(latitude, longitude) {
  var endpoint =
    'https://fcc-weather-api.glitch.me' +
    '/api/current?lon=' +
    longitude +
    '&lat=' +
    latitude

  console.log('Location: Lat:' + latitude + 'Long: ' + longitude)

  $.get(endpoint, function (data) {
    console.log(data)
    showData(data.name, data.main.temp, data.weather[0].main)
  })
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      header.innerHTML = 'User denied the request for Geolocation.'
      break
    case error.POSITION_UNAVAILABLE:
      header.innerHTML = 'Location information is unavailable.'
      break
    case error.TIMEOUT:
      header.innerHTML = 'The request to get user location timed out.'
      break
    case error.UNKNOWN_ERROR:
      header.innerHTML = 'An unknown error occurred.'
      break
  }
}

function getPosition(position) {
  Cookies.set('latitude', position.coords.latitude, { expires: 7 })
  Cookies.set('longitude', position.coords.longitude, { expires: 7 })
  getWeatherData(position.coords.latitude, position.coords.longitude)
}

function showData(location, temperature, condition) {
  console.log(location + ' ' + temperature + ' ' + condition)

  //Show current location and temperature
  $('#location').html(location)
  $('#temperature').html(round(temperature, 1) + ' °C')

  //Change title
  document.title = location + ' Weather'

  //Set background relative to the temperature
  if (temperature <= 0) {
    setBackground(0)
  } else if (temperature > 0 && temperature <= 10) {
    setBackground(1)
  } else if (temperature > 10 && temperature <= 20) {
    setBackground(2)
  } else {
    setBackground(3)
  }

  //Change icon
  var skycons = new Skycons({
    color: '#333333',
  })
  switch (condition) {
    case 'Drizzle':
      skycons.add('icon', Skycons.SLEET)
      break
    case 'Clouds':
      skycons.add('icon', Skycons.CLOUDY)
      break
    case 'Rain':
      skycons.add('icon', Skycons.RAIN)
      break
    case 'Snow':
      skycons.add('icon', Skycons.SNOW)
      break
    case 'Clear':
      if (new Date().getHours() > 6 || new Date().getHours() < 20) {
        skycons.add('icon', Skycons.CLEAR_DAY)
      } else {
        skycons.add('icon', Skycons.CLEAR_NIGHT)
      }
      break
    case 'Thunderstorm':
      skycons.add('icon', Skycons.THUNDERSTORM)
      break
    case 'Mist':
      skycons.add('icon', Skycons.FOG)
      break
    case 'Haze':
      skycons.add('icon', Skycons.FOG)
      break
  }
  skycons.play()
}

function setBackground(tempRange) {
  var backgroundElement = document.getElementById('background')
  var browserPrefix = getCssValuePrefix()
  switch (tempRange) {
    case 0:
      backgroundElement.style.background =
        browserPrefix +
        'linear-gradient(45deg, rgba(237,248,240,1) 0%, rgba(208,230,230,0.9) 31%, rgba(189,218,224,0.85) 52%, rgba(188,217,223,0.85) 53%, rgba(164,200,211,0.88) 75%, rgba(137,180,197,0.95) 100%)'
      break
    case 1:
      backgroundElement.style.background =
        browserPrefix +
        'linear-gradient(45deg, rgba(151,213,224,1) 0%,rgba(202,201,199,0.9) 31%,rgba(237,193,182,0.85) 52%,rgba(236,193,181,0.85) 53%,rgba(209,175,148,0.95) 100%)'
      break
    case 2:
      backgroundElement.style.background =
        browserPrefix +
        'linear-gradient(45deg, rgba(219,219,219,1) 0%,rgba(213,193,177,0.9) 31%,rgba(209,175,148,0.85) 52%,rgba(207,173,146,0.85) 53%,rgba(155,128,110,0.88) 75%,rgba(96,77,70,0.95) 100%)'
      break
    case 3:
      backgroundElement.style.background =
        browserPrefix +
        'linear-gradient(45deg, rgba(242,49,31,1) 0%,rgba(239,85,26,0.9) 31%,rgba(237,109,23,0.85) 52%,rgba(237,109,23,0.85) 53%,rgba(239,99,0,0.95) 100%)'
      break
  }
}

function getCssValuePrefix() {
  var rtrnVal = '' //default to standard syntax
  var prefixes = ['-o-', '-ms-', '-moz-', '-webkit-']

  // Create a temporary DOM object for testing
  var dom = document.createElement('div')

  for (var i = 0; i < prefixes.length; i++) {
    // Attempt to set the style
    dom.style.background = prefixes[i] + 'linear-gradient(#000000, #ffffff)'

    // Detect if the style was successfully set
    if (dom.style.background) {
      rtrnVal = prefixes[i]
    }
  }

  dom = null
  delete dom

  return rtrnVal
}
