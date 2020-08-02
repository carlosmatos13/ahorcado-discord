const Discord = require('discord.js');
const { prefix } = require('./config.json');
const client = new Discord.Client();

const hideWordHandler = (word) => {
   return [...word].reduce((acc, current, i) => {
      if (!i || i === word.length - 1) {
         acc += current;
      } else {
         acc += '-';
      }
      return acc;
   });
};

client.on('ready', () => {
   console.log(`Logged in as ${client.user.tag}`);
});

const gameConfig = {
   playerId: null,
   channelId: null,
   gameStart: false,
   word: '',
   players: []
};

client.on('message', (msg) => {
   if (msg.channel.type === 'dm' && gameConfig.playerId === msg.author.id) {
      if (msg.author.bot) return;
      gameConfig.word = msg.content;
      if (gameConfig.word !== '') {
         const hiddenWord = hideWordHandler(gameConfig.word);
         console.log(gameConfig.channelId);
         client.channels.cache
            .get(gameConfig.channelId)
            .send('Guess the word ' + hiddenWord);
      }
   }

   if (!msg.content.startsWith(prefix) || msg.author.bot) return;

   const args = msg.content.slice(prefix.length).trim().split(/ +/);
   const command = args.shift().toLowerCase();

   if (command === 'play') {
      gameConfig.gameStart = true;
      gameConfig.playerId = msg.author.id;
      gameConfig.channelId = msg.channel.id;
      msg.author.send('Lets play, please send me a word to start the game');
      msg.reply('Please check your DM to proceed');
   }

   if (gameConfig.gameStart && command === 'try') {
      if (args.length > 0 || args[0].length > 0) {
         msg.reply('Enter just a Letter');
      } else {
      }
   }

   //    if (gameConfig.gameStart && command === 'join') {
   //       gameConfig.players.push(msg.author.id);
   //    }
});

client.login('NzM3NDQ3NTA5ODkwMTcxMTc1.Xx9fgw.S_PZKtk_20zoIUV7S77Zgomp4pg');
