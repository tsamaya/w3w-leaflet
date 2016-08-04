// Get the user's w3w API key via prompt
if (!localStorage.getItem('w3wkey')) {
  localStorage.setItem(
    'w3wkey',
    prompt('What is your w3w API key?')
  );
}

var endpoint = 'https://api.what3words.com/v2';
var lang = 'fr';
var key = localStorage.getItem('w3wkey');
var defaultCoords = [45.21433, 5.80749];

var dragging = false;

L.Marker.prototype.animateDragging = function() {

  var iconMargin, shadowMargin;

  this.on('dragstart', function() {
    dragging = true;
    if (!iconMargin) {
      iconMargin = parseInt(L.DomUtil.getStyle(this._icon, 'marginTop'));
      shadowMargin = parseInt(L.DomUtil.getStyle(this._shadow, 'marginLeft'));
    }

    this._icon.style.marginTop = (iconMargin - 15) + 'px';
    this._shadow.style.marginLeft = (shadowMargin + 8) + 'px';
  });

  return this.on('dragend', function() {
    dragging = false;
    this._icon.style.marginTop = iconMargin + 'px';
    this._shadow.style.marginLeft = shadowMargin + 'px';
  });
};

// what3words Marker
var myIcon = L.icon({
  iconUrl: './img/marker-border.png',
  iconSize: [90, 90],
  iconAnchor: [45, 90],
  shadowUrl: './img/marker-shadow.png',
  shadowSize: [68, 95],
  shadowAnchor: [22, 94],
  popupAnchor: [0, -75]
});

var map = L.map('map').setView(defaultCoords, 15);

L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var w3wmarker = L.marker(defaultCoords, {
    icon: myIcon,
    draggable: true
  })
  .on('dragend', updateW3w2)
  .on('move', updateW3w)
  .animateDragging()
  .addTo(map);

getLangs();

updateW3w();

$('#lang').on('change', function() {
  lang = $('#lang').val();
  updateW3w();
});

map.on('click', onMapClick);

function onMapClick(evt) {
  var latlon = evt.latlng;
  var lat = latlon.lat;
  var lon = latlon.lng;
  w3wmarker.setLatLng(L.latLng(lat, lon));
}

function getLangs() {
  var data = {
    'key': key
  };
  var langs = $('#lang');
  $.get(endpoint + '/languages', data, function(response) {
    console.log(response);
    $.each(response.languages, function() {
      /*jshint -W106 */
      if (this.code === 'fr') {
        langs.append($('<option />').val(this.code).text(this.native_name).prop('selected', true));
      } else {
        langs.append($('<option />').val(this.code).text(this.native_name));
      }/*jshint +W106 */
    });
  });
}

function updateW3w2(e) {
  dragging = false;
  updateW3w(e);
}

function updateW3w(e) {
  var position;
  if (dragging) {
    return;
  }
  if (e === undefined || e.latlng === undefined) {
    position = L.latLng(w3wmarker.getLatLng().lat, w3wmarker.getLatLng().lng).wrap();
  } else {
    position = L.latLng(e.latlng).wrap();
  }
  var data = {
    'key': key,
    'lang': lang,
    'coords': position.lat + ',' + position.lng
  };

  $.get(endpoint + '/reverse', data, function(response) {
    console.log(response);
    $('#w3w').text(response.words);
  });
}
