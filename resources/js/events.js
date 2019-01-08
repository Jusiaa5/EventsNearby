let events = [];
let chosenEvent;
let startTime;
let searchingLocation;
let pb2;
let nickname;

function initFindEventListener() {
    pb2 = new PB2('https://jusiaa5.github.io/EventsNearby/index.html', 'events_nearby');

    const saveNicknameButton = document.getElementById('saveNicknameButton');
    saveNicknameButton.addEventListener('click', onSubmitNickname);

    const saveButton = document.getElementById('saveButton');
    saveButton.addEventListener('click', onSaveEvent);

    const form = document.getElementById('searchingForm');
    form.addEventListener('submit', onSubmitLocation);

    pb2.setReceiver(onResult);
}

function onSubmitNickname() {
    event.preventDefault();
    nickname = document.getElementById('nicknameField').value;
    $('#searchingFormDiv').show();
    $('#nicknameDiv').hide();
}

function onFindEvents(data) {
    $('#loader').hide();

    if (data.events === null) {
        $('#contentDiv').show();
        $('#wrongResponseDiv').show();

    } else {
        data.events.event.forEach(function (element) {
            events.push(element);
        });

        displayEventsList();
    }
}

function onSubmitLocation(event) {
    event.preventDefault();

    const location = document.getElementById('searchField').value;
    const keyword = document.getElementById('specifiedField').value;

    searchingLocation = location;
    if (keyword != null) {
        findEventByLocationAndKeyword(location, keyword);
    } else {
        findEventByLocation(location);
    }
}

function findEventByLocation(location) {
    hideOtherElements();
    removeEventsList();
    $.ajax({
        beforeSend: function () {
            $('#loader').show();
        },
        method: 'GET',
        url: 'https://api.eventful.com/json/events/search',
        dataType: 'jsonp',
        data: {'app_key': 'N6RrVv7nbrHtBkph', 'location': location, 'date': 'Today'},
        success: onFindEvents

    });
}

function findEventByLocationAndKeyword(location, keyword) {
    hideOtherElements();
    removeEventsList();
    $.ajax({
        beforeSend: function () {
            $('#loader').show();
        },
        method: 'GET',
        url: 'https://api.eventful.com/json/events/search',
        dataType: 'jsonp',
        data: {'app_key': 'N6RrVv7nbrHtBkph', 'location': location, 'date': 'Today', 'keywords': keyword},
        success: onFindEvents

    });
}

function displayEventsList() {
    $('#tableHead').text(searchingLocation + ', ' + getTodayDate());
    $('#eventsTable tbody').empty();
    let table = document.getElementById('eventsTable');
    for (let i = 0; i < events.length; i++) {
        let row = table.insertRow(i);
        let cell1 = row.insertCell(-1);
        let cell2 = row.insertCell(0);
        let checkbox = document.createElement('input');
        $(checkbox).addClass('eventsCheckbox');

        checkbox.type = 'checkbox';
        checkbox.name = 'checkbox';
        checkbox.class = 'eventsCheckbox';
        checkbox.id = i;
        checkbox.onchange = onCheckBoxChange;
        cell2.appendChild(checkbox);
        cell1.innerHTML = events[i].title;


        cell1.onclick = function () {
            $('#eventModal').on('shown.bs.modal', function () {  //Tell what to do on modal open
                $(this).find('p').html(events[i].description)
            }).modal('show');

            closeModal();
        };
        $('#contentDiv').show();
    }
}

function getTodayDate() {
    let date = new Date();
    let today = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
    return today;
}

function removeEventsList() {
    if (events.length !== 0) {
        events.length = 0;
    }
}

function closeModal() {
    let span = document.getElementsByClassName('close')[0];
    span.onclick = function () {
        $('#eventModal').style.display = 'none';
    }
}

function onResult(data) {
    let sender = data.json.client_name;
    if (data.me) {
        sender = 'you';
    }

    $('#eventsTable tr').each(function () {
        $(this).find('td').each(function () {
            if ($(this).html().includes(data.json.event.title)) {
                let take = data.json.take;

                if (take === 'remove') {
                    $(this).find('i').remove();
                } else {

                    $(this).append('<i class="fa fa-users peopleIcon" id="peopleIcon" aria-hidden="true"></i>');
                    $('.peopleIcon').hover(function () {
                        $('#eventModal').on('shown.bs.modal', function () {  //Tell what to do on modal open
                            $(this).find('p').html(sender + ' is watching this event')
                        }).modal('show');
                    });
                }
            }

        });
    });
}

function onSaveEvent() {
    initTransportEventHandler();
    $('#contentDivTwo').show();
    $('#contentDiv').hide();
}

function onCheckBoxChange() {
    const msg = {};
    if (chosenEvent != null) {
        msg.client_name = nickname;
        msg.event = chosenEvent;
        msg.take = 'remove';
        pb2.sendJson(msg);
    }

    let checkboxes = document.getElementsByName('checkbox');
    checkboxes.forEach(function (element) {
        element.checked = false;
    });
    this.checked = true;
    chosenEvent = events[this.id];
    startTime = events[this.id].start_time;

    msg.client_name = nickname;
    msg.event = chosenEvent;
    msg.take = 'add';
    pb2.sendJson(msg);
}

function hideOtherElements() {
    $('#contentDiv').hide();
    $('#contentDivTwo').hide();

}

initFindEventListener();
