var Discord = require("discord.io");

var logger = require("winston");
var auth = require("./auth.json");

var request = require("request");
var cheerio = require("cheerio");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});
logger.level = "debug";

// Initialize Discord Bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

bot.on("ready", function(evt) {
  logger.info("Connected");
  logger.info("Logged in as: ");
  logger.info(bot.username + " - (" + bot.id + ")");
});

bot.on("message", function(user, userID, channelID, message, evt) {
  if (message.substring(0, 1) == "!") {
    var args = message.substring(1).split(" ");
    var cmd = args[0];

    args = args.splice(1);

    switch (cmd) {
      case "card":
        request("http://ufsultra.com/?q=" + args.join(' '), function(err, resp, html) {
          if (!err) {
            const $ = cheerio.load(html);
            if ($("#content .mini_image").attr("src") === undefined){
                bot.sendMessage({ to: channelID, message: args.join(' ') + " not found"});
                return;
            }
            var cardImage =
              "http://ufsultra.com/" +
              $("#content .mini_image")
                .attr("src")
                .replace("mini", "preview");
            var directLink =
              "http://ufsultra.com/" +
              $("#content .card_division a")
                .last()
                .attr("href");
            bot.sendMessage({ to: channelID, message: cardImage });
            bot.sendMessage({ to: channelID, message: directLink });
          }
        });
        break;
      default:
    }
  }
});
