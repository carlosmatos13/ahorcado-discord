require('dotenv').config();
const Discord = require('discord.js');
const { prefix } = require('./config.json');
const client = new Discord.Client();

const helpBoard = new Discord.MessageEmbed()
   .setTitle('Help')
   .setDescription('Here are the commands to start playing!')
   .addField('!play', 'Starts a new game')
   .addField('!try <letter>', 'Guesses a letter in the game')
   .addField(
      '!solve <string>',
      'Attempts to end the game by solving the word, if you miss you lose'
   )
   .addField('!join', 'Join a match to play');
const gameBoard = new Discord.MessageEmbed();
const hangASCII = [
   '+---------+\n |                |\n                  |\n                  |\n                  |\n                  |\n                  |\n                  |\n===============\n',
   '+---------+\n |                |\nO               |\n                  |\n                  |\n                  |\n                  |\n                  |\n===============\n',
   '+---------+\n |                |\nO               |\n |                |\n                  |\n                  |\n                  |\n                  |\n===============\n',
   '+---------+\n  |               |\n O              |\n/|               |\n                  |\n                  |\n                  |\n                  |\n===============\n',
   '+---------+\n  |               |\n O              |\n/|\\            |\n                  |\n                  |\n                  |\n                  |\n===============\n',
   '+---------+\n  |               |\n O              |\n/|\\            |\n/                |\n                  |\n                  |\n                  |\n===============\n',
   '+---------+\n  |               |\n O              |\n/|\\            |\n/ \\            |\n                  |\n                  |\n                  |\n===============\n'
];

client.on('ready', () => {
   console.log(`Logged in as ${client.user.tag}`);
});

let gameConfig = {
   playerId: null,
   channelId: null,
   gameStart: false,
   word: '',
   hidedWord: '',
   players: [],
   correctLetters: [],
   wrongLetters: [],
   damage: 0
};

client.on('message', (msg) => {
   if (msg.channel.type === 'dm' && gameConfig.playerId === msg.author.id) {
      if (msg.author.bot) return;
      if (!/\s/.test(msg.content) && /^[a-zA-Z]+$/.test(msg.content)) {
         console.log(msg.content);
         gameConfig.word = msg.content.toLowerCase();
         const hiddenWord = hideWordHandler(gameConfig.word);
         client.channels.cache
            .get(gameConfig.channelId)
            .send('Guess the word ' + hiddenWord);
      } else {
         msg.reply('Write a single word to play with only letters');
      }
   }

   if (!msg.content.startsWith(prefix) || msg.author.bot) return;

   const args = msg.content.slice(prefix.length).trim().split(/ +/);
   const command = args.shift().toLowerCase();

   if (command === 'help') {
      msg.channel.send(helpBoard);
   }

   if (command === 'play') {
      gameConfig.gameStart = true;
      gameConfig.playerId = msg.author.id;
      gameConfig.channelId = msg.channel.id;
      msg.author.send('Lets play, please send me a word to start the game');
      msg.reply('Please check your DM to proceed');
   }

   if (command === 'solve') {
      if (args.length > 1) {
         msg.reply('Type only one word');
      } else {
         args[0] === gameConfig.word
            ? winnerBoard(msg)
            : increaseDamage(msg, 6);
      }
   }

   if (gameConfig.gameStart && command === 'try') {
      if (args.length > 1 || args[0].length > 1) {
         msg.reply('Enter just a Letter');
      } else {
         if (
            gameConfig.word.includes(args[0]) &&
            !gameConfig.correctLetters.includes(args[0])
         ) {
            gameConfig.correctLetters.push(args[0]);
            const hiddenWord = hideWordHandler(gameConfig.word);
            gameConfig.hidedWord = hiddenWord;
            hiddenWord === gameConfig.word
               ? winnerBoard(msg)
               : msg.reply('You got one ' + hiddenWord);
         } else if (gameConfig.correctLetters.includes(args[0])) {
            msg.reply('That has been guessed');
         } else if (gameConfig.wrongLetters.includes(args[0])) {
            msg.reply('You already tried that letter');
         } else {
            gameConfig.wrongLetters.push(args[0]);
            increaseDamage(msg, 1);
         }
      }
   }

   //    if (gameConfig.gameStart && command === 'join') {
   //       gameConfig.players.push(msg.author.id);
   //    }
});

client.login(process.env.DISCORD_TOKEN);

// FUNCTIONS

const resetGame = () => {
   gameConfig = {
      playerId: null,
      channelId: null,
      gameStart: false,
      word: '',
      hidedWord: '',
      players: [],
      correctLetters: [],
      wrongLetters: [],
      damage: 0
   };
};

const hideWordHandler = (word) => {
   return [...word].reduce((acc, current) => {
      if (gameConfig.correctLetters.includes(current)) {
         acc += current;
      } else {
         acc += '-';
      }
      return acc;
   });
};

const increaseDamage = (msg, damage) => {
   gameConfig.damage = gameConfig.damage + damage;
   gameBoard
      .setTitle(hangASCII[gameConfig.damage])
      .setFooter('Wrong letters: ' + gameConfig.wrongLetters.join('-'));
   msg.channel.send(gameBoard);
   if (gameConfig.damage === 6) {
      gameBoard
         .setTitle('You Lose!')
         .setFooter('The correct answer was: ' + gameConfig.word);
      msg.channel.send(gameBoard);
      resetGame();
   }
};

const winnerBoard = (msg) => {
   gameBoard.setTitle('Congratulations!').setFooter('You Win!');
   msg.reply(gameBoard);
   resetGame();
};
