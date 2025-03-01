# Distube

**Distube** is a versatile music-playing bot powered by the [Distube](https://www.npmjs.com/package/distube) library, designed to provide seamless music streaming and control in Discord. Whether it's for personal enjoyment or creating a fun environment in your server, Distrobot supports playing music from platforms like SoundCloud, Spotify, and more.

## Features

- 🎶 **Multi-Platform Support**: Play music from **YouTube**, **SoundCloud**, **Spotify**, and more.
- ⏸️ **Pause, Resume, Skip & Stop**: Control playback easily with simple commands.
- 📜 **Queue Management**: Handle multiple songs, with the ability to skip, clear, or shuffle the queue.
- 🔍 **Search by Song Name or URL**: Quickly search for your favorite tracks by name or directly with a URL.
- 🔁 **Autoplay Mode**: Keep the music going with autoplay for continuous playback.
- 🎚️ **Volume Control**: Adjust the volume between 1-100 for a personalized experience.
- ⚙️ **Music Filters**: Apply effects like bass boost, nightcore, etc., to enhance your listening experience.

## Requirements

- ✅ **Node.js** v16.6.0 or higher.
- ✅ A **Discord bot token**.
- ✅ (Optional) **Lavalink server** (for advanced features like Spotify integration).

## Installation

To get started, follow these simple steps:

1. **Clone the repository**:

    ```bash
    git clone https://github.com/pomicee/distube.git
    cd distube
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Set up the bot token**: 
    - In the `JsonFiles/config.json` file, add your **Discord bot token**.
    
    Example:
    ```json
  "token": "",
  "color": "#000000",
  "clientId": "",
  "SPOTIFY_CLIENT_ID": "",
  "SPOTIFY_CLIENT_SECRET": "",
  "LASTFM_API_KEY": ""
    ```

4. **Start the bot**:

    ```bash
    node index.js
    ```

Your Distube bot should now be up and running!

## Commands

Here’s a list of basic commands to control Distrobot in your Discord server:

- `,play <song name or URL>` - Play a song from **SoundCloud**, or **Spotify**.
- `,skip` - Skip the current song in the queue.
- `,pause` - Pause the currently playing song.
- `,resume` - Resume the paused song.
- `,stop` - Stop the music and clear the entire queue.
- `,queue` - View the current song queue.
- `,volume <1-100>` - Set the music volume (1-100).
- `,nowplaying` - View details of the currently playing track.
- `,clear` - Clear the entire music queue.
- `,shuffle` - Shuffle the current queue.
- `,loop` - Toggle looping the current track.
- `,filter <filter name>` - Apply a filter like bass boost or nightcore.
- `,autoplay` - Toggle autoplay mode.

## Configuration

Distube comes with customizable configuration options. You can change certain settings to suit your needs, such as:

- **Prefix**: Change the bot command prefix from `,` to your custom choice.
- **Autoplay Mode**: Enable or disable autoplay after a song ends.
- **Volume**: Set the default starting volume for music playback.

For advanced configuration options and additional features like filter management, refer to the official [Distube documentation](https://github.com/skick1234/DisTube/wiki).

## Support

If you run into any issues or have questions, feel free to reach out on the [Distube Support Server](https://discord.gg/feaDd9h). We’re here to help!

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have ideas for new features or improvements.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a pull request.

## License

This bot is licensed under the **MIT License**. See the LICENSE file for details.
