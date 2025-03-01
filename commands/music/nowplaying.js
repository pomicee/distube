const { EmbedBuilder } = require('discord.js'); 

module.exports = {
  name: 'nowplaying',
  description: 'Display the currently playing song.',
  category: 'Music',
  async execute(message) {
    const queue = message.client.distube.getQueue(message);

    if (!queue || !queue.songs.length) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('There is no music playing currently!')]
      });
    }

    const currentSong = queue.songs[0]; 

    const nowPlayingEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Now Playing')
      .setDescription(`**${currentSong.name}**\nRequested by: ${currentSong.user}\nVolume: ${queue.volume}`)
      .setFooter({ text: `Duration: ${currentSong.formattedDuration}` });

    return message.channel.send({ embeds: [nowPlayingEmbed] }); 
  },
};
