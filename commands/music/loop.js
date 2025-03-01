const { EmbedBuilder } = require('discord.js'); 
const axios = require('axios');

module.exports = {
  name: 'loop',
  description: 'Toggle looping the current song, the entire queue, or turn off looping.',
  category: 'Music',
  async execute(message, args) {
    const queue = message.client.distube.getQueue(message);

    if (!queue) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('There is no music playing currently!')] 
      });
    }

    const currentLoopMode = queue.repeatMode;
    let nextLoopMode;

    if (currentLoopMode === 0) {
      nextLoopMode = 1; 
    } else if (currentLoopMode === 1) {
      nextLoopMode = 2; 
    } else {
      nextLoopMode = 0; 
    }

    await queue.setRepeatMode(nextLoopMode);

    let modeMessage;
    if (nextLoopMode === 1) {
      modeMessage = 'Looping the current song.';
    } else if (nextLoopMode === 2) {
      modeMessage = 'Looping the entire queue.';
    } else {
      modeMessage = 'Stopped looping.';
    }

    return message.channel.send({
      embeds: [new EmbedBuilder().setColor('#00FF00').setDescription(modeMessage)] 
    });
  },
};
