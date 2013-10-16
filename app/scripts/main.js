function makeRequest(query, callback) {
	var query = query + ((query.indexOf('?') > -1) ? '&' : '?') + 'client_id=' + apiKey + '&client_secret=' + apiSecret + '&v=20131014';
	$.getJSON(apiUrl + 'v2/' + query, {}, callback);
};

function initialize() {
	var mapOptions = {
		center: new google.maps.LatLng(41.5839,-93.6289),
		zoom: 15,
		disableDefaultUI: true,
		VisualRefresh: true,
		draggable: false,
		scrollwheel: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map-canvas"),
		mapOptions);
}

function setMarkers(venues) {
	$(venues).each(function(i, venue) {
		var ll = new google.maps.LatLng( venue.location.lat, venue.location.lng );
		var marker = new google.maps.Marker({
			position: ll,
			map: map,
			animation: google.maps.Animation.DROP,
			title: venue.name + ' (' + venue.hereNow.count + ' people here)'
		});

		var contentString = "<div class='info-window'>" +
			"<h1>" + venue.name + "</h1>";

		var infowindow = new google.maps.InfoWindow({
			content: contentString
		});

		google.maps.event.addListener(marker, 'click', function() {
			infowindow.open(map,marker);
		});
	});
}

var token,
	map,
	lat = 41.5839,
	lng = -93.6289,
	authUrl = 'https://foursquare.com/',
	apiKey = 'SJKKK5FRX1UUF3O35QY5X3BLNSO5YO34ATB23FI3Y1YSA25C',
	apiSecret = 'WEKOQFGUEAAC4BTGXWTPZTAQTBCKEISIQPULYW24XKY3GUPY',
	apiUrl = 'https://api.foursquare.com/';

$(document).ready(function() {
	Parse.initialize('0eVcAKXZWKD1p8Dy8MiipuCy7Ye67y64lBEOjuYW', '3nZXyBOHROHK9YAoj0jvEGyQjdf4IEpBYAZC0W2k');
	google.maps.event.addDomListener(window, 'load', initialize);

	Parse.Cloud.run('trendingInDSM', {}, {
		success: function(result) {
			setMarkers(result);
		},
		error: function(error) {
			console.log(error);
		}
	});

	Parse.Cloud.run('trendingInNYC', {}, {
		success: function(result) {
			console.log(result);
		},
		error: function(result, error) {
			console.log(error.message);
		}
	});
});