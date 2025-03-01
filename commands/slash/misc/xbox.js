const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xbox')
        .setDescription('Gets profile information on the given Xbox gamertag')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Xbox gamertag to look up')
                .setRequired(true)),
    
    async execute(interaction) {
        try {
            const gamertag = interaction.options.getString('username');

            const url = `https://playerdb.co/api/player/xbox/${encodeURIComponent(gamertag)}`;
            const response = await axios.get(url);

            if (response.status !== 200 || !response.data.success) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')  
                   .setDescription(`<@${interaction.user.id}>: Couldn't find an account with that username.`)
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const player = response.data.data.player;

            const embed = new EmbedBuilder()
                .setTitle(player.username)
                .setURL('https://www.xbox.com') 
                .addFields([
                    { name: 'Gamerscore', value: player.meta.gamerscore.toString(), inline: true },
                    { name: 'Account Tier', value: player.meta.accountTier, inline: true }
                ])
                .setImage(player.avatar)
                .setFooter({ text: 'Xbox', iconURL: 'https://lains.win/xbox-logo.png' })
                .setColor('#047c04');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error:', error.message);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')  
                .setDescription(`API returned an error`);
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
