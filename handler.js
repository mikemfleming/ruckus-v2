'use strict';

const { URL } = require('url');
const fetch = require('node-fetch');

const { SLACK_BOT_TOKEN, SPOTIFY_APP_TOKEN } = process.env;

// TODO: get user from auth0
//  if no user, prompt them to authorize spotify
//  use refresh token to generate a new token with spotify
//  continue

// TODO: dynamic playlist id

module.exports.handleSpotifyLink = async ({ body }) => {
  const {
    event: { message_ts, channel, links }
  } = JSON.parse(body);
  
  const trackId = links[0].url.replace('https://open.spotify.com/track/','').split('?')[0];

  // add to spotify
  const spotifyUrl = new URL('https://api.spotify.com/v1/playlists/13z1UR2uBUztKZC6Yq41EA/tracks'); // 
  spotifyUrl.searchParams.append('uris', `spotify:track:${trackId}`);

  const spotifyResponse = await fetch(spotifyUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SPOTIFY_APP_TOKEN}`
    }
  });
  const spotifyJSON = await spotifyResponse.json();
  console.log('~~~~ SPOTIFY', spotifyJSON)

  // confirm with slack
  await fetch('https://slack.com/api/reactions.add', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({
      token: SLACK_BOT_TOKEN, // is it necessary to include this here?
      channel,
      name: 'headphones',
      timestamp: message_ts
    })
  });

  // clean up
  return {
    statusCode: 200,
    body: JSON.stringify({}), // what's all this then?
  };
};
