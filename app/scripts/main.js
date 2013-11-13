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

	var newStylesArray = [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},{"featureType":"landscape","stylers":[{"color":"#f2e5d4"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}];

	var mapOptions = {
		center: new google.maps.LatLng(41.5839,-93.6289),
		//center: new google.maps.LatLng(40.7,-74),
		zoom: 14,
		disableDefaultUI: true,
		VisualRefresh: true,
		draggable: false,
		scrollwheel: false,
		styles: newStylesArray,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById("map-canvas"),
		mapOptions);
}

function setMarkers(venues) {
	$(venues).each(function(i, venue) {
		var ll = new google.maps.LatLng( venue.data.location.lat, venue.data.location.lng );
		var marker = new google.maps.Marker({
			position: ll,
			map: map,
			animation: google.maps.Animation.DROP,
			title: venue.data.name + ' (' + venue.data.hereNow.count + ' people here)'
		});

		var contentString = "<div class='info-window'>" +
			"<h4>" + venue.data.name + " (" + venue.data.hereNow.count + " here now)</h4>";

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
			console.log(venue.data);

			var name = venue.data.name;
			var hereNow = venue.data.hereNow.count;
			var checkins = venue.data.stats.checkinsCount;
			var type = venue.data.categories[0].shortName;
			var iconURL = venue.data.categories[0].icon.prefix + '64' + venue.data.categories[0].icon.suffix;
			var url = 'http://foursquare.com/venue/' + venue.data.id;

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
			console.log(result);
			setMarkers(result);
			setTrendsList(result);
		},
		error: function(error) {
			console.log(error);
		}
	});
});