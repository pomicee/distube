const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { DeezerPlugin } = require('@distube/deezer');
const { AppleMusicPlugin } = require('distube-apple-music');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, LASTFM_API_KEY, token } = require('../JsonFiles/config.json');
const fetch = require('node-fetch');

function createDistube(client) {
    const distube = new DisTube(client, {
        emitAddSongWhenCreatingQueue: true,
        emitAddListWhenCreatingQueue: true,
        plugins: [
            new SpotifyPlugin({
                api: {
                    clientId: SPOTIFY_CLIENT_ID,
                    clientSecret: SPOTIFY_CLIENT_SECRET,
                    topTracksCountry: 'US',
                },
            }),
            new SoundCloudPlugin(),
            new DeezerPlugin(),
            new AppleMusicPlugin()
        ],
        customFilters: {
            lastfm: async (query) => {
                if (query.includes('last.fm/music/')) {
                    try {
                        const parts = query.split('last.fm/music/')[1].split('/');
                        const artist = decodeURIComponent(parts[0].replace(/\+/g, ' '));
                        const track = decodeURIComponent(parts[parts.length - 1].replace(/\+/g, ' '));

                        const response = await fetch(
                            `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`
                        );

                        if (!response.ok) {
                            throw new Error(`LastFM API responded with status: ${response.status}`);
                        }

                        const data = await response.json();
                        if (!data.track) throw new Error('No track data found');

                        return {
                            query: `${data.track.name} ${data.track.artist.name}`,
                            metadata: {
                                lastfm: {
                                    url: query,
                                    data: data.track
                                }
                            }
                        };
                    } catch (error) {
                        console.error('LastFM Error:', error);
                        return { query };
                    }
                }
                return { query };
            }
        }
    });

    const originalPlay = distube.play.bind(distube);
    distube.play = async function(voiceChannel, query, options) {
        try {
            const { query: processedQuery, metadata } = await this.options.customFilters.lastfm(query);
            
            let songName;
            if (metadata?.lastfm) {
                songName = metadata.lastfm.data.name; 
            } else if (metadata?.spotify) {
                songName = metadata.spotify.data.name; 
            } else if (metadata?.deezer) {
                songName = metadata.deezer.data.title; 
            } else {
                songName = processedQuery || 'Unknown Song'; 
            }
            
            return await originalPlay(voiceChannel, processedQuery, {
                ...options,
                metadata: metadata || options?.metadata
            });
        } catch (error) {
            console.error('Play Error:', error);
            throw error;
        }
    };

    const getSongInfo = (song) => {
        let url = song.url;
        let name = song.name;
        let artist = song.uploader?.name;

        try {
            if (song.metadata?.spotify) {
                url = song.metadata.spotify.url || song.url;
                name = song.metadata.spotify.data?.name || 'Unknown Track';
                artist = song.metadata.spotify.data?.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist';
            } 
            else if (song.metadata?.lastfm) {
                url = song.metadata.lastfm.url || song.url;
                name = song.metadata.lastfm.data?.name || 'Unknown Track';
                artist = song.metadata.lastfm.data?.artist?.name || 'Unknown Artist';
            }
            else if (song.metadata?.deezer) {
                url = song.metadata.deezer.url || song.url;
                name = song.metadata.deezer.data?.title || 'Unknown Track';
                artist = song.metadata.deezer.data?.artist?.name || 'Unknown Artist';
            }
            else {
                url = song.url;
                name = song.name;
                artist = song.uploader?.name || 'Unknown Artist';
            }
        } catch (error) {
            console.error('Error in getSongInfo:', error);
            url = song.url;
            name = song.name || 'Unknown Track';
            artist = song.uploader?.name || 'Unknown Artist';
        }

        return { url, name, artist };
    };

    const deleteNowPlayingMessage = async (textChannel) => {
        if (!textChannel) return;
        try {
            const messages = await textChannel.messages.fetch({ limit: 10 });
            const nowPlayingMsg = messages.find(m => 
                m.embeds[0]?.author?.name === 'Now Playing' && 
                m.author.id === client.user.id
            );
            if (nowPlayingMsg) await nowPlayingMsg.delete().catch(() => {});
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const createRow = (paused = false, isLooped = false, isShuffled = false) => {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shuffle')
                    .setEmoji('<:shuffle:1309368980196294656>')
                    .setStyle(isShuffled ? ButtonStyle.Success : ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setEmoji('<:previous:1307831125904719944>')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('pause')
                    .setEmoji(paused ? '<:resume:1308589508173758504>' : '<:pause:1308589512401752145>')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('skip')
                    .setEmoji('<:next:1307831121446441081>')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('loop')
                    .setEmoji(isLooped ? '<:looptrack:1309369372497940510>' : '<:loop:1309368967588216893>')
                    .setStyle(isLooped ? ButtonStyle.Success : ButtonStyle.Secondary)
            );
    };

    distube
        .on('playSong', async (queue, song) => {
            if (!queue.textChannel) return;
            await deleteNowPlayingMessage(queue.textChannel);
            queue.setVolume(50);

            const { url, name, artist } = getSongInfo(song);

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setAuthor({
                    name: 'Now Playing',
                    iconURL: song.user.displayAvatarURL({ dynamic: true, size: 32 })
                })
                .setDescription(`-# *Now playing [\`${name}\`](${url}) by **${artist}***`)
                .setFooter({ 
                    text: `Queued by ${song.user?.username || 'Unknown User'} • Position: ${queue?.songs?.length || '0'}`,
                    iconURL: song.user.displayAvatarURL({ dynamic: true, size: 32 })
                });

            const message = await queue.textChannel.send({ 
                embeds: [embed],
                components: [createRow(false, queue.repeatMode === 1, queue.shuffled)]
            });

            const collector = message.createMessageComponentCollector({ 
                componentType: ComponentType.Button,
                time: song.duration * 1000
            });

            collector.on('collect', async (interaction) => {
                const djRole = interaction.guild.roles.cache.find(role => role.name === 'DJ');
                const isDJ = djRole && interaction.member.roles.cache.has(djRole.id);
                const isRequester = interaction.user.id === song.user.id;
                const djModeEnabled = interaction.client.djMode?.get(interaction.guild.id);

                if (djModeEnabled && !isDJ && !isRequester) {
                    await interaction.reply({ 
                        content: 'Only DJs or the song requester can use these controls!',
                        ephemeral: true 
                    });
                    return;
                }

                switch (interaction.customId) {
                    case 'shuffle':
                        await interaction.deferUpdate();
                        if (!queue.shuffled) {
                            queue.shuffle();
                            queue.shuffled = true;
                            await interaction.followUp({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('#2b2d31')
                                        .setDescription('<:shuffle:1309368980196294656> Queue has been shuffled')
                                ],
                                ephemeral: true
                            });
                        } else {
                            queue.songs = [...queue.previousSongs];
                            queue.shuffled = false;
                            await interaction.followUp({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('#2b2d31')
                                        .setDescription('Queue has been unshuffled')
                                ],
                                ephemeral: true
                            });
                        }
                        await message.edit({ 
                            components: [createRow(queue.paused, queue.repeatMode === 1, queue.shuffled)] 
                        }).catch(console.error);
                        break;

                    case 'previous':
                        await interaction.deferUpdate();
                        await queue.previous().catch(console.error);
                        break;

                    case 'pause':
                        await interaction.deferUpdate();
                        if (queue.paused) {
                            queue.resume();
                            await message.edit({ 
                                components: [createRow(false, queue.repeatMode === 1, queue.shuffled)] 
                            }).catch(console.error);
                        } else {
                            queue.pause();
                            await message.edit({ 
                                components: [createRow(true, queue.repeatMode === 1, queue.shuffled)] 
                            }).catch(console.error);
                        }
                        break;

                    case 'skip':
                        await interaction.deferUpdate();
                        await queue.skip().catch(console.error);
                        break;

                    case 'loop':
                        await interaction.deferUpdate();
                        const newRepeatMode = queue.repeatMode === 1 ? 0 : 1;
                        queue.setRepeatMode(newRepeatMode);
                        await interaction.followUp({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#2b2d31')
                                    .setDescription(newRepeatMode === 1 ? '<:looptrack:1309369372497940510> Now looping the current track' : '<:loop:1309368967588216893> Loop disabled')
                            ],
                            ephemeral: true
                        });
                        await message.edit({ 
                            components: [createRow(queue.paused, newRepeatMode === 1, queue.shuffled)] 
                        }).catch(console.error);
                        break;
                }
            });

            collector.on('end', () => {
                const disabledRow = createRow(queue.paused, queue.repeatMode === 1, queue.shuffled);
                disabledRow.components.forEach(button => button.setDisabled(true));
                message.edit({ components: [disabledRow] }).catch(() => {});
            });
        })
        .on('addSong', (queue, song) => {
            if (!queue.textChannel || song.playlist) return;

            const { url, name, artist } = getSongInfo(song);

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setAuthor({
                    name: 'Added to the queue',
                    iconURL: song.user.displayAvatarURL({ dynamic: true, size: 32 }) + '?brightness=40'
                })
                .setDescription(`-# *Queued [\`${name}\`](${url}) by **${artist}***`)
                .setFooter({ 
                    text: `Queued by ${song.user?.username || 'Unknown User'} • Position: ${queue?.songs?.length || '0'}`,
                    iconURL: song.user.displayAvatarURL({ dynamic: true, size: 32 }) + '?brightness=40'
                });

            queue.textChannel.send({ embeds: [embed] }).catch(console.error);
        })
        .on('addList', (queue, playlist) => {
            if (!queue.textChannel) return;

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setDescription(`Added playlist **${playlist.name}** (${playlist.songs.length} songs) to the queue`)
                .setFooter({ 
                    text: `Queued by ${playlist.user.username}`
                });

            queue.textChannel.send({ embeds: [embed] }).catch(console.error);
        })
        .on('disconnect', queue => {
            deleteNowPlayingMessage(queue.textChannel);
        })
        .on('finishSong', (queue, song) => {
            deleteNowPlayingMessage(queue.textChannel);
        })
        .on('error', (channel, error) => {
            if (!channel || typeof channel.send !== 'function') return;

            let errorMessage = 'An unknown error occurred';
            
            if (error?.errorCode === 'NO_RESULT') {
                errorMessage = `No results found. Try searching on YouTube instead!`;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`Error: ${errorMessage}`)
                ]
            }).catch(console.error);
            
            console.error('DisTube Error:', error);
        })
        .on('finish', queue => {
            if (!queue.textChannel) return;

            queue.textChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription('Queue finished. Use `,play` to play more songs.')
                ]
            }).catch(console.error);
        });

    return distube;
}

module.exports = { createDistube };
