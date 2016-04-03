# API Watch

This is a simple little tool to provide watching and trending to APIs which do not provide it. So say there's an API for the conversion rate of your favorite cryptocurrency but no history, this will watch that api and open up an API that has that conversion rate over time.

## How To Setup

Clone repository into a folder, open up a terminal in that folder and install dependencies via npm.

`npm install`

To run the watcher (after setting up your `config.json`) run:

`node watcher.js`

To run the API:

`node server.js`

By default it will be hosted on port 8080.

## Config.json

This file configures watched APIs and some basic information on the database and the server. A `sample-config.json` file is provided.

### Database Config

`name` : The name (and path, if you'd like) to the SQLite database file.

### API

`per_page` : The limit of records per page provided by API

`port` : The port the API will be hosted on

### Records

`name` : A name to identify the API to be watched.

`url` : The full URL of the API to be watched

`every` : How often the API will be accessed.

## Other Notes

This is a very simple script, it helps me out day to day so I thought it'd be nice to provide for others. It's not bulletproof, it definitely  has some issues. If you submit an issue I'd be happy to take a look, feel free to PR as well.