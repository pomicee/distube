# Distrobot

Distrobot is a music-playing bot built with [Distube](https://github.com/Androz2091/Distube), designed to play music from various platforms like SoundCloud, and Spotify.

## Features

- Play music from SoundCloud, and Spotify.
- Pause, resume, skip, and stop music with simple commands.
- Queue management to handle multiple songs.
- Search songs by name or URL.
- Support for autoplay mode.
- Volume control and music filters.
  
## Requirements

- Node.js v16.6.0 or higher.
- A Discord bot token.
  
## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/distrobot.git
    cd distrobot
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the bot:

    ```bash
    node index.js
    ```

## Commands

Here are some basic commands you can use with Distrobot:

- `!play <song name or URL>` - Play a song from YouTube, SoundCloud, or Spotify.
- `!skip` - Skip the current song.
- `!pause` - Pause the current song.
- `!resume` - Resume the current song.
- `!stop` - Stop the music and clear the queue.
- `!queue` - View the current queue.
- `!volume <1-100>` - Set the volume (1-100).
- `!nowplaying` - View the current song playing.
- `!clear` - Clear the music queue.
  
## Configuration

For advanced configuration and features like filtering and autoplay, refer to the [Distube documentation](https://github.com/Androz2091/Distube).

## License

This bot is licensed under the MIT License.
