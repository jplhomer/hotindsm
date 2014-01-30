var Venue = Parse.Object.extend('Venue');
var moment = require('cloud/moment-with-langs.min.js');

/**
 * Grab trending venues for DSM by querying our Parse database
 * @param  {} request
 * @param  {} response
 * @return {}
 */
Parse.Cloud.define('trendingInDSM', function(request, response) {
    // Grab a new collection and send back its results
    var TrendingVenues = Parse.Collection.extend({
        model: Venue
    });

    var collection = new TrendingVenues();
    collection.fetch({
        success: function(results) {
            response.success(results.toJSON());
        },
        error: function(results, error) {
            response.error(error);
        }
    });
});

/**
 * Here, we're defining a Parse job which is scheduled in the backend.
 * @param  {} request
 * @param   status
 * @return {}
 */
Parse.Cloud.job('updateAllVenues', function(request, status) {
    hitFoursquare(function(results) {
        updateVenues(results, function(results) {
            status.success('Updated all venues');
        });
    });
});

/**
 * Hit the Foursquare endpoint to check for new trends
 * @param  {Function} callback Send back our data
 * @return {object} venue info
 */
function hitFoursquare (response) {
    Parse.Cloud.httpRequest({
        url: 'https://api.foursquare.com/v2/venues/trending?ll=41.5839,-93.6289&client_id=YOUR_CLIENT_ID&client_secret=YOUR_SECRET&v=20131014&radius=2000&limit=10',
        success: function(httpResponse) {
            console.log('Connected with Foursquare');

            response(httpResponse.data['response']['venues']);
        },
        error: function(httpResponse) {
            console.log('Couldn\'t connect to Foursquare.');
            response(httpResponse);
        }
    });
}

function updateVenues(venues, response) {
    console.log('Getting existing venues');

    var VenueCollection = Parse.Collection.extend({
        model: Venue
    });

    console.log('Got venue collection');

    var collection = new VenueCollection();
    collection.fetch().then(function(collection) {
        var venuesInDB = collection.pluck('venueId');
        console.log('Got ' + collection.length + ' venues from the DB');
        console.log(venues);

        var promises = [];

        collection.each(function(object) {
            console.log(object.get('name'));

            // Check and see if this venue is trending
            var match = venues.filter(function(venue) {
                return (venue.id == object.get('venueId'));
            });

            if ( match.length > 0 && object.get('trending') != true ) {

                console.log('Venue wasn\'t trending before. We want to make it trend.');

                // Set the right values
                object.set('trending', true);

                // Update total count
                object.increment('total');

                // Update time of day
                var dayPart = partOfDay();

                switch (dayPart) {
                    case 'am':
                        object.increment('am');

                        break;

                    case 'noon':
                        object.increment('noon');

                        break;

                    case 'pm':
                        object.increment('pm');

                        break;
                }

                // Update data field
                object.set('data', match[0]);

                // Save it
                object.save(null, {
                    success: function(venue) {
                        console.warn('Just updated');
                        promises.push(venue);
                    },
                    error: function(venue, error) {
                        console.warn(error.message);
                    }
                });
            } else if ( match.length > 0 && object.get('trending') == true ) {
                console.log('Venue was trending, just update data.');

                // Update data field
                object.set('data', match[0]);

                // Save it
                object.save(null, {
                    success: function(venue) {
                        console.warn('Just updated that venue.');
                        promises.push(venue);
                    },
                    error: function(venue, error) {
                        console.warn(error.message);
                    }
                });

            } else if ( match.length <= 0 && object.get('trending') == true ) {
                console.log('Venue shouldn\'t be trending anymore!');

                object.set('trending', false);
                object.save(null, {
                    success: function(venue) {
                        console.warn('Just updated.');
                        promises.push(venue);
                    },
                    error: function(venue, error) {
                        console.warn(error.message);
                    }
                });

                console.log('Updated venue');
            }
        });

        var venueIds = collection.pluck('venueId');

        // Now check for trending venues that aren't in the database at all and add them
        for( x = 0; x < venues.length; x++ ) {

            if ( venueIds.indexOf(venues[x].id) == -1 ) {
                console.log('New trend: ' + venues[x].name);

                // Create a new object
                var venue = new Venue();

                // Get our time of day
                var dayPart = partOfDay();

                var am = 0,
                    noon = 0,
                    pm = 0;

                switch (dayPart) {
                    case 'am':
                        am = 1;

                        break;

                    case 'noon':
                        noon = 1;

                        break;

                    case 'pm':
                        pm = 1;

                        break;
                }

                // Save it.
                venue.save({
                    'trending': true,
                    'total': 1,
                    'name': venues[x].name,
                    'venueId': venues[x].id,
                    'data': venues[x],
                    'am': am,
                    'noon': noon,
                    'pm': pm
                }, {
                    success: function(venue) {
                        console.log('Saved ' + venue.get('name') + ' to the database.');
                    },
                    error: function(venue, error) {
                        console.log(error);
                    }
                });
            }
        }

        return Parse.Promise.when(promises);

    }).then(function() {
        response();
    });
}

/**
 * Turn a UTC timestamp into a time of day.
 *
 * AM, Noon, PM
 * @param  {string} time Time of venue trend
 * @return {string}      Part of day
 */
function partOfDay() {
    var hour = moment().zone(6).format("HH");
    var timeOfDay = '';

    if (hour >= 4 && hour <= 10) {
        timeOfDay = 'am';
    }

    if (hour >= 11 && hour <= 13) {
        timeOfDay = 'noon';
    }

    if (timeOfDay == '')
        timeOfDay = 'pm';

    return timeOfDay;
}
