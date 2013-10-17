# Hot in DSM

A handy map which shows Foursquare's trending venues in Downtown Des Moines.

Built using the [Foursquare API](http://developer.foursquare.com), [Parse](http://parse.com), and [Google Maps API](http://developers.google.com/maps). Base app built using the [Yeoman](http://yeoman.io) webapp generator.

## About Hot in DSM

This just grabs the current Foursquare Trending Venues for the latitude and longitude coordinates of Downtown Des Moines. Often times, there are no trending venues. Which is OK. I guess.

## Development

To create your own, clones the repository. You'll need Node installed. Navigate to the repository on your local machine and run:

`npm install`

Followed by:

`bower install`

This will install all of the dependencies. To see your site in action, in the same directory run:

`grunt server`

And a new live-reload window will open with your version of the site.

## Cloud Code

This app uses [Parse's](http://parse.com) Cloud Code feature, which is essentially a remotely-hosted Node.js set of scripts.

To edit this app's Cloud Code, navigate to the repository's subfolder `cloud`.

To deploy this Cloud Code for your own using, follow the instructions on [Parse's Getting Started Documentation](https://parse.com/docs/cloud_code_guide#started).

### Foursquare API

To run the Cloud Code, you'll need to register a new application on [Foursquare](http://developer.foursquare.com).

Replace the `client_id` and `client_secret` parameters in the `hitFoursquare` function within `main.js`. Yeah, this is pretty messy. But just do it.