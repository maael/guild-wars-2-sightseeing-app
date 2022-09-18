# GW2 Sightseeing App

Bringing [FFXIV style sightseeing logs](https://ffxiv.consolegameswiki.com/wiki/Sightseeing_Log) to Guild Wars 2.

Streamlines making the logs by automating turning off the HUD and capturing screenshots, and getting location information from the [Mumble Link](https://wiki.guildwars2.com/wiki/API:MumbleLink).

## Usage

### Install / Setup

1. Download either the installer or `.exe` from the [latest release](https://github.com/maael/guild-wars-2-sightseeing-app/releases/latest).
2. Open and run whichever you chose - you will have a Windows Defender prompt that the app is from an unknown developer, and will need to choose `Run anyway`.
3. Enter your API Key, the app includes a link and info on how to get one.
4. Save the API Key - you should see your account name at the top of the app.
5. The app will act as an overlay, and so can be used over Guild Wars 2 itself.

### Completing Logs

1. Choose a log from the list - either a new one or one you're progressing.
2. Try to find the locations off the hints and pictures - when you're near one you'll hear a bell sound and see it ticked off.
3. Repeat for all the locations in the log!
4. Once you're done, you'll be added to the log leaderboard.

### Creating Logs

1. Click `New Log` button
2. Fill out log details - to capture a screenshot and location information click the button with the camera icon on new items.
3. Save log

## Development

### Setup

You will need Node.js and Rust set up on a Windows system.

```sh
git clone git@github.com:maael/guild-wars-2-sightseeing-app.git
```

### App Development

This is a [Tauri](https://tauri.app/) based app, using Web technologies (React) for the UI, and Rust to interact with Guild Wars 2 and the Mumble API.

```sh
cd guild-wars-2-sightseeing-app/app
yarn
yarn tauri dev
```

> **Note**
> By default in development the app will try to connect to the local API at http://localhost:3001

### API Development

This is a [Next.js](https://nextjs.org/) app using [MongoDB](https://mongodb.com) as a database.

```sh
cd guild-wars-2-sightseeing-app/web
yarn
yarn dev
```
