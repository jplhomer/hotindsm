var Trends = Parse.Object.extend('Trends');

/**
 * Cloud function to get trending venues in DSM
 * @param  {obj} request  Request
 * @param  {obj} response Response
 * @return {void}
 */
Parse.Cloud.define('trendingInDSM', function(request, response) {
	hitFoursquare(function(results) {
		response.success(results);
	});
});

/**
 * TODO (not currently using)
 * Get trending values, either from the Parse Cloud get new ones
 * @param  {Function} callback Callback function
 * @return {array} Venue info
 */
function getTrendingVenues (callback) {
	var query = new Parse.Query(Trends);

	// Grab the first Trend from the cloud
	query.first({
		success: function(trend) {

			// If there is one, return it
			// @TODO: Store latest trends to the Parse Cloud, then return
			// and create them based on their expirations.
			if ( trend ) {
				console.log('The venues we have stored are current.');
				callback(trend.get('venues'));
			} else {
				console.log('Hitting foursquare to get fresh venues.');

				// Hit our Foursquare endpoint again to update it
				hitFoursquare(function(venues) {
					callback(venues);	
				});
			}
		},
		error: function(trend, error) {
			callback(error.message);
		}
	});	
}

/**
 * Hit the Foursquare endpoint to check for new trends
 * @param  {Function} callback Send back our data
 * @return {object} venue info
 */
function hitFoursquare (response) {
	Parse.Cloud.httpRequest({
		url: 'https://api.foursquare.com/v2/venues/trending?ll=41.5839,-93.6289&client_id=SJKKK5FRX1UUF3O35QY5X3BLNSO5YO34ATB23FI3Y1YSA25C&client_secret=WEKOQFGUEAAC4BTGXWTPZTAQTBCKEISIQPULYW24XKY3GUPY&v=20131014&radius=2000&limit=10',
		success: function(httpResponse) {
			console.log('Connected with Foursquare');

			response(httpResponse.data['response']['venues']);
			
			// TODO: Update our database
			/*updateTrendingVenues(httpResponse.data['response']['venues'], function(results) {
				response(results);
			});*/
		},
		error: function(httpResponse) {
			console.log('Couldn\'t connect to Foursquare.');
			response(httpResponse);
		}
	});
}

/**
 * Save our venues to the Parse Cloud
 * @param  {array} venues   Venues from Foursquare
 * @param  {Function} response Callback function
 * @return {void}          
 */
function updateTrendingVenues (venues, response) {
	var trends = new Trends();
	trends.set('venues', venues);
	trends.save(null, {
		success: function(trend) {
			console.log('Saved venues to our cloud.');
			response(trend.get('venues'));
		},
		error: function(trend, error) {
			response(error.message);
		}
	});
}