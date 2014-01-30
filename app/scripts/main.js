'use strict';

var infowindow = null;
var map, currentTimeOfDay, venues, markersArray,
    google = google || {},
    Parse = Parse || {};
var trendsList = $('#trends-list');

function initialize() {

    var stylesArray = [{'featureType':'water','stylers':[{'visibility':'on'},{'color':'#acbcc9'}]},{'featureType':'landscape','stylers':[{'color':'#f2e5d4'}]},{'featureType':'road.highway','elementType':'geometry','stylers':[{'color':'#c5c6c6'}]},{'featureType':'road.arterial','elementType':'geometry','stylers':[{'color':'#e4d7c6'}]},{'featureType':'road.local','elementType':'geometry','stylers':[{'color':'#fbfaf7'}]},{'featureType':'poi.park','elementType':'geometry','stylers':[{'color':'#c5dac6'}]},{'featureType':'administrative','stylers':[{'visibility':'on'},{'lightness':33}]},{'featureType':'road'},{'featureType':'poi.park','elementType':'labels','stylers':[{'visibility':'on'},{'lightness':20}]},{},{'featureType':'road','stylers':[{'lightness':20}]}];

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

    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
}

/**
 * Sorting functions
 * @param  {} a
 * @param  {} b
 * @return {}
 */
function sortAllTime(a, b) {
    return b.total - a.total;
}

function sortAM(a, b) {
    return b.am - a.am;
}

function sortNoon(a, b) {
    return b.noon - a.noon;
}

function sortPM(a, b) {
    return b.pm - a.pm;
}

function removeMarkers() {
    console.log(markersArray.length);
    // Remove from the map
    $.each(markersArray, function(i, m) {
        m.setMap(null);
    });

    // Empty array
    markersArray.length = 0;
}

function setMarkers(venueSet) {
    // Clear current markers
    removeMarkers();

    $(venueSet).each(function(i, venue) {

        var ll = new google.maps.LatLng( venue.data.location.lat, venue.data.location.lng );
        var marker = new google.maps.Marker({
            position: ll,
            map: map,
            animation: google.maps.Animation.DROP,
            title: venue.data.name + ' (' + venue.data.hereNow.count + ' people here)'
        });

        var contentString = '<div class="info-window">' +
            '<h4>' + venue.data.name + ' (' + venue.data.hereNow.count + ' here now)</h4>';

        infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        markersArray.push(marker);

        google.maps.event.addListener(marker, 'click', function() {

            if (infowindow) {
                infowindow.close();
            }
            infowindow.setContent(contentString);
            infowindow.open(map,marker);
        });
    });
}

function setTrendsList(trendsType, timeOfDay) {

    var venueSet;

    console.log(trendsType);

    switch (trendsType) {

    case 'now':
        venueSet = $.grep(venues, function(v) {
            return v.trending;
        });
        break;

    case 'alltime':

        if ( ! timeOfDay) {
            venueSet = venues.sort( sortAllTime );
        } else {
            if (timeOfDay === 'am') {
                venueSet = venues.sort( sortAM );
            }

            if (timeOfDay === 'noon') {
                venueSet = venues.sort( sortNoon );
            }

            if (timeOfDay === 'pm') {
                venueSet = venues.sort( sortPM );
            }
        }
        break;
    }

    venueSet = venueSet.slice(0, 5);

    if ( venueSet.length > 0 ) {

        // Clear the current list
        trendsList.html('');

        $(venueSet).each(function(i, venue) {
            var name = venue.data.name;
            var hereNow = venue.data.hereNow.count;
            var checkins = venue.data.stats.checkinsCount;
            //var type = venue.data.categories[0].shortName;
            //var iconURL = venue.data.categories[0].icon.prefix + '64' + venue.data.categories[0].icon.suffix;
            var url = 'http://foursquare.com/venue/' + venue.data.id;

            var html = '<a href="' + url + '" target="_blank">';
            html += '<h4>' + name + '</h4>';
            //html += '<span class="type"><img src="' + iconURL + '" alt="' + type + '" /> ' + type + '</span>';
            html += '<span class="here-now"><i class="icon-person"></i> ' + hereNow + '</span><span class="total-checkins"><i class="icon-pin"></i> ' + checkins + ' checkins</span>';
            html += '</a>';

            $('<li />').html(html).appendTo(trendsList);
        });

        // Also display them on the map
        setMarkers(venueSet);
    } else {
        $('<li />').html('<span class="none">No venues are trending right now.</span>').appendTo(trendsList);
    }
}


function toggleTimeOfDay() {
    $('.time-of-day').toggleClass('open');
}

function clearTimeOfDayOptions() {
    $('.time-of-day input').removeAttr('checked');
}

function maybeResetTimeOfDay(value) {
    if (currentTimeOfDay === value) {
        $('input[name=timeofday]').removeAttr('checked');
        currentTimeOfDay = '';
    } else {
        currentTimeOfDay = value;

        // At this point, trigger another set of pin changes.
        setTrendsList('alltime', value);
    }
}

$(document).ready(function() {
    // Add your own Parse keys here.
    Parse.initialize('0eVcAKXZWKD1p8Dy8MiipuCy7Ye67y64lBEOjuYW', '3nZXyBOHROHK9YAoj0jvEGyQjdf4IEpBYAZC0W2k');
    google.maps.event.addDomListener(window, 'load', initialize);

    Parse.Cloud.run('trendingInDSM', {}, {
        success: function(result) {
            venues = result;
            //console.log(venues);
            setTrendsList('now');
        },
        error: function(error) {
            console.log(error);
        }
    });

    $('input[name=trend]').change(function() {
        //var status = $('input[name-trend]:checked').val();
        toggleTimeOfDay();
        clearTimeOfDayOptions();
        setTrendsList($(this).val());
    });

    $('input[name=timeofday]').click(function() {
        maybeResetTimeOfDay($(this).val());
    });
});
