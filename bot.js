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
            } else {
                //Если нет таких прав
                message.reply({ content: `У тебя нет прав для данной команды`, allowedMentions: { repliedUser: false }});
            }
        } else {
            //Если личное сообщение
            if (hasRoleId(message.author)){
                //И есть права необходимые
                message.reply({ content: `Время генерации сообщения ${timeTaken}ms.`, allowedMentions: { repliedUser: false }});
            } else {
                //Если нет таких прав
                message.reply({ content: `У тебя нет прав для данной команды`, allowedMentions: { repliedUser: false }});
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
            //Проверяем автора - владелец ли сервера
            if (message.author.id === ownerSrvID) {
                //Если владелец, то перезапускаем бота
                console.log("Restart bot ...");
                process.exit(1);
            } else {
                //Если нет прав
                message.reply({ content: `:no_entry: **У вас нет прав для данной команды!**`, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 20000));
            }
        } else {
            //Если личное сообщение
            //Проверяем автора - владелец ли сервера
            if (message.author.id === ownerSrvID) {
                //Если владелец, то перезапускаем бота
                console.log("Restart bot ...");
                process.exit(1);
            } else {
                //Если нет прав
                message.reply({ content: `:no_entry: **У вас нет прав для данной команды!**`, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 20000));
            }
        }
    }

    /* Подбросить монетку */
    else if (command === "монетка") {
        if(numArg === 2 && args[0] === "?") {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nВыдаёт случайный результат подброса монетки.\n\nВарианты:\nОрёл, решка или упала на ребро.\n\n**Пример набора команды**\n\`\`\`${prefix}${command}\`\`\``, 'https://i.imgur.com/zaQC0LS.gif')]});
            return;
        }
        //Вычисляем случайное число от 1 до 3
        var random = Math.floor(Math.random() * 4) + 1;
        if (random === 1) {
            //Если число = 1, то выпадает орёл.
            message.reply({ content: ':full_moon: Орёл!', allowedMentions: { repliedUser: false }});
        } else if (random === 2) { 
            //Если число = 2, то выпадает решка.
            message.reply({ content: ':new_moon: Решка!', allowedMentions: { repliedUser: false }});
        } else if (random === 3) { 
            //Если число = 3, то монета падает ребром.
            message.reply({ content: ':last_quarter_moon: Монета упала ребром!', allowedMentions: { repliedUser: false }});
        }
    }

    /* Подбросить монетку */
    else if (command === "бот") {
        if(numArg === 2 && args[0] === "?") {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nВыдаёт информацию о данном боте.\n\n**Пример набора команды**\n\`\`\`${prefix}${command}\`\`\``, 'https://i.imgur.com/kWHcX2v.gif')]});
            return;
        }
        if(numArg === 1) {
            //id Автора бота
            const autorID = '307427459450798080';
            const infoSrv = client.guilds.cache;
            //Кол-во пользователей
            const memCount = infoSrv.map(guild => guild.memberCount).join("\n");
            //Получаем содержимое package.json
            let json = require(__dirname + '/package.json');
            function msToTime(millis) {
                var weeks, days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;
                var totalT = '';
                total_seconds = parseInt(Math.floor(millis / 1000));
                total_minutes = parseInt(Math.floor(total_seconds / 60));
                total_hours = parseInt(Math.floor(total_minutes / 60));
                seconds = parseInt(total_seconds % 60);
                minutes = parseInt(total_minutes % 60);
                hours = parseInt(total_hours % 24);
                days = parseInt(Math.floor(total_hours / 24));
                weeks = parseInt(Math.floor(days / 7));
                if (weeks > 0) {
                    totalT += weeks + "нед ";
                }
                if (days > 0) {
                    totalT += days + "д ";
                }
                if (hours > 0) {
                    totalT += hours + "ч ";
                }
                if (minutes > 0) {
                    totalT += minutes + "м ";
                }
                if (seconds > 0) {
                    totalT += seconds + "с";
                }
                return totalT;
            }
            var timeOnline = Date.now()-startBot;
            message.reply({ embeds: [EmbMsg(':robot: О БОТЕ', 0x82E9FF, `\n**Версия бота: **${json.version}\n**Автор бота:** <@${autorID}>\n\n**Работает в сети:**\n${msToTime(timeOnline)}\n\n**Пользователей на сервере: **${memCount}`)]});
        }
        if(numArg > 2) {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0x82E9FF, `\nДопущена ошибка при вводе команды.\n\n**Пример набора команды**\n\`\`\`${prefix}${command}\`\`\``)]});
            return;
        }
    }

    /* Удаление сообщений */
    else if (command === "удалить") {
        if(numArg === 2 && args[0] === "?") {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nПозволяет удалить n-число сообщений в текстовом канале.\n\n**Пример набора команды**\n\`\`\`${prefix}${command} n\`\`\``, 'https://i.imgur.com/FEuW1U5.gif')]});
            return;
        }
        //Проверяем куда была отправленна данная команда
        if (privateMsg() == false){
            //публично
            //Получаем ID владельца сервера
            //const ownerSrvID = bot.guilds.cache.map(guild => guild.ownerID).join("\n");
            if (hasRoleId(message.author) && message.author.id === ownerSrvID){
                //И есть права необходимые
                if(numArg >= 3){
                    message.channel.send(`:exclamation: Ты указал много аргументов.\nИспользуй команду: \`${prefix}удалить (количество сообщений)\``);
                } else {
                    let msg;
                    //Считаем сколько удалять сообщений
                    if(numArg === 1) {
                        //Если указали только название команды
                        msg = 2;
                        //Удаляем одно сообщение
                        message.channel.bulkDelete(msg);
                    } else {
                        //Берём количество из аргумента +1 (самой команды)
                        //Проверяем аргумент количества - число или нет
                        if (isNaN(parseInt(args[0]))) {
                            //console.log('Агрумент не число');
                            message.channel.send(`:exclamation: Количество удаляемых сообщений указываем **числом**.\nИспользуй: \`${prefix}удалить (количество сообщений)\``);
                        } else {
                            //console.log('Аргумент число');
                            if (parseInt(args[0]) < 0){
                                message.channel.send(`:exclamation: Количество удаляемых сообщений не должно быть отрицательным.`);
                            } else {
                                //Если количество сообщений положительное число
                                msg = parseInt(args[0]) + 1;
                                //Проверяем на лимит
                                if (parseInt(args[0]) >= 98){
                                    message.channel.send(`:exclamation: Количество одновременно удаляемых сообщений должно быть меньше **98**.`);
                                } else {
                                    //удаляем N количество сообщений
                                    message.channel.bulkDelete(msg);
                                }
                            }
                        }
                    }
                }
            } else {
                //Если нет таких прав
                //message.reply(`\n:no_entry_sign: Недостаточно прав для данной команды!`);
                message.reply({ content: `\n:no_entry_sign: Недостаточно прав для данной команды!`, allowedMentions: { repliedUser: false }});
            }
        } else {
            //лично
            //message.reply(`:no_entry_sign: **Данная команда здесь недоступна!**`);
            message.reply({ content: `:no_entry_sign: **Данная команда здесь недоступна!**`, allowedMentions: { repliedUser: false }});
        }
    }
















});




//авторизация
client.login(token);
