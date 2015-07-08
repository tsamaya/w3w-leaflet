L.Marker.prototype.animateDragging = function() {

  var iconMargin, shadowMargin;

  this.on('dragstart', function() {
    if (!iconMargin) {
      iconMargin = parseInt(L.DomUtil.getStyle(this._icon, 'marginTop'));
      shadowMargin = parseInt(L.DomUtil.getStyle(this._shadow, 'marginLeft'));
    }

    this._icon.style.marginTop = (iconMargin - 15) + 'px';
    this._shadow.style.marginLeft = (shadowMargin + 8) + 'px';
  });

  return this.on('dragend', function() {
    this._icon.style.marginTop = iconMargin + 'px';
    this._shadow.style.marginLeft = shadowMargin + 'px';
  });
};

var map = L.map('map').setView([45.21433, 5.80749], 15);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

var w3wmarker = L.marker([45.21433, 5.80749], {
    draggable: true
  })
  .on('dragend', updateW3w)
  .on('move', updateW3w)
  .animateDragging()
  .addTo(map);

var lang = 'fr';
var key = 'Q4M51WJZ';

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
  w3wmarker.setLatLng(L.latLng(lat,lon));
}

function getLangs() {
  data = {
    'key': key
  };
  var langs = $('#lang');
  $.post('https://api.what3words.com/get-languages', data, function(response) {
    console.log(response);
    $.each(response.languages, function() {
      if( this.code === 'fr') {
        langs.append($('<option />').val(this.code).text(this.name_display).prop('selected', true));
      } else {
        langs.append($('<option />').val(this.code).text(this.name_display));
      }
    });
  });
}

function updateW3w(e) {
  data = {
    'key': key,
    'lang': lang,
    'position': '\'' + w3wmarker.getLatLng().lat + ',' + w3wmarker.getLatLng().lng + '\''
  };

  $.post('http://api.what3words.com/position', data, function(response) {
    console.log(response);
    $('#w3w').text('W3W\n' +
                   'words: ' + response.words[0] + ', ' + response.words[1] + ', ' + response.words[2] + '\n' +
                   'position:' + response.position[0] + ', ' + response.position[1] );
  });
}
