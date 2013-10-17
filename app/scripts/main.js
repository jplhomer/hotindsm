var infowindow = null;
var map;

function initialize() {
	var stylesArray = [
	{
		"featureType": "landscape",
		"stylers": [
		{ "color": "#c4d0a4" }
		]
	},{
		"featureType": "road.highway.controlled_access",
		"stylers": [
		{ "color": "#ffffe4" }
		]
	},{
		"featureType": "road.local",
		"stylers": [
		{ "color": "#ddffe2" }
		]
	},{
		"featureType": "road.arterial",
		"stylers": [
		{ "color": "#ffc980" },
		{ "saturation": -21 },
		{ "hue": "#ffee00" }
		]
	},{
		"featureType": "administrative",
		"stylers": [
		{ "weight": 0.1 },
		{ "hue": "#ff0008" },
		{ "color": "#ff5a54" }
		]
	}];

	var mapOptions = {
		center: new google.maps.LatLng(41.5839,-93.6289),
		//center: new google.maps.LatLng(40.7,-74),
		zoom: 14,
		disableDefaultUI: true,
		VisualRefresh: true,
		draggable: false,
		scrollwheel: false,
		styles: stylesArray,
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
			"<h4>" + venue.name + " (" + venue.hereNow.count + " here now)</h4>";

		infowindow = new google.maps.InfoWindow({
			content: contentString
		});

		google.maps.event.addListener(marker, 'click', function() {
			if (infowindow)
				infowindow.close();
			infowindow.setContent(contentString);
			infowindow.open(map,marker);
		});
	});
}

function setTrendsList(venues) {
	if ( venues.length > 0 ) {
		$(venues).each(function(i, venue) {
			console.log(venue);

			var name = venue.name;
			var hereNow = venue.hereNow.count;
			var checkins = venue.stats.checkinsCount;
			var type = venue.categories[0].shortName;
			var iconURL = venue.categories[0].icon.prefix + '64' + venue.categories[0].icon.suffix;
			var url = 'http://foursquare.com/venue/' + venue.id;

			var html = '<a href="' + url + '" target="_blank">';
			html += '<h4>' + name + '</h4>';
			html += '<span class="type"><img src="' + iconURL + '" alt="' + type + '" /> ' + type + '</span>';
			html += '<span class="checkins">' + hereNow + ' people here now / ' + checkins + ' total</span>';
			html += '</a>';

			$('<li />').html(html).appendTo($('#trends'));
		});
	} else {
		$('<li />').html('<span class="none">No venues are trending right now. How lame!</span>').appendTo($('#trends'));
	}
}
	
$(document).ready(function() {
	// Add your own Parse keys here.
	Parse.initialize('0eVcAKXZWKD1p8Dy8MiipuCy7Ye67y64lBEOjuYW', '3nZXyBOHROHK9YAoj0jvEGyQjdf4IEpBYAZC0W2k');
	google.maps.event.addDomListener(window, 'load', initialize);

	Parse.Cloud.run('trendingInDSM', {}, {
		success: function(result) {
			setMarkers(result);
			setTrendsList(result);
		},
		error: function(error) {
			console.log(error);
		}
	});
});