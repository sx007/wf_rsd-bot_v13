const { Client, Intents, MessageEmbed, Permissions,  } = require('discord.js');
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


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING],partials: ['USER', 'MESSAGE', 'CHANNEL', 'REACTION'] });

//Получаем ID владельца сервера
const ownerSrvID = client.guilds.cache.map(guild => guild.ownerId).join("\n");


/* Вывод сообщения о работе и готовности бота */
client.on('ready', () => {
    // Если всё хорошо, то выводим статус ему + в консоль информаию
    client.user.setPresence({ activities: [{ name: '⚠ В разработке ⚠' }], status: 'dnd' });
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

    //Получаем ID владельца сервера
    const ownerSrvID = client.guilds.cache.map(guild => guild.ownerId).join("\n");
    //console.log(ownerSrvID);

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

    //Проверка на JSON
    function IsJsonString(str) {
        str = typeof item !== "string"
            ? JSON.stringify(str)
            : str;
        try {
            str = JSON.parse(str);
        } catch (e) {
            return false;
        }
        if (typeof str === "object" && str !== null) {
            return true;
        }
        return false;
    }

    //Номер сервера в название
    function numSrvToStr(num){
        if (num == 1){
            return "Альфа";
        }
        if (num == 2){
            return "Браво";
        }
        if (num == 3){
            return "Чарли";
        }
    }

    //Удаление из текстого канала ссылок-приглашений
    if (message.content.includes('discord.gg/') ||  message.content.includes('discordapp.com/invite/')){
        //Если сообщение публичное
        if (privateMsg() == false){
            //Если сообщение от Администратора или Модератора, то разрешаем
            if(!hasRoleId(message.author)){
                //Удаляем сообщение
                message.delete();
                //Отправляем в личку сообщение пользователю
                message.author.send({ content: 'Ссылки-приглашения (Invite) **запрещены** на данном сервере!\nЧтобы кого-то пригласить на другой Discord-сервер, отправьте приглашение или ссылку в личку определённому человеку.', allowedMentions: { repliedUser: false }});
            }
        }
    }

    //Проверка на наличие префикса в начале сообщения
    if (!message.content.startsWith(prefix)) return;
    //Получение команды из полученного сообщения
    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const numArgs = args.map(x => parseFloat(x));
    const numArg = numArgs.length;
    const command = args.shift().toLowerCase();

    if (command === "команды") {
        if(numArg === 2 && args[0] === "?") {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nПоказывает краткую информацию доступных для вас команд.\n\n**Пример набора команды**\n\`\`\`${prefix}${command}\`\`\``, 'https://i.imgur.com/h2sueFM.gif')]});
            return;
        }
        
        //Если сообщение публичное
        if (privateMsg() == false){
            //Если публичное сообщение
            if (hasRoleId(message.author)) {
                //Проверяем на права владельца сервера
                if (message.author.id === ownerSrvID) {
                    //Если права есть
                    message.reply({ embeds: [EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\n**\`${prefix}команды\`** отобразить список всех доступных команд\n**\`${prefix}боец\`** получить игровую статистику о бойце\n**\`${prefix}клан\`** получить информацию о ежемесячном рейтинге клана\n**\`${prefix}бот\`** получить информацию о данном боте\n**\`${prefix}вк\`** получить ссылку на группу клана в VK\n**\`${prefix}монетка\`** случайный результат подброса монетки\n**\`${prefix}гороскоп\`** Позволяет получить гороскоп на сегодня по указанному знаку зодиака\n\n**\`${prefix}rs\`** перезагрузить бота\n**\`${prefix}ping\`** узнать время генерации сообщения\n**\`${prefix}удалить\`** позволяет удалить N-количество сообщений в текстовом канале\n**\`${prefix}кик\`** позволяет выгналь пользователя с сервера\n**\`${prefix}бан\`** позволяет забанить пользователя на сервере\n\n:warning: Получить подробную справку о любой команде можно добавив через пробел вопросительный знак.\n**Пример набора команды**\n\`\`\`${prefix}${command} ?\`\`\``)]});
                } else {
                    //Если нет
                    message.reply({ embeds: [EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\n**\`${prefix}команды\`** отобразить список всех доступных команд\n**\`${prefix}боец\`** получить игровую статистику о бойце\n**\`${prefix}клан\`** получить информацию о ежемесячном рейтинге клана\n**\`${prefix}бот\`** получить информацию о данном боте\n**\`${prefix}вк\`** получить ссылку на группу клана в VK\n**\`${prefix}монетка\`** случайный результат подброса монетки\n**\`${prefix}гороскоп\`** Позволяет получить гороскоп на сегодня по указанному знаку зодиака\n\n**\`${prefix}кик\`** позволяет выгналь пользователя с сервера\n**\`${prefix}бан\`** позволяет забанить пользователя на сервере\n\n:warning: Получить подробную справку о любой команде можно добавив через пробел вопросительный знак.\n**Пример набора команды**\n\`\`\`${prefix}${command} ?\`\`\``)]});
                }
            } else {
                message.reply({ embeds: [EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\n**\`${prefix}команды\`** отобразить список всех доступных команд\n**\`${prefix}боец\`** получить игровую статистику о бойце\n**\`${prefix}клан\`** получить информацию о ежемесячном рейтинге клана\n**\`${prefix}бот\`** получить информацию о данном боте\n**\`${prefix}вк\`** получить ссылку на группу клана в VK\n**\`${prefix}монетка\`** случайный результат подброса монетки\n**\`${prefix}гороскоп\`** Позволяет получить гороскоп на сегодня по указанному знаку зодиака\n\n:warning: Получить подробную справку о любой команде можно добавив через пробел вопросительный знак.\n**Пример набора команды**\n\`\`\`${prefix}${command} ?\`\`\``)]});
            }
        } else {
            //Если личное сообщение
            if (hasRoleId(message.author)) {
                //Проверяем на права владельца сервера
                if (message.author.id === ownerSrvID) {
                    //Если права есть
                    message.reply({ embeds: [EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\n**\`${prefix}команды\`** отобразить список всех доступных команд\n**\`${prefix}боец\`** получить игровую статистику о бойце\n**\`${prefix}клан\`** получить информацию о ежемесячном рейтинге клана\n**\`${prefix}бот\`** получить информацию о данном боте\n**\`${prefix}вк\`** получить ссылку на группу клана в VK\n**\`${prefix}монетка\`** случайный результат подброса монетки\n**\`${prefix}гороскоп\`** Позволяет получить гороскоп на сегодня по указанному знаку зодиака\n\n**\`${prefix}rs\`** перезагрузить бота\n**\`${prefix}ping\`** узнать время генерации сообщения\n**\`${prefix}удалить\`** позволяет удалить N-количество сообщений в текстовом канале\n**\`${prefix}кик\`** позволяет выгналь пользователя с сервера\n**\`${prefix}бан\`** позволяет забанить пользователя на сервере\n\n:warning: Получить подробную справку о любой команде можно добавив через пробел вопросительный знак.\n**Пример набора команды**\n\`\`\`${prefix}${command} ?\`\`\``)]});
                } else {
                    message.reply({ embeds: [EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\n**\`${prefix}команды\`** отобразить список всех доступных команд\n**\`${prefix}боец\`** получить игровую статистику о бойце\n**\`${prefix}клан\`** получить информацию о ежемесячном рейтинге клана\n**\`${prefix}бот\`** получить информацию о данном боте\n**\`${prefix}вк\`** получить ссылку на группу клана в VK\n**\`${prefix}монетка\`** случайный результат подброса монетки\n**\`${prefix}гороскоп\`** Позволяет получить гороскоп на сегодня по указанному знаку зодиака\n\n**\`${prefix}кик\`** позволяет выгналь пользователя с сервера\n**\`${prefix}бан\`** позволяет забанить пользователя на сервере\n\n:warning: Получить подробную справку о любой команде можно добавив через пробел вопросительный знак.\n**Пример набора команды**\n\`\`\`${prefix}${command} ?\`\`\``)]});
                }
            } else {
                message.reply({ embeds: [EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\n**\`${prefix}команды\`** отобразить список всех доступных команд\n**\`${prefix}боец\`** получить игровую статистику о бойце\n**\`${prefix}клан\`** получить информацию о ежемесячном рейтинге клана\n**\`${prefix}бот\`** получить информацию о данном боте\n**\`${prefix}вк\`** получить ссылку на группу клана в VK\n**\`${prefix}монетка\`** случайный результат подброса монетки\n**\`${prefix}гороскоп\`** Позволяет получить гороскоп на сегодня по указанному знаку зодиака\n\n:warning: Получить подробную справку о любой команде можно добавив через пробел вопросительный знак.\n**Пример набора команды**\n\`\`\`${prefix}${command} ?\`\`\``)]});
            }
        }
    }

    //Если отправлена команда вк
    else if (command === "вк") {
        if(numArg === 2 && args[0] === "?") {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nДанная команда позволяет получить ссылку на группу нашего клана в социальной сети ВКонтакте.\n\n**Пример набора команды**\n\`\`\`${prefix}${command}\`\`\``, 'https://i.imgur.com/LtMTPRC.gif')]});
            return;
        }
        if(numArg === 1) {
            //Отправляем ссылку на группу
            message.reply({ embeds: [EmbMsg(':thumbsup: Группа клана', 0x2B71FF, `\nВступайте в нашу группу в социальной сети ВКонтакте:\n[Наша группа в ВК](https://vk.com/wf_rsd)`)]});
            return;
        }
        if(numArg > 2) {
            //Выдаём ошибку
            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0x2B71FF, `\nДопущена ошибка при вводе команды.\n\n**Пример набора команды**\n\`\`\`${prefix}${command}\`\`\``)]});
            return;
        }
    }

    //Если отправлена команда ping
    else if (command === "ping") {
        if(numArg === 2 && args[0] === "?") {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nДанная команда позволяет узнать время генерации сообщения.\n\n**Пример набора команды**\n\`\`\`${prefix}${command}\`\`\``, 'https://i.imgur.com/DdqIw0Z.gif')]});
            return;
        }
        const timeTaken = Date.now() - message.createdTimestamp;
        //Если сообщение публичное
        if (privateMsg() == false){
            //Если публичное сообщение
            if (hasRoleId(message.author)){
                //И есть права необходимые
                message.reply({ content: `Время генерации сообщения ${timeTaken}ms.`, allowedMentions: { repliedUser: false }});
                //message.reply(`Время генерации сообщения ${timeTaken}ms.`);
            } else {
                //Если нет таких прав
                message.reply({ content: `У тебя нет прав для данной команды`, allowedMentions: { repliedUser: false }});
                //message.reply(`У тебя нет прав для данной команды`);
            }
        } else {
            //Если личное сообщение
            if (hasRoleId(message.author)){
                //И есть права необходимые
                message.reply({ content: `Время генерации сообщения ${timeTaken}ms.`, allowedMentions: { repliedUser: false }});
                //message.reply(`Время генерации сообщения ${timeTaken}ms.`);
            } else {
                //Если нет таких прав
                message.reply({ content: `У тебя нет прав для данной команды`, allowedMentions: { repliedUser: false }});
                //message.reply(`У тебя нет прав для данной команды`);
            }
        }
    }

    /* Команда перезагрузки бота */
    else if (command === "rs") {
        if(numArg === 2 && args[0] === "?") {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nДанная команда позволяет перезагрузить бота дистанционно.\n\n**Пример набора команды**\n\`\`\`${prefix}${command}\`\`\``, 'https://i.imgur.com/iHZWyZA.gif')]});
            return;
        }
        //Если сообщение публичное
        if (privateMsg() == false){
            console.log(message.author.id, " ", ownerSrvID);
            //Проверяем автора - владелец ли сервера
            if (message.author.id === ownerSrvID) {
                //Если владелец, то перезапускаем бота
                //message.reply(`:robot: :repeat: **Бот перезапускается!**`).then(m => m.delete({timeout: 15000}));
                console.log("Restart bot ...");
                process.exit(1);
            } else {
                //Если нет прав
                message.reply({ content: `:no_entry: **У вас нет прав для данной команды!**`, allowedMentions: { repliedUser: false }});
                //setTimeout(() => message.delete(), 20000);
                //message.reply(`:no_entry: **У вас нет прав для данной команды!**`).then(m => m.delete({timeout: 20000}));
            }
        } else {
            //Если личное сообщение
            //Проверяем автора - владелец ли сервера
            if (message.author.id === ownerSrvID) {
                //Если владелец, то перезапускаем бота
                //message.reply(`:robot: :repeat: **Бот перезапускается!**`);
                console.log("Restart bot ...");
                process.exit(1);
            } else {
                //Если нет прав
                message.reply({ content: `:no_entry: **У вас нет прав для данной команды!**`, allowedMentions: { repliedUser: false }});
                //message.reply(`:no_entry: **У вас нет прав для данной команды!**`);
            }
        }
    }
















});




//авторизация
client.login(token);
