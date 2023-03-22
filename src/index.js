const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const config = require("./config.json");
const client = new Discord.Client();
const prefix = "!";

// Use the token from the config file
client.login(config.token);

// Set activity status
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity("your activity status");
});

// Clear chat messages command
client.on("message", async (message) => {
  if (message.content === "!clear") {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) {
      return message.channel.send(
        "You do not have permission to use this command."
      );
    }
    await message.channel.messages.fetch().then((messages) => {
      message.channel.bulkDelete(messages);
    });
  }
});

// Muting people command
client.on("message", async (message) => {
  if (message.content.startsWith("!mute")) {
    if (!message.member.hasPermission("MANAGE_ROLES")) {
      return message.channel.send(
        "You do not have permission to use this command."
      );
    }
    const user = message.mentions.users.first();
    if (!user) {
      return message.channel.send("You must mention a user to mute.");
    }
    const member = message.guild.member(user);
    if (member) {
      member.roles
        .add("MUTE_ROLE_ID")
        .then(() => {
          message.channel.send(`${user.tag} has been muted.`);
        })
        .catch((error) => {
          console.error(error);
          message.channel.send("There was an error muting that user.");
        });
    } else {
      message.channel.send("That user is not a member of this server.");
    }
  }
});

client.on("message", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase();

  if (command === "play") {
    // Check if the user is in a voice channel
    if (!message.member.voice.channel) {
      return message.reply("You need to join a voice channel first!");
    }

    // Check if a URL was provided
    if (!args.length) {
      return message.reply("Please provide a YouTube video URL");
    }

    const connection = await message.member.voice.channel.join();
    const stream = ytdl(args[0], { filter: "audioonly" });

    const dispatcher = connection.play(stream);

    dispatcher.on("finish", () => {
      message.member.voice.channel.leave();
    });

    message.reply(`Now playing: ${args[0]}`);
  }
});

client.login(config.token);
