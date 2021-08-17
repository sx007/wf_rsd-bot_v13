const { Client, Intents, MessageEmbed } = require('discord.js');
var request = require('request');
var express = require('express');

//Токен
const token = process.env.BOT_TOKEN;
//Префикс для команд
const prefix = process.env.PREFIX;
//ID канала, куда слать системные сообщения
const idChMsg = process.env.ID_CHANNEL_SEND;
//ID сервера
const idSrv = process.env.ID_SERVER;
//Название клана
const clNm = process.env.CLAN_NAME;
//Сервер клана
const clSr = process.env.CLAN_SRV;
//ID ролей (Администраторов и Модераторов)
const idAdmMod = process.env.ID_ADM_MOD_ROLE;
//Время старта бота
const startBot = Date.now();


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING],partials: ['USER','MESSAGE', 'CHANNEL', 'REACTION'] });
/* Вывод сообщения о работе и готовности бота */
client.on('ready', () => {
    // Если всё хорошо, то выводим статус ему + в консоль информаию
    client.user.setPresence({ activities: [{ name: '⚠ В разработке ⚠' }], status: 'online' });
    console.log(`Запустился бот ${client.user.username} ${ Date.now()}`);
});

//Заготовка для Embed сообщения (обычное)
function EmbMsg(title, color, descr){
    let embed = new MessageEmbed()
    .setTitle(title)
    .setColor(color)
    .setDescription(descr)
    .setFooter("Бот клана", "")
    .setTimestamp()
    return embed;
}

//Заготовка для Embed сообщения (справка)
function EmbMsgHelp(title, color, descr, img){
    let embed = new MessageEmbed()
    .setTitle(title)
    .setColor(color)
    .setDescription(descr)
    .setImage(img)
    .setFooter("Бот клана", "")
    .setTimestamp()
    return embed;
}

/* Обработка сообщений */
client.on('messageCreate', message => {
    //Если это сам же бот, то игнорировать
    if (message.author.bot) return;

    //Проверка на личное сообщение
    function privateMsg(){
        //Если личное сообщение
        if (message.channel.type === 'dm'){
            return true;
        }
        //Если публичное сообщение
        if (message.channel.type === 'GUILD_TEXT'){
            return false;
        }
    }

    //Проверка ролей Администратора и Модераторов по ID из переменной (конфигурации)
    function hasRoleId(mem){
        var idRepl = idAdmMod.replace(/ +/g, ' ');
        var idSplit = idRepl.split(' ');
        var result = false;
        //Перебираем ID в переменной
        idSplit.forEach(function(idSplit) {
            if (idSplit != '') {
                //Проверяем длинну ID
                if (idSplit.length === 18) {
                    //Проверка указанного id сервера
                    if (idSrv !== '' || idSrv.length === 18) {
                        //Проверка роли
                        var members = client.guilds.cache.get(idSrv).roles.cache.find(role => role.id === idSplit).members.map(m=>m.user.id);
                        //Находим среди пользователей с ролью автора сообщения
                        if (members.indexOf(mem.id) != -1) {
                            result = true;
                        }
                    }
                }
            }
        });
        //Выводим результат
        return result;
    }

    //Проверка на наличие префикса в начале сообщения
    if (!message.content.startsWith(prefix)) return;
    //Получение команды из полученного сообщения
    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const numArgs = args.map(x => parseFloat(x));
    const numArg = numArgs.length;
    const command = args.shift().toLowerCase();
    //Если команда Ping
    if (command === "ping") {
        //message.reply({ embeds: [EmbMsg(':information_source: ОТВЕТ',0x7ED321,`\nPong`)]});
        //console.log(message.author);

        //Если сообщение от Администратора или Модератора, то разрешаем

        if(hasRoleId(message.author)){
            message.reply({ content: 'Есть права', allowedMentions: { repliedUser: false }});
        } else {
            message.reply({ content: 'Нет прав', allowedMentions: { repliedUser: false }});
        }

        //Если сообщение публичное
        if (privateMsg() == false){
            //message.reply({ content: 'Pong', allowedMentions: { repliedUser: false }});
            message.reply({ embeds: [EmbMsg(':information_source: ОТВЕТ',0x7ED321,`\nPong (Pub)`)]});
        } else {
            message.reply({ embeds: [EmbMsg(':information_source: ОТВЕТ',0x7ED321,`\nPong (Privat)`)]});
        }
    }
});




//авторизация
client.login(token);
