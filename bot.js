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
    //Название сервера
    const nameSrv = client.guilds.cache.map(guild => guild.name).join("\n");

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
            if (hasRoleId(message.author) && message.author.id === ownerSrvID){
                //И есть права необходимые
                if(numArg >= 3){
                    message.channel.send({ content: `:exclamation: Ты указал много аргументов.\nИспользуй команду: \`${prefix}удалить (количество сообщений)\``});
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
                            message.channel.send({ content: `:exclamation: Количество удаляемых сообщений указываем **числом**.\nИспользуй: \`${prefix}удалить (количество сообщений)\``});
                        } else {
                            //console.log('Аргумент число');
                            if (parseInt(args[0]) < 0){
                                message.channel.send({ content: `:exclamation: Количество удаляемых сообщений не должно быть отрицательным.`});
                            } else {
                                //Если количество сообщений положительное число
                                msg = parseInt(args[0]) + 1;
                                //Проверяем на лимит
                                if (parseInt(args[0]) >= 98){
                                    message.channel.send({ content: `:exclamation: Количество одновременно удаляемых сообщений должно быть меньше **98**.`});
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
                message.reply({ content: `\n:no_entry_sign: Недостаточно прав для данной команды!`, allowedMentions: { repliedUser: false }});
            }
        } else {
            //лично
            message.reply({ content: `:no_entry_sign: **Данная команда здесь недоступна!**`, allowedMentions: { repliedUser: false }});
        }
    }

    /* Выгнать пользователя с сервера */
    else if (command === "кик") {
        if(numArg === 2 && args[0] === "?") {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nПозволяет выгнать (кикнуть) пользователя с сервера.\n\nУказываем пользователя через знак @\nЧерез пробел можно указать причину кика с сервера.\n\n**Пример набора команды**\n\`\`\`${prefix}${command} @пользователь причина\`\`\``, 'https://i.imgur.com/87RRitG.gif')]});
            return;
        }
        //Название сервера
        //const nameSrv = client.guilds.cache.map(guild => guild.name).join("\n");
        //Проверяем куда была отправленна данная команда
        if (privateMsg() == false){
            //публично
            let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            let reas = args.slice(1).join(' ');
            //Если автор сообщения - Бот
            if (message.author.bot){
                return;
            };
            //Проверяем права на доступ к данной команде
            if (hasRoleId(message.author)){
                if(numArg === 1) {
                    //Если указали только название команды
                    message.reply({ content: `:exclamation: Неверно указана команда.\nИспользуй: \`${prefix}кик @Ник Причина_кика\``, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 20000));
                    return;
                }
                //Пользователь не найден
                if (!user){
                    message.reply({ content: `\n:no_pedestrians: Указанный пользователь не найден!`, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 15000));
                    return;
                }
                //Попытка самого себя кикнуть
                if (user.id == message.author.id){
                    message.reply({ content: `\n:no_entry_sign: Ты не можешь кикнуть себя!`, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 15000));
                    return;
                }
                //Проверяем Администратор или Модератор 
                if (hasRoleId(user)){
                    message.reply({ content: `\n:no_entry_sign: Нельзя кикнуть пользователя с правами **Администратор** или **Модераторы**!`, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 15000));
                    return;
                }
                //Попытка кикнуть бота
                if (user.user.bot){
                    message.reply({ content: `\n:robot: Чем тебе бот помешал, мешок с костями? Ты не можешь кикнуть бота!`, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 15000));
                    return;
                }
                //Не указана причина кика
                if (!reas){
                    reas = "Увы, не указана причина кика";
                }
                //Отправляем пользователю, которого кикнули, сообщение
                //user.send(">>> Тебя кикнули с сервера **" + nameSrv + "**\nПричина: " + reas);
                user.send({ content: ">>> Тебя кикнули с сервера **" + nameSrv + "**\nПричина: **" + reas + "**"});
                //Кикаем пользователя с сервера
                user.kick(reas);
                //Проверяем наличие канала, куда будем отправлять сообщение
                let logChannel = client.channels.cache.find(ch => ch.id === idChMsg);
                if(!logChannel) return;
                //Канал для отправки сообщения
                let sysCh = client.channels.cache.get(idChMsg);
                //Формирование
                sysCh.send({ embeds: [EmbMsg(':diamonds: :no_pedestrians: **[КИКНУЛИ ПОЛЬЗОВАТЕЛЯ]**',0xFF3700,`Пользователя ${user}\nНик: \`${user.displayName}\`\nTag: \`${user.user.username}#${user.user.discriminator}\`\n\nКто кикнул:\n${message.author}\n\nПричина:\n${reas}`)]});
            } else {
                //Если нет таких прав
                message.reply({ content: `\n:no_entry_sign: Недостаточно прав для данной команды!`, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 20000));
            }
        } else {
            //лично
            message.reply({ content: `:no_entry_sign: Данная команда здесь недоступна!`, allowedMentions: { repliedUser: false }});
        }
    }

    /* Забанить пользователя на сервере */
    else if (command === "бан") {
        if(numArg === 2 && args[0] === "?") {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nПозволяет забанить пользователя на сервере.\n\nУказываем пользователя через знак @\nЧерез пробел можно указать причину бана.\n\n**Пример набора команды**\n\`\`\`${prefix}${command} @пользователь Причина\`\`\``, 'https://i.imgur.com/EvOKwro.gif')]});
            return;
        }
        //Проверяем куда была отправленна данная команда
        if (privateMsg() == false){
            //публично
            let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            let reas = args.slice(1).join(' ');
            //Если автор сообщения - Бот
            if (message.author.bot){
                return;
            };
            //Проверяем права на доступ к данной команде
            if (hasRoleId(message.author)){
                if(numArg === 1) {
                    //Если указали только название команды
                    message.reply({ content: `:exclamation: Неверно указана команда.\nИспользуй: \`${prefix}бан @Ник Причина_бана\``, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 20000));
                    return;
                }
                //Пользователь не найден
                if (!user){
                    message.reply({ content: `\n:no_pedestrians: Указанный пользователь не найден!`, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 15000));
                    return;
                }
                //Попытка самого себя забанить
                if (user.id == message.author.id){
                    message.reply({ content: `\n:no_entry_sign: Ты не можешь забанить себя!`, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 15000));
                    return;
                }
                //Проверяем Администратор или Модератор 
                if (hasRoleId(user)){
                    message.reply({ content: `\n:no_entry_sign: Нельзя забанить пользователя с правами **Администратор** или **Модераторы**!`, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 15000));
                    return;
                }
                //Попытка забанить бота
                if (user.user.bot){
                    message.reply({ content: `\n:robot: Чем тебе бот помешал, мешок с костями? Ты не можешь забанить бота!`, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 15000));
                    return;
                }
                //Не указана причина бана
                if (!reas){
                    reas = "Увы, не указана причина бана";
                }
                //Отправляем пользователю, которого забанили, сообщение
                user.send({ content: ">>> Тебя забанили на сервере **" + nameSrv + "**\nПричина: **" + reas + "**"});
                //Баним пользователя на сервере
                user.ban({ reason: reas });
                //Проверяем наличие канала, куда будем отправлять сообщение
                let logChannel = client.channels.cache.find(ch => ch.id === idChMsg);
                if(!logChannel) return;
                //Канал для отправки сообщения
                let sysCh = client.channels.cache.get(idChMsg);
                //Формирование
                sysCh.send({ embeds: [EmbMsg(':diamonds: :no_pedestrians: **[ЗАБАНИЛИ ПОЛЬЗОВАТЕЛЯ]**',0xFF3700,`Пользователя ${user}\nНик: \`${user.displayName}\`\nTag: \`${user.user.username}#${user.user.discriminator}\`\n\nКто забанил:\n${message.author}\n\nПричина:\n${reas}`)]});
            } else {
                //Если нет таких прав
                message.reply({ content: `\n:no_entry_sign: Недостаточно прав для данной команды!`, allowedMentions: { repliedUser: false }}).then(m => setTimeout(() => m.delete(), 15000));
            }
        } else {
            //лично
            message.reply({ content: `:no_entry_sign: Данная команда здесь недоступна!`, allowedMentions: { repliedUser: false }});
        }
    }

    /* Информация по бойцу */
    else if (command === "боец") {
        if(numArg === 2 && args[0] === "?") {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nПозволяет получить игровую статистику по бойцу.\n\nУкажите ник бойца, через пробел сервер на котором искать: **Альфа Браво Чарли**\n\nЕсли сервер не будет указан, то поиск будет производится на всех трёх серверах.\n\n**Пример набора команды**\n\`\`\`${prefix}${command} НикБойца Сервер\`\`\``, 'https://i.imgur.com/N1CZPZM.gif')]});
            return;
        }
        //парсинг данных с API
        function parseApi(info, srv) {
            //Класс в игре
            function classGame(cl) {
                //Проверяем
                if (cl === false) {
                    return "-";
                } else {
                    if (cl === "Rifleman")
                    {
                        return "Штурмовик";
                    }
                    if (cl === "Engineer")
                    {
                        return "Инженер";
                    }
                    if (cl === "Medic")
                    {
                        return "Медик";
                    }
                    if (cl === "Recon")
                    {
                        return "Снайпер";
                    }
                    if (cl === "Heavy")
                    {
                        return "СЭД";
                    }
                }
            }
            var user = "";
            //Ник в игре
            user += "**Ник:**   ``" + info.nickname + "``\n";
            //Игровой сервер
            user += "**Игровой сервер:**   ``" + numSrvToStr(srv) + "``\n";
            //Клан
            if (info.clan_name) {
                user += "**Клан:**   ``" + info.clan_name + "``\n";
            } else {
                user += "**Клан:**   ``-``\n";
            }
            //Ранг
            user += "**Ранг:**   ``" + info.rank_id + "``\n";
            //Общее время матчей
            user += "**Общее время матчей:**   ``" + info.playtime_h + "ч " + info.playtime_m + "м``\n";
            //Любимый класс PvP
            user += "**Любимый класс PvP:**   ``" + classGame(info.favoritPVP) + "``\n";
            //Соотн. убийств/смертей:
            user += "**Соотн. убийств/смертей:**   ``" + info.pvp + "``\n";
            //Побед/Поражений
            user += "**Побед/Поражений:**   ``" + info.pvp_wins + " / " + info.pvp_lost + "``\n";
            //Любимый класс PvE
            user += "**Любимый класс PvE:**   ``" + classGame(info.favoritPVE) + "``\n";
            //Пройдено PvE
            user += "**Пройдено PvE:**   ``" + info.pve_wins + "``";
            //Выводим
            return user;
        }

        //Если указали только название команды
        if(numArg === 1 || numArg > 3) {
            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Укажите через пробел ник бойца, которого будите искать.\nТак же можно указать сервер через пробел.\n\nПример: \`${prefix}боец НикБойца Альфа\``)]}).then(m => setTimeout(() => m.delete(), 20000));
            return;
        }
        //Если не указали где искать
        if(numArg === 2) {
            let uName = args[0].toLowerCase();
            //Проверяем указанный ник
            if (uName.length >= 4 && uName.length <= 16) {
                //Номер сервера + Название сервера
                let numSrv = 1;
                let nameSrv = numSrvToStr(numSrv);
                //Начинаем проверку на сервере Альфа
                let link = "http://api.warface.ru/user/stat/?name=" + uName + "&server=" + numSrv;
                let urlEnc = encodeURI(link);
                var options = {url: urlEnc, method: 'GET', json: true, headers: {'User-Agent': 'request', 'Accept-Language' : 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'}, timeout: 10000};
                //Запрос
                request(options, function(err, res, data){
                    //Если ошибка
                    if (err) {
                        console.log('Error: ', err);
                        message.reply({ embeds: [(EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`))]}).then(m => setTimeout(() => m.delete(), 20000));
                        return;
                    }
                    //Если нет ответа запроса
                    if(!res) {
                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Не получен ответ на запроса в течении 10 секунд.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                        return;
                    } else {
                        //Если статус запроса 200
                        if (res.statusCode == 200) {
                            //Нашли на Альфа
                            if (IsJsonString(data) == true) {
                                message.reply({ embeds: [EmbMsg(':bar_chart: Статистика по бойцу', 0x02A5D0 , parseApi(data, 1))]});
                            }                        
                        } else {
                            //Неверный запрос
                            if (res.statusCode == 400) {
                                //Не нашли на Альфе
                                if (data.message == "Пользователь не найден"){
                                    //Не нашли на Альфе - надо дальше искать (Браво)
                                    numSrv = numSrv+1;
                                    nameSrv = numSrvToStr(numSrv);
                                    let link = "http://api.warface.ru/user/stat/?name=" + uName + "&server=" + numSrv;
                                    let urlEnc = encodeURI(link);
                                    var options = {url: urlEnc, method: 'GET', json: true, headers: {'User-Agent': 'request', 'Accept-Language' : 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'}, timeout: 10000};
                                    //Запрос
                                    request(options, function(err, res, data){
                                        //Если ошибка
                                        if (err) {
                                            console.log('Error: ', err);
                                            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                            return;
                                        }
                                        //Если нет ответа запроса
                                        if(!res) {
                                            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Не получен ответ на запроса в течении 10 секунд.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                            return;
                                        } else {
                                            //Если статус запроса 200
                                            if (res.statusCode == 200) {
                                                //Нашли на Браво
                                                if (IsJsonString(data) == true) {
                                                    message.reply({ embeds: [EmbMsg(':bar_chart: Статистика по бойцу', 0x02A5D0 , parseApi(data, 2))]});
                                                }
                                            } else {
                                                //Неверный запрос
                                                if (res.statusCode == 400) {
                                                    //Не нашли на Браво
                                                    if (data.message == "Пользователь не найден"){
                                                        //надо дальше искать (Чарли)
                                                        numSrv = numSrv+1;
                                                        nameSrv = numSrvToStr(numSrv);
                                                        let link = "http://api.warface.ru/user/stat/?name=" + uName + "&server=" + numSrv;
                                                        let urlEnc = encodeURI(link);
                                                        var options = {url: urlEnc, method: 'GET', json: true, headers: {'User-Agent': 'request', 'Accept-Language' : 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'}, timeout: 10000};
                                                        //Запрос
                                                        request(options, function(err, res, data){
                                                            //Если ошибка
                                                            if (err) {
                                                                console.log('Error: ', err);
                                                                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                return;
                                                            }
                                                            //Если нет ответа запроса
                                                            if(!res) {
                                                                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Не получен ответ на запроса в течении 10 секунд.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                return;
                                                            } else {
                                                                //Если статус запроса 200
                                                                if (res.statusCode == 200) {
                                                                    //Нашли на Чарли
                                                                    if (IsJsonString(data) == true) {
                                                                        message.reply({ embeds: [EmbMsg(':bar_chart: Статистика по бойцу', 0x02A5D0 , parseApi(data, 3))]});
                                                                    }
                                                                } else {
                                                                    //Неверный запрос
                                                                    if (res.statusCode == 400) {
                                                                        //Не нашли даже на Чарли
                                                                        if (data.message == "Пользователь не найден"){
                                                                            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`На всех трёх игровых серверах такой __боец не найден__`)]});
                                                                        }
                                                                        //Чарли
                                                                        if (data.message == "Игрок скрыл свою статистику"){
                                                                            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Боец найден на сервере **${nameSrv}**\nНо его __статистика скрыта__`)]});
                                                                        }
                                                                        if (data.message == "Персонаж неактивен"){
                                                                            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Боец найден на сервере **${nameSrv}**\nНо его __персонаж неактивен__`)]});
                                                                        }
                                                                    }
                                                                    //Доступ запрещён || Страница не найдена || Внутренняя ошибка сервера
                                                                    if (res.statusCode == 403 || res.statusCode == 404 || res.statusCode == 500) {
                                                                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }
                                                    //Браво
                                                    if (data.message == "Игрок скрыл свою статистику"){
                                                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Боец найден на сервере **${nameSrv}**\nНо его __статистика скрыта__`)]});
                                                    }
                                                    if (data.message == "Персонаж неактивен"){
                                                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Боец найден на сервере **${nameSrv}**\nНо его __персонаж неактивен__`)]});
                                                    }
                                                }
                                                //Доступ запрещён || Страница не найдена || Внутренняя ошибка сервера
                                                if (res.statusCode == 403 || res.statusCode == 404 || res.statusCode == 500) {
                                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                }
                                            }
                                        }
                                        
                                    });
                                }
                                //Альфа
                                if (data.message == "Игрок скрыл свою статистику"){
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Боец найден на сервере **${nameSrv}**\nНо его __статистика скрыта__`)]});
                                }
                                if (data.message == "Персонаж неактивен"){
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Боец найден на сервере **${nameSrv}**\nНо его __персонаж неактивен__`)]});
                                }
                            }
                            //Доступ запрещён || Страница не найдена || Внутренняя ошибка сервера
                            if (res.statusCode == 403 || res.statusCode == 404 || res.statusCode == 500) {
                                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                            }
                        }
                    }
                });
            } else {
                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Указанный ник бойца должен быть **от 4 до 16 символов**`)]}).then(m => setTimeout(() => m.delete(), 20000));
                return;
            }
        }
        //Если указали где искать
        if(numArg === 3) {
            //Ник бойца + сервер
            let uName = args[0].toLowerCase();
            //Проверяем указанный ник
            if (uName.length >= 4 && uName.length <= 16) {
                let uSrv = args[1].toLowerCase();
                //Номер сервера + Название сервера
                let numSrv;
                let nameSrv;
                //Проверяем указанное название сервера
                if (uSrv == "альфа"){
                    numSrv = 1;
                    nameSrv = numSrvToStr(numSrv);
                } else if (uSrv == "браво"){
                    numSrv = 2;
                    nameSrv = numSrvToStr(numSrv);
                } else if (uSrv == "чарли"){
                    numSrv = 3;
                    nameSrv = numSrvToStr(numSrv);
                } else {
                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`**Неверно указан сервер.**\n\nДоступные варианты:\n\`Альфа Браво Чарли\``)]}).then(m => setTimeout(() => m.delete(), 20000));
                    return;
                }
                //Начинаем проверку на указанном сервере
                let link = "http://api.warface.ru/user/stat/?name=" + uName + "&server=" + numSrv;
                let urlEnc = encodeURI(link);
                var options = {url: urlEnc, method: 'GET', json: true, headers: {'User-Agent': 'request', 'Accept-Language' : 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'}, timeout: 10000};
                //Запрос
                request(options, function(err, res, data){
                    //Если ошибка
                    if (err) {
                        console.log('Error: ', err);
                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                        return;
                    }
                    //Если нет ответа запроса
                    if(!res) {
                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Не получен ответ на запроса в течении 10 секунд.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                        return;
                    } else {
                        //Если статус запроса 200
                        if (res.statusCode == 200) {
                            if (IsJsonString(data) == true) {
                                message.reply({ embeds: [EmbMsg(':bar_chart: Статистика по бойцу', 0x02A5D0 , parseApi(data, numSrv))]});
                            }
                        } else {
                            //Неверный запрос
                            if (res.statusCode == 400) {
                                if (data.message == "Пользователь не найден"){
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`На указанном сервере такой __боец не найден__`)]});
                                }
                                if (data.message == "Игрок скрыл свою статистику"){
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Боец найден на сервере **${nameSrv}**\nНо его __статистика скрыта__`)]});
                                }
                                if (data.message == "Персонаж неактивен"){
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Боец найден на сервере **${nameSrv}**\nНо его __персонаж неактивен__`)]});
                                }
                            }
                            //Доступ запрещён || Страница не найдена || Внутренняя ошибка сервера
                            if (res.statusCode == 403 || res.statusCode == 404 || res.statusCode == 500) {
                                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                            }
                        }
                    }
                });
            } else {
                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Указанный ник бойца должен быть **от 4 до 16 символов**`)]}).then(m => setTimeout(() => m.delete(), 20000));
            }
        }
    }

    /* Команда Клан */
    else if (command === "клан") {
        if(numArg === 2 && args[0] === "?") {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nПозволяет получить информацию о клане в ежемесячном рейтинге.\n\nЧтобы получить информацию о нашем клане, достаточно набрать команду\n\`\`\`${prefix}${command}\`\`\`\nЧтобы получить информацю по другому клану, укажите название клана и через пробел сервер на котором искать: **Альфа Браво Чарли**\n\nЕсли сервер не будет указан, то поиск будет производится на всех трёх серверах.\n\n**Пример набора команды**\n\`\`\`${prefix}${command} НазваниеКлана Сервер\`\`\``, 'https://i.imgur.com/fE7XPTZ.gif')]});
            return;
        }
        //парсинг данных с API
        function parseApi(info, srv) {
            var clInfo = "";
            var data = info[0];
            //Название клана
            clInfo += "**Название клана:**   ``" + data.clan + "``\n";
            //Игровой сервер
            clInfo += "**Сервер:**   ``" + numSrvToStr(srv) + "``\n";
            //Глава клана
            clInfo += "**Глава клана:**   ``" + data.clan_leader + "``\n";
            //Бойцов в клане
            clInfo += "**Бойцов в клане:**   ``" + data.members + "``\n";
            //Место клана -> число
            let numRank = parseInt(data.rank, 10);
            //Сервер Альфа
            if (srv === 1) {
                if (numRank <= 3000) {
                    //
                    if (numRank <= 10) {
                        clInfo += "**Лига:**   ``Элитная``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-1)+1) + "``\n";
                    }
                    if (numRank  > 10 && numRank <= 100) {
                        clInfo += "**Лига:**   ``Платиновая``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-10)+1) + "``\n";
                    }
                    if (numRank  > 100 && numRank <= 500) {
                        clInfo += "**��ига:**   ``Золотая``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-100)+1) + "``\n";
                    }
                    if (numRank  > 500 && numRank <= 1000) {
                        clInfo += "**Лига:**   ``Серебряная``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-500)+1) + "``\n";
                    }
                    if (numRank  > 1000 && numRank <= 2000) {
                        clInfo += "**Лига:**   ``Бронзовая``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-1000)+1) + "``\n";
                    }
                    if (numRank  > 2000 && numRank <= 3000) {
                        clInfo += "**Лига:**   ``Стальная``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-2000)+1) + "``\n";
                    }
                } else {
                    //Если нет лиги ещё
                    clInfo += "**Лига:**   ``Без лиги``\n";
                    clInfo += "**Место:**   ``" + numRank + "``\n";
                }
            }
            //Сервер Браво
            if (srv === 2) {
                if (numRank <= 2000) {
                    if (numRank <= 10) {
                        clInfo += "**Лига:**   ``Элитная``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-1)+1) + "``\n";
                    }
                    if (numRank  > 10 && numRank <= 100) {
                        clInfo += "**Лига:**   ``Платиновая``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-10)+1) + "``\n";
                    }
                    if (numRank  > 100 && numRank <= 500) {
                        clInfo += "**Лига:**   ``Золотая``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-100)+1) + "``\n";
                    }
                    if (numRank  > 500 && numRank <= 1000) {
                        clInfo += "**Лига:**   ``Серебряная``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-500)+1) + "``\n";
                    }
                    if (numRank  > 1000 && numRank <= 1500) {
                        clInfo += "**Лига:**   ``Бронзовая``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-1000)+1) + "``\n";
                    }
                    if (numRank  > 1500 && numRank <= 2000) {
                        clInfo += "**Лига:**   ``Стальная``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-1500)+1) + "``\n";
                    }
                } else {
                    //Если нет лиги ещё
                    clInfo += "**Лига:**   ``Без лиги``\n";
                    clInfo += "**Место:**   ``" + numRank + "``\n";
                }
            }
            //Сервер Чарли
            if (srv === 3) {
                if (numRank <= 1700) {
                    if (numRank <= 10) {
                        clInfo += "**Лига:**   ``Элитная``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-1)+1) + "``\n";
                    }
                    if (numRank  > 10 && numRank <= 70) {
                        clInfo += "**Лига:**   ``Платиновая``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-10)+1) + "``\n";
                    }
                    if (numRank  > 70 && numRank <= 400) {
                        clInfo += "**Лига:**   ``Золотая``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-70)+1) + "``\n";
                    }
                    if (numRank  > 400 && numRank <= 700) {
                        clInfo += "**Лига:**   ``Серебряная``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-400)+1) + "``\n";
                    }
                    if (numRank  > 700 && numRank <= 1200) {
                        clInfo += "**Лига:**   ``Бронзовая``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-700)+1) + "``\n";
                    }
                    if (numRank  > 1200 && numRank <= 1700) {
                        clInfo += "**Лига:**   ``Стальная``\n";
                        clInfo += "**Место в лиге:**   ``" + ((numRank-1200)+1) + "``\n";
                    }
                } else {
                    //Если нет лиги ещё
                    clInfo += "**Лига:**   ``Без лиги``\n";
                    clInfo += "**Место:**   ``" + numRank + "``\n";
                }
                
            }
            //Изменение места
            clInfo += "**Изменение места:**   ``" + data.rank_change + "``\n";
            //Очков за месяц
            clInfo += "**Очков за месяц:**   ``" + data.points + "``\n";

            //Выводим
            return clInfo;
        }

        //Если указали только название команды
        if(numArg === 1) {
            //Преобразуем номер сервера в число
            let numClSv = parseInt(clSr, 10);
            if (clNm != '' && numClSv != '') {
                //Типо указаны переменные
                //Проверяем название сервера
                if (clNm.length >= 4 && clNm.length <= 16) {
                    //Название клана в порядке
                    //Проверяем сервер - число или нет
                    if (!isNaN(numClSv)) {
                        //Сервер указан числом
                        if (numClSv > 0 && numClSv < 4) {
                            //Сервер указан числом от 1 до 3
                            let link = "http://api.warface.ru/rating/monthly?server="+ numClSv + "&clan=" + clNm;
                            let urlEnc = encodeURI(link);
                            var options = {url: urlEnc, method: 'GET', json: true, headers: {'User-Agent': 'request', 'Accept-Language' : 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'}, timeout: 10000};
                            //Запрос
                            request(options, function(error, response, body){
                                //Если возникла ошибка
                                if (error) {
                                    console.log(error);
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                    return;
                                } else {
                                    //Если есть ответ
                                    if (response) {
                                        //Если статус запроса 200
                                        if (response.statusCode == 200) {
                                            if (IsJsonString(body) == true) {
                                                //Нашли на указанном сервере + данные в формате JSON
                                                //Фильтруем от других кланов
                                                var clan = body.filter(function(c){
                                                    return (c.clan === clNm);
                                                });
                                                message.reply({ embeds: [EmbMsg(':crossed_swords: Ежемесячный рейтинг клана', 0xFFF100 , parseApi(clan, numClSv))]});
                                                return;
                                            } else {
                                                //Ошибка - не JSON
                                                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла ошибка в данных.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                return;
                                            }
                                        } else {
                                            //Неверный запрос
                                            if (response.statusCode == 400) {
                                                if (IsJsonString(body) == true) {
                                                    //Что-то не так, но данные формата JSON
                                                    if (body.message === "Клан не найден") {
                                                        //Если не нашли клан
                                                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, 'Наш клан __не найден__')]}).then(m => setTimeout(() => m.delete(), 20000));
                                                        return;
                                                    }
                                                    if (body.message === "Ваш клан еще не набирал очков в этом месяце") {
                                                        //Если нет очков
                                                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, 'Наш клан еще __не набирал очков__ в этом месяце')]}).then(m => setTimeout(() => m.delete(), 20000));
                                                        return;
                                                    }
                                                } else {
                                                    //Ошибка - формат данных не JSON
                                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0xFFF100,`Произошла ошибка в данных.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                    return;
                                                }
                                            }
                                            //Доступ запрещён || Страница не найдена || Внутренняя ошибка сервера
                                            if (response.statusCode == 403 || response.statusCode == 404 || response.statusCode == 500) {
                                                //Ошибка сервера 403+404+500
                                                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                return;
                                            }
                                        }
                                    } else {
                                        //Нет данных ответа сервера
                                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                        return;
                                    }
                                }
                            });
                        } else {
                            //Сервер указан числом, но не от 1 до 3
                            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Укажите через пробел название клана, которого будите искать.\nТак же можно указать сервер через пробел.\n\nПример: \`${prefix}клан НазваниеКлана Альфа\``)]}).then(m => setTimeout(() => m.delete(), 20000));
                            return;
                        }
                    } else {
                        //Сервер указан не числом
                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Укажите через пробел название клана, которого будите искать.\nТак же можно указать сервер через пробел.\n\nПример: \`${prefix}клан НазваниеКлана Альфа\``)]}).then(m => setTimeout(() => m.delete(), 20000));
                        return;
                    }
                } else {
                    //Название клана не в порядке
                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Укажите через пробел название клана, которого будите искать.\nТак же можно указать сервер через пробел.\n\nПример: \`${prefix}клан НазваниеКлана Альфа\``)]}).then(m => setTimeout(() => m.delete(), 20000));
                    return;
                }
            } else {
                //Не указаны переменные
                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Укажите через пробел название клана, которого будите искать.\nТак же можно указать сервер через пробел.\n\nПример: \`${prefix}клан НазваниеКлана Альфа\``)]}).then(m => setTimeout(() => m.delete(), 20000));
                return;
            }
        }
        //Если не указали где искать
        if(numArg === 2) {
            //Клан
            let cName = args[0].toLowerCase();
            //Проверяем название сервера
            if (cName.length >= 4 && cName.length <= 16) {
                //Название клана в порядке
                //Номер сервера, с которого начинаем поиск
                let SrvNum = 1;
                //Формируем данные для запроса
                let link = "http://api.warface.ru/rating/monthly?server="+ SrvNum + "&clan=" + cName;
                let urlEnc = encodeURI(link);
                var options = {url: urlEnc, method: 'GET', json: true, headers: {'User-Agent': 'request', 'Accept-Language' : 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'}, timeout: 10000};
                //Запрос
                request(options, function(error, response, body){
                    //Если возникла ошибка
                    if (error) {
                        console.log(error);
                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                        return;
                    } else {
                        //Если есть ответ
                        if (response) {
                            //Если статус запроса 200
                            if (response.statusCode == 200) {
                                if (IsJsonString(body) == true) {
                                    //Нашли на указанном сервере + данные в формате JSON
                                    //Фильтруем от других кланов
                                    var clan = body.filter(function(c){
                                        return (c.clan.toLowerCase() === cName);
                                    });
                                    message.reply({ embeds: [EmbMsg(':crossed_swords: Ежемесячный рейтинг клана', 0xFFF100 , parseApi(clan, SrvNum))]});
                                    return;
                                } else {
                                    //Ошибка - не JSON
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла ошибка в данных.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                    return;
                                }
                            } else {
                                //Неверный запрос
                                if (response.statusCode == 400) {
                                    if (IsJsonString(body) == true) {
                                        //Что-то не так, но данные формата JSON
                                        if (body.message === "Клан не найден") {
                                            //Если не нашли на Альфе, то ищем на Браво
                                            SrvNum = 2;
                                            //Формируем данные для запроса
                                            let link = "http://api.warface.ru/rating/monthly?server="+ SrvNum + "&clan=" + cName;
                                            let urlEnc = encodeURI(link);
                                            var options = {url: urlEnc, method: 'GET', json: true, headers: {'User-Agent': 'request', 'Accept-Language' : 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'}, timeout: 10000};
                                            //Запрос
                                            request(options, function(error, response, body){
                                                //Если возникла ошибка
                                                if (error) {
                                                    console.log(error);
                                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                    return;
                                                } else {
                                                    //Если есть ответ
                                                    if (response) {
                                                        //Если статус запроса 200
                                                        if (response.statusCode == 200) {
                                                            if (IsJsonString(body) == true) {
                                                                //Нашли на указанном сервере + данные в формате JSON
                                                                //Фильтруем от других кланов
                                                                var clan = body.filter(function(c){
                                                                    return (c.clan.toLowerCase() === cName);
                                                                });
                                                                message.reply({ embeds: [EmbMsg(':crossed_swords: Ежемесячный рейтинг клана', 0xFFF100 , parseApi(clan, SrvNum))]});
                                                                return;
                                                            } else {
                                                                //Ошибка - не JSON
                                                                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла ошибка в данных.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                return;
                                                            }
                                                        } else {
                                                            //Неверный запрос
                                                            if (response.statusCode == 400) {
                                                                if (IsJsonString(body) == true) {
                                                                    //Что-то не так, но данные формата JSON
                                                                    if (body.message === "Клан не найден") {
                                                                        //Если не нашли на Браво, то ищем на Чарли
                                                                        SrvNum = 3;
                                                                        //Формируем данные для запроса
                                                                        let link = "http://api.warface.ru/rating/monthly?server="+ SrvNum + "&clan=" + cName;
                                                                        let urlEnc = encodeURI(link);
                                                                        var options = {url: urlEnc, method: 'GET', json: true, headers: {'User-Agent': 'request', 'Accept-Language' : 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'}, timeout: 10000};
                                                                        //Запрос
                                                                        request(options, function(error, response, body){
                                                                            //Если возникла ошибка
                                                                            if (error) {
                                                                                console.log(error);
                                                                                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                                return;
                                                                            } else {
                                                                                //Если есть ответ
                                                                                if (response) {
                                                                                    //Если статус запроса 200
                                                                                    if (response.statusCode == 200) {
                                                                                        if (IsJsonString(body) == true) {
                                                                                            //Нашли на указанном сервере + данные в формате JSON
                                                                                            //Фильтруем от других кланов
                                                                                            var clan = body.filter(function(c){
                                                                                                return (c.clan.toLowerCase() === cName);
                                                                                            });
                                                                                            message.reply({ embeds: [EmbMsg(':crossed_swords: Ежемесячный рейтинг клана', 0xFFF100 , parseApi(clan, SrvNum))]});
                                                                                            return;
                                                                                        } else {
                                                                                            //Ошибка - не JSON
                                                                                            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла ошибка в данных.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                                            return;
                                                                                        }
                                                                                    } else {
                                                                                        //Неверный запрос
                                                                                        if (response.statusCode == 400) {
                                                                                            if (IsJsonString(body) == true) {
                                                                                                //Что-то не так, но данные формата JSON
                                                                                                if (body.message === "Клан не найден") {
                                                                                                    //Если не нашли клан
                                                                                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, 'На всех трёх серверах такой клан __не найден__')]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                                                    return;
                                                                                                }
                                                                                                if (body.message === "Ваш клан еще не набирал очков в этом месяце") {
                                                                                                    //Если нет очков
                                                                                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, 'Клан найден на сервере **'+ numSrvToStr(SrvNum) + '**\nНо еще __не набирал очков__ в этом месяце')]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                                                    return;
                                                                                                }
                                                                                            } else {
                                                                                                //Чарли - Ошибка - формат данных не JSON
                                                                                                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0xFFF100,`Произошла ошибка в данных.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                                                return;
                                                                                            }
                                                                                        }
                                                                                        //Чарли - Доступ запрещён || Страница не найдена || Внутренняя ошибка сервера
                                                                                        if (response.statusCode == 403 || response.statusCode == 404 || response.statusCode == 500) {
                                                                                            //Ошибка сервера 403+404+500
                                                                                            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                                            return;
                                                                                        }
                                                                                    }
                                                                                } else {
                                                                                    //Чарли - Нет данных ответа сервера
                                                                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                                    return;
                                                                                }
                                                                            }
                                                                        });
                                                                    }
                                                                    //Браво
                                                                    if (body.message === "Ваш клан еще не набирал очков в этом месяце") {
                                                                        //Если нет очков
                                                                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, 'Клан найден на сервере **'+ numSrvToStr(SrvNum) + '**\nНо еще __не набирал очков__ в этом месяце')]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                        return;
                                                                    }
                                                                } else {
                                                                    //Браво - Ошибка - формат данных не JSON
                                                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0xFFF100,`Произошла ошибка в данных.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                    return;
                                                                }
                                                            }
                                                            //Браво - Доступ запрещён || Страница не найдена || Внутренняя ошибка сервера
                                                            if (response.statusCode == 403 || response.statusCode == 404 || response.statusCode == 500) {
                                                                //Ошибка сервера 403+404+500
                                                                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                                return;
                                                            }
                                                        }
                                                    } else {
                                                        //Браво - Нет данных ответа сервера
                                                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                                        return;
                                                    }
                                                }
                                            });
                                        }
                                        //Альфа
                                        if (body.message === "Ваш клан еще не набирал очков в этом месяце") {
                                            //Если нет очков
                                            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, 'Клан найден на сервере **'+ numSrvToStr(SrvNum) + '**\nНо еще __не набирал очков__ в этом месяце')]}).then(m => setTimeout(() => m.delete(), 20000));
                                            return;
                                        }
                                    } else {
                                        //Альфа - Ошибка - формат данных не JSON
                                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0xFFF100,`Произошла ошибка в данных.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                        return;
                                    }
                                }
                                //Альфа - Доступ запрещён || Страница не найдена || Внутренняя ошибка сервера
                                if (response.statusCode == 403 || response.statusCode == 404 || response.statusCode == 500) {
                                    //Ошибка сервера 403+404+500
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                    return;
                                }
                            }
                        } else {
                            //Альфа - Нет данных ответа сервера
                            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                            return;
                        }
                    }
                });
            } else {
                //Название клана не в порядке
                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `В указанном названии клана допущена ошибка.\n\nНазвание клана должено быть **от 4 до 16 символов**.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                return;
            }
        }
        //Если указали где искать
        if(numArg === 3) {
            //Клан
            let cName = args[0].toLowerCase();
            //Проверяем название сервера
            if (cName.length >= 4 && cName.length <= 16) {
                //Название клана в порядке
                //Укзанный сервер
                let cSrv = args[1].toLowerCase();
                //Номер сервера + Название сервера
                let numSrv;
                let nameSrv;
                //Проверяем указанное название сервера
                if (cSrv == "альфа"){
                    numSrv = 1;
                    nameSrv = numSrvToStr(numSrv);
                } else if (cSrv == "браво"){
                    numSrv = 2;
                    nameSrv = numSrvToStr(numSrv);
                } else if (cSrv == "чарли"){
                    numSrv = 3;
                    nameSrv = numSrvToStr(numSrv);
                } else {
                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `**Неверно указан сервер.**\n\nДоступные варианты:\n\`Альфа Браво Чарли\``)]}).then(m => setTimeout(() => m.delete(), 20000));
                    return;
                }
                //Формируем данные для запроса
                let link = "http://api.warface.ru/rating/monthly?server="+ numSrv + "&clan=" + cName;
                let urlEnc = encodeURI(link);
                var options = {url: urlEnc, method: 'GET', json: true, headers: {'User-Agent': 'request', 'Accept-Language' : 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'}, timeout: 10000};
                //Запрос
                request(options, function(error, response, body){
                    //Если возникла ошибка
                    if (error) {
                        console.log(error);
                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                        return;
                    } else {
                        //Если есть ответ
                        if (response) {
                            //Если статус запроса 200
                            if (response.statusCode == 200) {
                                if (IsJsonString(body) == true) {
                                    //Нашли на указанном сервере + данные в формате JSON
                                    //Фильтруем от других кланов
                                    var clan = body.filter(function(c){
                                        return (c.clan.toLowerCase() === cName);
                                    });
                                    message.reply({ embeds: [EmbMsg(':crossed_swords: Ежемесячный рейтинг клана', 0xFFF100 , parseApi(clan, numSrv))]});
                                    return;
                                } else {
                                    //Ошибка - не JSON
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла ошибка в данных.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                    return;
                                }
                            } else {
                                //Неверный запрос
                                if (response.statusCode == 400) {
                                    if (IsJsonString(body) == true) {
                                        //Что-то не так, но данные формата JSON
                                        if (body.message === "Клан не найден") {
                                            //Если не нашли клан
                                            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, 'На указанном сервере такой клан __не найден__')]}).then(m => setTimeout(() => m.delete(), 20000));
                                            return;
                                        }
                                        if (body.message === "Ваш клан еще не набирал очков в этом месяце") {
                                            //Если нет очков
                                            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, 'Клан найден на сервере **'+ nameSrv + '**\nНо еще __не набирал очков__ в этом месяце')]}).then(m => setTimeout(() => m.delete(), 20000));
                                            return;
                                        }
                                    } else {
                                        //Ошибка - формат данных не JSON
                                        message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0xFFF100,`Произошла ошибка в данных.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                        return;
                                    }
                                }
                                //Доступ запрещён || Страница не найдена || Внутренняя ошибка сервера
                                if (response.statusCode == 403 || response.statusCode == 404 || response.statusCode == 500) {
                                    //Ошибка сервера 403+404+500
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                                    return;
                                }
                            }
                        } else {
                            //Нет данных ответа сервера
                            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                            return;
                        }
                    }
                });
            } else {
                //Название клана не в порядке
                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `В указанном названии клана допущена ошибка.\n\nНазвание клана должено быть **от 4 до 16 символов**.`)]}).then(m => setTimeout(() => m.delete(), 20000));
                return;
            }
        }
        //Если указали много параметров
        if(numArg > 3) {
            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Укажите через пробел название клана, которого будите искать.\nТак же можно указать сервер через пробел.\n\nПример: \`${prefix}клан НазваниеКлана Альфа\``)]}).then(m => setTimeout(() => m.delete(), 20000));
            return;
        }
    }

    /* Команда гороскоп */
    else if (command === "гороскоп") {
        if(numArg === 2 && args[0] === "?") {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nПозволяет получить гороскоп на сегодня по указанному знаку зодиака.\n\nЧтобы получить прогноз, достаточно набрать команду **${prefix}${command}**\n\nДалее дождаться появления 12ти реакций к сообщению. Нажать на соответствующий знак-реакцию. После чего в текущем сообщении появится прогноз.\n\n**Пример набора команды**\n\`\`\`${prefix}${command}\`\`\``, 'https://i.imgur.com/pgOEsWn.gif')]});
            return;
        }
        //Фильтр для реакций
        const filter = (reaction, user) => {
            return ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].includes(reaction.emoji.name) && user.id === message.author.id;
        };
        //Отправляем сообщение для выбора зодиака
        message.reply({ embeds: [EmbMsg(':star: Гороскоп :star:', 0xE98B14, `Укажите знак задиака, нажав на соответсвующую реакцию под данным сообщением.\n\n♈ - Овен\n♉ - Телец\n♊ - Близнецы\n♋ - Рак\n♌ - Лев\n♍ - Дева\n♎ - Весы\n♏ - Скорпион\n♐ - Стрелец\n♑ - Козерог\n♒ - Водолей\n♓ - Рыбы\n\nДождитесь появления всех 12 реакций\n\n`)]})
        .then(msg => {
            //Выставляем реакции к сообщению
            msg.react('♈')
            msg.react('♉')
            msg.react('♊')
            msg.react('♋')
            msg.react('♌')
            msg.react('♍')
            msg.react('♎')
            msg.react('♏')
            msg.react('♐')
            msg.react('♑')
            msg.react('♒')
            msg.react('♓')
            //Ожидание реакции от пользователя
            msg.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] })
            .then((collected) => {
                const reaction = collected.first();
                //Название знака
                var znak = "", nameznak = "";
                //Проверяем что было выбрано
                if (reaction.emoji.name === '♈') {
                    znak = "aries";
                    nameznak = "Овен";
                }
                if (reaction.emoji.name === '♉') {
                    znak = "taurus";
                    nameznak = "Телец";
                }
                if (reaction.emoji.name === '♊') {
                    znak = "gemini";
                    nameznak = "Близнецы";
                }
                if (reaction.emoji.name === '♋') {
                    znak = "cancer";
                    nameznak = "Рак";
                }
                if (reaction.emoji.name === '♌') {
                    znak = "leo";
                    nameznak = "Лев";
                }
                if (reaction.emoji.name === '♍') {
                    znak = "virgo";
                    nameznak = "Дева";
                }
                if (reaction.emoji.name === '♎') {
                    znak = "libra";
                    nameznak = "Весы";
                }
                if (reaction.emoji.name === '♏') {
                    znak = "scorpio";
                    nameznak = "Скорпион";
                }
                if (reaction.emoji.name === '♐') {
                    znak = "sagittarius";
                    nameznak = "Стрелец";
                }
                if (reaction.emoji.name === '♑') {
                    znak = "capricorn";
                    nameznak = "Козерог";
                }
                if (reaction.emoji.name === '♒') {
                    znak = "aquarius";
                    nameznak = "Водолей";
                }
                if (reaction.emoji.name === '♓') {
                    znak = "pisces";
                    nameznak = "Рыбы";
                }

                //Удаляем реакции после выбора из текстового канала
                if (privateMsg() == false){
                    msg.reactions.removeAll().catch(error => console.error('Ошибка при очистке реакций: ', error));
                }
                
                //Получаем сам гороскоп
                var horo = "";
                let link = "https://horoscopes.rambler.ru/api/front/v1/horoscope/today/" + znak;
                let urlEnc = encodeURI(link);
                var options = {url: urlEnc, method: 'GET', json: true, headers: {'User-Agent': 'request', 'Accept-Language' : 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'}, timeout: 10000};
                //Запрос
                request(options, function(error, response, body){
                    //Если возникла ошибка
                    if (error) {
                        console.log(error);
                        //Изменяем Embed сообщение
                        horo = { embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xE98B14, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`).then(m => setTimeout(() => m.delete(), 10000))]};
                        msg.edit(horo);
                        return;
                    } else {
                        //Если есть ответ
                        if (response) {
                            //Если статус запроса 200
                            if (response.statusCode == 200) {
                                if (IsJsonString(body) == true) {
                                    var regex = /(<([^>]+)>)/ig;
                                    var bodytext = body.text;
                                    var texthoro = bodytext.replace(regex, "");
                                    //Изменяем Embed сообщение
                                    horo = { embeds: [EmbMsg(':star: Гороскоп :star:', 0xE98B14, `Гороскоп на сегодня для знака **${nameznak}**\n\n>>> ${texthoro}\n\n`)]};
                                    msg.edit(horo);
                                    return;
                                } else {
                                    //Ошибка - не JSON
                                    horo = { embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xE98B14, `Произошла ошибка в данных.\nПопробуйте отправить команду позже.`).then(m => setTimeout(() => m.delete(), 10000))]};
                                    msg.edit(horo);
                                    return;
                                }
                            } else {
                                //Неверный запрос || Доступ запрещён || Страница не найдена || Внутренняя ошибка сервера
                                if (response.statusCode == 400 || response.statusCode == 403 || response.statusCode == 404 || response.statusCode == 500) {
                                    horo = { embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xE98B14, `Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`).then(m => setTimeout(() => m.delete(), 10000))]};
                                    msg.edit(horo);
                                    return;
                                }
                            }
                        } else {
                            //Нет данных ответа сервера
                            horo = { embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xE98B14, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`).then(m => setTimeout(() => m.delete(), 10000))]};
                            msg.edit(horo);
                            return;
                        }
                    }
                });
            })
            .catch((collected) => {
                var infonoch = { embeds: [EmbMsg(':star: Гороскоп :star:', 0xE98B14, `Вы не выбрали знак зодиака.\nСообщение будет удалено автоматически.\n`)]};
                //Удаляем реакции после выбора из текстового канала
                if (privateMsg() == false){
                    msg.reactions.removeAll().catch(error => console.error('Ошибка при очистке реакций: ', error));
                }
                //Изменяем сообщение и удаляем
                msg.edit(infonoch).then(m => setTimeout(() => m.delete(), 10000));
            })
        });
    }
















});




//авторизация
client.login(token);
