let origin;
let destLatLng;
let mapObject;
let directionsDisplay;
let travelMode;
let geoLocationLatLng;
let departureDate = new Date();

function initTransportEventHandler() {
    findLocations();
    initClockpicker();
    addTransportButtonsEventsListeners();

    $('#eventNameHeader').append('<h>' + chosenEvent.title + '</h>');

    const departureButton = document.getElementById('departureForm');
    departureButton.addEventListener('submit', onDepartureDetailsSubmit);

    onTransportButtonClick();

}

function addTransportButtonsEventsListeners() {
    $('#carButton').click(function () {
        setMode('DRIVING');
    });

    $('#walkButton').click(function () {
        setMode('WALKING');
    });

    $('#publicTrButton').click(function () {
        setMode('TRANSIT');
    });
}

function onTransportButtonClick() {
    jQuery('#transportDiv .btn').click(function () {
        jQuery('#transportDiv .btn').removeClass('active');
        jQuery(this).toggleClass('active');
    });
}

function setMode(mode) {
    travelMode = mode;
    $('#departuresDetailsDiv').show();

    if (origin !== undefined) {
        findRoute();
    }
}


function findRoute() {
    initMap();
    removeDirectionsDisplay();

    let directionsService = new google.maps.DirectionsService();
    let directionsRequest = {
        origin: origin,
        destination: destLatLng,
        travelMode: travelMode,
        transitOptions: {
            departureTime: departureDate,
        },
        drivingOptions: {
            departureTime: departureDate,
        }
    };

    directionsService.route(directionsRequest, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {

            let panelDiv = document.getElementById('direction_panel');

            directionsDisplay = new google.maps.DirectionsRenderer({
                map: mapObject,
                panel: panelDiv,
                directions: response,

            });
        }
        else {
            console.log('bad request');
        }

    });
}

function findLocations() {
    destLatLng = new google.maps.LatLng(chosenEvent.latitude, chosenEvent.longitude);
    findGeoLocation();
}

function findGeoLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onGeolocationSuccess);
    } else {
        console.log('Geolocation is not supported by this browser.');
    }
}

function onGeolocationSuccess(position) {
    geoLocationLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
}

function initMap() {
    changePropertiesOnMapInit();
    const mapProperties = {
        center: destLatLng,
        zoom: 10,
    };
    const target = document.getElementById('map');
    mapObject = new google.maps.Map(target, mapProperties);
}

function changePropertiesOnMapInit() {
    $('#contentDivTwo').width('90%');
    $('.departureCheckbox').css('display', 'block');
    $('.clock').css('display', 'block');
    $('#departureTimeCheckboxDiv').css('margin-top', '4em');
    $('#optionsDiv').addClass('options');
    $('#mapDetailsDiv').show();

}

function removeDirectionsDisplay() {
    if (directionsDisplay != null) {
        directionsDisplay.setMap(null);
        directionsDisplay.setPanel(null);
        directionsDisplay = null;
    }
}

function initClockpicker() {
    let clock = $('.clockpicker').clockpicker({
        donetext: 'OK',
    });

    $('.clockpicker').on('change', function () {
        let time = clock.data().clockpicker.hours;
        let time2 = clock.data().clockpicker.minutes;
        $('#departureCheckbox').prop('checked', false);
        departureDate.setHours(time);
        departureDate.setMinutes(time2);
    })

}

function onDepartureDetailsSubmit(event) {
    event.preventDefault();
    let locationField = document.getElementById('locationField');
    if (locationField.value === locationField.defaultValue) {
        origin = geoLocationLatLng;
        findRoute();
    } else {
        findRouteOfGivenLocation(locationField.value);
    }

}

function findRouteOfGivenLocation(address) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': address}, function (result, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            origin = new google.maps.LatLng(
                result[0].geometry.location.lat(),
                result[0].geometry.location.lng());
            findRoute();
        }
    });
}

function handleCheckboxChange(element) {
    if (element.checked) {
        document.getElementById('departureButton').disabled = false;
        document.getElementById('locationField').value = '';
    } else {
        document.getElementById('departureButton').disabled = true;
    }
}

function changeCheckboxValue(element) {
    document.getElementById('departureButton').disabled = ((element.value !== element.defaultValue) ? false : true);
    if (element.value !== element.defaultValue) {
        document.getElementById('geolocationCheckbox').checked = false;
    }
}

function handleNowCheckbox() {
    if (this.checked) {
        departureDate = new Date();
    }
}



