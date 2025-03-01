const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const LASTFM_API_KEY = ''; 

module.exports = {
    name: 'lastfm',
    async execute(message, args, prefix) {
        if (args.length === 0) {
            const embed = new EmbedBuilder()
                .setDescription('Please provide a Last.fm username.')
                .setColor('#FF0000');
            return message.channel.send({ embeds: [embed] });
        }

        const username = args[0];
        try {
            const userInfo = await fetchLastFmUserInfo(username);
            if (!userInfo) {
                const embed = new EmbedBuilder()
                    .setDescription('Could not fetch the provided username. Make sure it is valid.')
                    .setColor('#FF0000');
                return message.channel.send({ embeds: [embed] });
            }

            const embed = createEmbed(userInfo);
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching Last.fm data:', error);
            const embed = new EmbedBuilder()
                .setDescription('An error occurred while fetching the Last.fm data.')
                .setColor('#FF0000');
            message.channel.send({ embeds: [embed] });
        }
    },
};

async function fetchLastFmUserInfo(username) {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${username}&api_key=${LASTFM_API_KEY}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.user) {
        return {
            name: data.user.name,
            registered: new Date(data.user.registered['#text'] * 1000).toDateString(),
            subscriber: data.user.subscriber === '1',
            age: data.user.age ? parseInt(data.user.age) : null,
            playcount: parseInt(data.user.playcount),
            artistCount: parseInt(data.user.artist_count) || 0,
            trackCount: parseInt(data.user.track_count) || 0,
            albumCount: parseInt(data.user.album_count) || 0,
            imageUrl: data.user.image.length > 0 ? data.user.image[data.user.image.length - 1]['#text'] : null,
        };
    }
    return null;
}

function createEmbed(userInfo) {
    const embed = new EmbedBuilder()
        .setTitle(`Last.fm Stats for ${userInfo.name}`)
        .setDescription('User information and statistics')
        .setColor('#FF0000')
        .addFields(
            { name: 'Artists', value: userInfo.artistCount.toString(), inline: true },
            { name: 'Plays', value: userInfo.playcount.toString(), inline: true },
            { name: 'Tracks', value: userInfo.trackCount.toString(), inline: true },
            { name: 'Albums', value: userInfo.albumCount.toString(), inline: true },
            { name: 'Registered', value: userInfo.registered, inline: true },
            { name: 'Subscriber', value: userInfo.subscriber ? 'Yes' : 'No', inline: true },
            { name: 'Age', value: userInfo.age !== null ? userInfo.age.toString() : 'N/A', inline: true }
        )
        .setTimestamp();

    if (userInfo.imageUrl) {
        embed.setThumbnail(userInfo.imageUrl);
    }

    return embed;
}
