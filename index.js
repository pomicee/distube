const {
    Client,
    GatewayIntentBits,
    AuditLogEvent,
    Collection,
    EmbedBuilder,
    Events,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChannelType,
    ButtonBuilder,
    ButtonStyle,
    Partials,
    PermissionsBitField,
    PermissionFlagsBits,
    DiscordAPIError,
    AttachmentBuilder,
    REST,
    Routes,
    WebhookClient,
    TextChannel,
    ActivityType,
    ShardingManager
} = require('discord.js');
const { token, clientId } = require('./JsonFiles/config.json');
const { DiscordTogether } = require('discord-together');
const { createDistube } = require('./utils/distube.js');
const GuildPrefix = require('./schemas/guildPrefix.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
        Partials.GuildScheduledEvent
    ],
});

client.setMaxListeners(90);
client.discordTogether = new DiscordTogether(client);
client.commands = new Collection();
client.slashCommands = new Collection();
client.distube = createDistube(client);
const userCooldowns = new Map();


client.on('guildCreate', async (guild) => {
    const Blacklist = require('./schemas/blacklist.js');
    const blacklisted = await Blacklist.findOne({ guildId: guild.id });
    
    if (blacklisted) {
        try {
            await guild.leave();
            console.log(`Left blacklisted server: ${guild.name} (${guild.id})`);
        } catch (error) {
            console.error('Error leaving blacklisted server:', error);
        }
    }
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    client.user.setStatus('online');
    
    const activities = [
        { name: 'grave🎄❄️', type: ActivityType.Custom },
        { name: 'grave🎄❄️', type: ActivityType.Custom },
        { name: 'grave🎄❄️', type: ActivityType.Custom },
        { name: 'grave🎄❄️', type: ActivityType.Custom }
    ];
    
    let currentIndex = 0;
    client.user.setActivity(activities[0]);
    
    setInterval(() => {
        currentIndex = (currentIndex + 1) % activities.length;
        const activity = activities[currentIndex];
        client.user.setActivity({
            name: activity.name,
            type: activity.type
        });
    }, 15000);

    const commandsPath = path.join(__dirname, 'Commands');
    const slashCommandsPath = path.join(commandsPath, 'Slash');
    const slashCommands = [];

    const loadSlashCommands = (dir) => {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
        
            if (stat.isDirectory()) {
                loadSlashCommands(fullPath);
            } else if (file.endsWith('.js')) {
                const slashCommand = require(fullPath);
                
                if (slashCommand && slashCommand.data && slashCommand.data.name) {
                    if (!client.slashCommands.has(slashCommand.data.name)) {
                        client.slashCommands.set(slashCommand.data.name, slashCommand);
                        slashCommands.push(slashCommand.data.toJSON());
                    }
                }
            }
        }
    };

    loadSlashCommands(slashCommandsPath);
    loadSlashCommands(commandsPath);

    const commandFolders = fs.readdirSync(commandsPath).filter(folder => folder !== 'Slash');
    let prefixCommandsCount = 0;

    commandFolders.forEach(folder => {
        const commandFiles = fs.readdirSync(path.join(commandsPath, folder))
            .filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, folder, file);
            const command = require(filePath);
            client.commands.set(command.name, command);
            prefixCommandsCount++;
        }
    });

    try {
        console.log('Refreshing slash commands globally.');
        const rest = new REST({ version: '10' }).setToken(token);
        await rest.put(Routes.applicationCommands(clientId), { 
            body: slashCommands 
        });
        console.log(`Successfully reloaded global application slash commands. Total: ${slashCommands.length}`);
        console.log(`Total prefix commands loaded: ${prefixCommandsCount}`);
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ 
            content: 'There was an error executing that command!', 
            ephemeral: true 
        });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    
    const [prefix, action, userId] = interaction.customId.split('_');
    if (prefix !== 'music' || userId !== interaction.user.id) return;

    try {
        const queue = client.distube.getQueue(interaction.guildId);
        if (!queue) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#808080')
                        .setDescription('> <:denied:1237044955906707517> There is no music playing currently!')
                ],
                ephemeral: true
            });
        }

        switch (action) {
            case 'pause':
                if (!queue.playing) return;
                await queue.pause();
                await interaction.update({
                    components: [getMusicControlButtons({ playing: false, userId: interaction.user.id })],
                    embeds: interaction.message.embeds
                });
                break;

            case 'play':
                if (queue.playing) return;
                await queue.resume();
                await interaction.update({
                    components: [getMusicControlButtons({ playing: true, userId: interaction.user.id })],
                    embeds: interaction.message.embeds
                });
                break;

            case 'forward':
                if (queue.songs.length <= 1) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#808080')
                                .setDescription('> <:denied:1237044955906707517> No more songs in the queue!')
                        ],
                        ephemeral: true
                    });
                }
                await queue.skip();
                await interaction.update({
                    components: interaction.message.components,
                    embeds: interaction.message.embeds
                });
                break;

            case 'rewind':
                if (!queue.previousSongs.length) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#808080')
                                .setDescription('> <:denied:1237044955906707517> No previous songs!')
                        ],
                        ephemeral: true
                    });
                }
                await queue.previous();
                await interaction.update({
                    components: interaction.message.components,
                    embeds: interaction.message.embeds
                });
                break;
        }
    } catch (error) {
        console.error('Music control error:', error);
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#808080')
                    .setDescription('> <:denied:1237044955906707517> An error occurred while processing the music control.')
            ],
            ephemeral: true
        }).catch(() => {});
    }
});
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const guildPrefix = await GuildPrefix.findOne({ guildId: message.guild.id }) || { prefix: ',' };
    const prefix = guildPrefix.prefix;

    const botMentionRegex = new RegExp(`^<@!?${client.user.id}>$`);
    if (botMentionRegex.test(message.content.trim())) {
        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('#808080')
                    .setDescription(`> My prefix in this server is \`${prefix}\``)
            ]
        });
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || 
                   client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    const now = Date.now();
    const lastTimestamp = userCooldowns.get(message.author.id);
    if (lastTimestamp && now - lastTimestamp < (command.cooldown || 3000)) {
        const remainingTime = ((command.cooldown || 3000) - (now - lastTimestamp)) / 1000;
        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('#808080')
                    .setDescription(`> ⏳ Please wait ${remainingTime.toFixed(1)} more seconds before reusing commands.`)
            ]
        });
    }
    userCooldowns.set(message.author.id, now);

    if (command.botPermissions) {
        const missingPermissions = command.botPermissions.filter(
            permission => !message.guild.members.me.permissions.has(PermissionsBitField.resolve(permission))
        );
        
        if (missingPermissions.length > 0) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#808080')
                        .setDescription(`> <:denied:1237044955906707517> I need the following permissions to execute this command: ${missingPermissions.join(", ")}`)
                ]
            });
        }
    }

    try {
        message.channel.sendTyping();
        await command.execute(message, args, client);
    } catch (error) {
        console.error('Command execution error:', error);
        message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('#808080')
                    .setDescription(`> <:denied:1237044955906707517> There was an error trying to execute that command.`)
            ]
        });
    }
});

const mongoose = require('mongoose');
mongoose
    .connect('')
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

client.login(token);
