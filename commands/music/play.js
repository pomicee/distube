const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'play',
  description: 'Play a song from a URL or search for a song',
  category: 'Music',
  async execute(message, args) {
    if (!message.member.voice.channel) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`${message.author} You need to be in a voice channel to play music!`)] 
      });
    }

    const botPermissions = message.guild.members.me.permissionsIn(message.member.voice.channel);
    if (!botPermissions.has('CONNECT') || !botPermissions.has('SPEAK')) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`${message.author} I need permissions to join and speak in your voice channel!`)] 
      });
    }

    if (!args.length) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`${message.author} You need to provide a song name or URL!`)]
    }

    const query = args.join(' ');

    const deezerPlaylistRegex = /https:\/\/www\.deezer\.com\/playlist\/(\d+)/;
    const appleMusicPlaylistRegex = /https:\/\/music\.apple\.com\/.*?\/playlist\/.*?\/(\d+)/;
    const youtubePlaylistRegex = /https:\/\/www\.youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/;
    const spotifyPlaylistRegex = /https:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/;

    if (
      deezerPlaylistRegex.test(query) ||
      appleMusicPlaylistRegex.test(query) ||
      youtubePlaylistRegex.test(query) ||
      spotifyPlaylistRegex.test(query)
    ) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`${message.author} Playlists are not supported. Please provide a single song URL or search query.`)]
      });
    }

    const deezerRegex = /https:\/\/www\.deezer\.com\/track\/(\d+)/;
    const appleMusicRegex = /https:\/\/music\.apple\.com\/.*?\/album\/.*?\/(\d+)/;

    const queue = message.client.distube.getQueue(message);

    if (queue && queue.songs.length >= 50) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`${message.author} The queue is full. The maximum limit is 50 songs.`)]
      });
    }

    const checkQueueLimit = async (numSongsToAdd) => {
      const currentQueue = message.client.distube.getQueue(message);
      if (currentQueue && (currentQueue.songs.length + numSongsToAdd) > 50) {
        throw new Error('Queue limit reached');
      }
    };

    if (deezerRegex.test(query)) {
      const match = query.match(deezerRegex);
      const trackId = match[1];

      try {
        const response = await axios.get(`https://api.deezer.com/track/${trackId}`);
        const song = response.data;
        const songTitle = `${song.title} - ${song.artist.name}`;

        await checkQueueLimit(1);

        await message.client.distube.play(message.member.voice.channel, songTitle, {
          member: message.member,
          textChannel: message.channel,
          message
        });

        message.channel.send({ embeds: [new EmbedBuilder().setColor('#00FF00').setDescription(`Now playing: ${songTitle}`)] }); 

      } catch (error) {
        console.error(error);
        return message.channel.send({
          embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`Could not find the song on Deezer: ${query}.`)] 
        });
      }
    } else if (appleMusicRegex.test(query)) {
      const match = query.match(appleMusicRegex);
      const trackId = match[1];

      const options = {
        method: 'POST',
        url: 'https://musicapi13.p.rapidapi.com/public/inspect/url',
        headers: {
          'x-rapidapi-key': 'd9203b7bdfmshc42d6cb1c1d8dccp14b635jsn731d3c8c6d8c',
          'x-rapidapi-host': 'musicapi13.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        data: {
          url: query
        }
      };

      try {
        const response = await axios.request(options);
        const songData = response.data.data;
        const songTitle = `${songData.name} - ${songData.artistNames}`;

        await checkQueueLimit(1);

        await message.client.distube.play(message.member.voice.channel, songTitle, {
          member: message.member,
          textChannel: message.channel,
          message
        });

        message.channel.send({ embeds: [new EmbedBuilder().setColor('#00FF00').setDescription(`Now playing: ${songTitle}`)] }); 

      } catch (error) {
        console.error(error);
        return message.channel.send({
          embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`Could not find the song on Apple Music: ${query}.`)] 
        });
      }
    } else {
      try {
        await checkQueueLimit(1);
        await message.client.distube.play(message.member.voice.channel, query, {
          member: message.member,
          textChannel: message.channel,
          message
        });

      } catch (error) {
        if (error.message === 'Queue limit reached') {
          return message.channel.send({
            embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`The queue is full. The maximum limit is 50 songs.`)] 
          });
        } else if (error.errorCode === 'CANNOT_RESOLVE_SONG') {
          return message.channel.send({
            embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`Could not find the song: ${query}.`)] 
          });
        } else {
          console.error(error);
          return message.channel.send({
            embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`An error occurred while trying to play the music.`)] 
          });
        }
      }
    }
  },
};
