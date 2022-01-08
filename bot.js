const { Client, Intents, MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton, CommandInteraction, Collection } = require('discord.js');
var request = require('request');
//Токен
const token = process.env.BOT_TOKEN;
//Префикс для команд
const prefix = process.env.PREFIX;
//ID канала, куда слать системные сообщения
const idChMsg = process.env.ID_CHANNEL_SEND;
//ID сервера
const idSrv = process.env.ID_SERVER;
//ID роли бота
const idRoleBot = process.env.ID_ROLE_BOT;
//Название клана
const clNm = process.env.CLAN_NAME;
//ID ролей (Администраторов и Модераторов)
const idAdmMod = process.env.ID_ADM_MOD_ROLE;
//Время старта бота
const startBot = Date.now();


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING, Intents.FLAGS.GUILD_VOICE_STATES],partials: ['USER', 'MESSAGE', 'CHANNEL', 'REACTION'] });


//Заготовка для Embed сообщения (обычное)
function EmbMsg(title, color, descr){
    let embed = new MessageEmbed()
    .setTitle(title)
    .setColor(color)
    .setDescription(descr)
    //.setAuthor({ name: 'Бот клана', iconURL: 'https://i.imgur.com/nyTAfzh.png'})
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
    //.setAuthor({ name: 'Бот клана', iconURL: 'https://i.imgur.com/nyTAfzh.png'})
    .setTimestamp()
    return embed;
}

//Заготовка для Embed сообщения (информационные сообщения)
function EmbedMsg(color, Descr){
    let embed = new MessageEmbed()
    .setColor(color)
    .setDescription(Descr)
    //.setAuthor({ name: 'Бот клана', iconURL: 'https://i.imgur.com/nyTAfzh.png'})
    .setTimestamp()
    return embed;
}

//Заготовка для Кнопки-ссылки
function MsgLink(link,linkdesc){
    let linkButton = new MessageActionRow()
    .addComponents(
        new MessageButton()
        .setLabel(linkdesc)
        .setURL(link)
        .setStyle('LINK')
        );
    return linkButton;
}

//Список для гороскопа
function listForHoro(CustId){
    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId(CustId)
                .setPlaceholder('Выберите знак зодиака')
                .addOptions([
                    {
                        label: 'Овен',
                        description: 'Прогноз для знака - Овен',
                        value: 'aries',
                        emoji: '♈',
                    },
                    {
                        label: 'Телец',
                        description: 'Прогноз для знака - Телец',
                        value: 'taurus',
                        emoji: '♉',
                    },
                    {
                        label: 'Близнецы',
                        description: 'Прогноз для знака - Близнецы',
                        value: 'gemini',
                        emoji: '♊',
                    },
                    {
                        label: 'Рак',
                        description: 'Прогноз для знака - Рак',
                        value: 'cancer',
                        emoji: '♋',
                    },
                    {
                        label: 'Лев',
                        description: 'Прогноз для знака - Лев',
                        value: 'leo',
                        emoji: '♌',
                    },
                    {
                        label: 'Дева',
                        description: 'Прогноз для знака - Дева',
                        value: 'virgo',
                        emoji: '♍',
                    },
                    {
                        label: 'Весы',
                        description: 'Прогноз для знака - Весы',
                        value: 'libra',
                        emoji: '♎',
                    },
                    {
                        label: 'Скорпион',
                        description: 'Прогноз для знака - Скорпион',
                        value: 'scorpio',
                        emoji: '♏',
                    },
                    {
                        label: 'Стрелец',
                        description: 'Прогноз для знака - Стрелец',
                        value: 'sagittarius',
                        emoji: '♐',
                    },
                    {
                        label: 'Козерог',
                        description: 'Прогноз для знака - Козерог',
                        value: 'capricorn',
                        emoji: '♑',
                    },
                    {
                        label: 'Водолей',
                        description: 'Прогноз для знака - Водолей',
                        value: 'aquarius',
                        emoji: '♒',
                    },
                    {
                        label: 'Рыбы',
                        description: 'Прогноз для знака - Рыбы',
                        value: 'pisces',
                        emoji: '♓',
                    },
                ]),
        );
    return row;
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

//парсинг данных с API
function parseApi(info) {
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

//----------------------------------------
//Список команд
function funcCommands(authorRole, command, typeMsg){
    //authorRole = 0-Владелец сервера, 1-Админы и модераторы (из idAdmMod), 2-Прочие пользователи
    //command = название команды из чата
    //typeMsg = 0-Текстовый чат, 1-slash команда
    const prefixSlash = "\/";
    //Команды владельца сервера
    if (authorRole == 0) {
        //Текстовый чат
        if (typeMsg == 0) {
            return EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\n**\`${prefix}команды\`** отобразить список всех доступных команд\n**\`${prefix}боец\`** получить игровую статистику о бойце\n**\`${prefix}клан\`** получить информацию о ежемесячном рейтинге клана\n**\`${prefix}бот\`** получить информацию о данном боте\n**\`${prefix}вк\`** получить ссылку на группу клана в VK\n**\`${prefix}монетка\`** случайный результат подброса монетки\n**\`${prefix}гороскоп\`** Позволяет получить гороскоп на сегодня по указанному знаку зодиака\n\n**\`${prefix}rs\`** перезагрузить бота\n**\`${prefix}ping\`** узнать время генерации сообщения\n**\`${prefix}удалить\`** позволяет удалить N-количество сообщений в текстовом канале\n**\`${prefix}кик\`** позволяет выгналь пользователя с сервера\n**\`${prefix}бан\`** позволяет забанить пользователя на сервере\n\n:warning: Получить подробную справку о любой команде можно добавив через пробел вопросительный знак.\n**Пример набора команды**\n\`\`\`${prefix}${command} ?\`\`\``);
        }
        //slash команда
        if (typeMsg == 1) {
            //return EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\n**\`${prefixSlash}команды\`** отобразить список всех доступных команд\n**\`${prefixSlash}боец\`** получить игровую статистику о бойце\n**\`${prefixSlash}клан\`** получить информацию о ежемесячном рейтинге клана\n**\`${prefixSlash}бот\`** получить информацию о данном боте\n**\`${prefixSlash}вк\`** получить ссылку на группу клана в VK\n**\`${prefixSlash}монетка\`** случайный результат подброса монетки\n**\`${prefixSlash}гороскоп\`** Позволяет получить гороскоп на сегодня по указанному знаку зодиака\n\n**\`${prefixSlash}rs\`** перезагрузить бота\n**\`${prefixSlash}ping\`** узнать время генерации сообщения\n**\`${prefixSlash}удалить\`** позволяет удалить N-количество сообщений в текстовом канале\n**\`${prefixSlash}кик\`** позволяет выгналь пользователя с сервера\n**\`${prefixSlash}бан\`** позволяет забанить пользователя на сервере\n\n:warning: Получить подробную справку о любой команде можно добавив через пробел вопросительный знак.\n**Пример набора команды**\n\`\`\`${prefixSlash}${command} ?\`\`\``);
            return EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\nslash-команды владельца\nБудут добавлены позже...`);
        }
    }
    //Команды админов и модераторов (из idAdmMod)
    if (authorRole == 1) {
        //Текстовый чат
        if (typeMsg == 0) {
            return EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\n**\`${prefix}команды\`** отобразить список всех доступных команд\n**\`${prefix}боец\`** получить игровую статистику о бойце\n**\`${prefix}клан\`** получить информацию о ежемесячном рейтинге клана\n**\`${prefix}бот\`** получить информацию о данном боте\n**\`${prefix}вк\`** получить ссылку на группу клана в VK\n**\`${prefix}монетка\`** случайный результат подброса монетки\n**\`${prefix}гороскоп\`** Позволяет получить гороскоп на сегодня по указанному знаку зодиака\n\n**\`${prefix}кик\`** позволяет выгналь пользователя с сервера\n**\`${prefix}бан\`** позволяет забанить пользователя на сервере\n\n:warning: Получить подробную справку о любой команде можно добавив через пробел вопросительный знак.\n**Пример набора команды**\n\`\`\`${prefix}${command} ?\`\`\``);
            
        }
        //slash команда
        if (typeMsg == 1) {
            //return EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\n**\`${prefixSlash}команды\`** отобразить список всех доступных команд\n**\`${prefixSlash}боец\`** получить игровую статистику о бойце\n**\`${prefixSlash}клан\`** получить информацию о ежемесячном рейтинге клана\n**\`${prefixSlash}бот\`** получить информацию о данном боте\n**\`${prefixSlash}вк\`** получить ссылку на группу клана в VK\n**\`${prefixSlash}монетка\`** случайный результат подброса монетки\n**\`${prefixSlash}гороскоп\`** Позволяет получить гороскоп на сегодня по указанному знаку зодиака\n\n**\`${prefixSlash}кик\`** позволяет выгналь пользователя с сервера\n**\`${prefixSlash}бан\`** позволяет забанить пользователя на сервере\n\n:warning: Получить подробную справку о любой команде можно добавив через пробел вопросительный знак.\n**Пример набора команды**\n\`\`\`${prefixSlash}${command} ?\`\`\``);
            return EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\nslash-команды админа и модератора\nБудут добавлены позже...`);
        }
    }
    //Команды прочие пользователи
    if (authorRole == 2) {
        //Текстовый чат
        if (typeMsg == 0) {
            return EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\n**\`${prefix}команды\`** отобразить список всех доступных команд\n**\`${prefix}боец\`** получить игровую статистику о бойце\n**\`${prefix}клан\`** получить информацию о ежемесячном рейтинге клана\n**\`${prefix}бот\`** получить информацию о данном боте\n**\`${prefix}вк\`** получить ссылку на группу клана в VK\n**\`${prefix}монетка\`** случайный результат подброса монетки\n**\`${prefix}гороскоп\`** Позволяет получить гороскоп на сегодня по указанному знаку зодиака\n\n:warning: Получить подробную справку о любой команде можно добавив через пробел вопросительный знак.\n**Пример набора команды**\n\`\`\`${prefix}${command} ?\`\`\``);
        }
        //slash команда
        if (typeMsg == 1) {
            //return EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\n**\`${prefixSlash}команды\`** отобразить список всех доступных команд\n**\`${prefixSlash}боец\`** получить игровую статистику о бойце\n**\`${prefixSlash}клан\`** получить информацию о ежемесячном рейтинге клана\n**\`${prefixSlash}бот\`** получить информацию о данном боте\n**\`${prefixSlash}вк\`** получить ссылку на группу клана в VK\n**\`${prefixSlash}монетка\`** случайный результат подброса монетки\n**\`${prefixSlash}гороскоп\`** Позволяет получить гороскоп на сегодня по указанному знаку зодиака\n\n:warning: Получить подробную справку о любой команде можно добавив через пробел вопросительный знак.\n**Пример набора команды**\n\`\`\`${prefixSlash}${command} ?\`\`\``);
            return EmbMsg(':information_source: СПИСОК КОМАНД',0x7ED321,`\nslash-команды пользователя\nБудут добавлены позже...`);
        }
    }
}

//ВК
function funcVk(){
    return EmbMsg(':thumbsup: Группа клана', 0x2B71FF, `\nВступайте в нашу группу в социальной сети ВКонтакте:\n[Наша группа в ВК](https://vk.com/wf_rsd)`);
}

//Монетка
function funcMonetka(){
    //Вычисляем случайное число от 1 до 3
    var random = Math.floor(Math.random() * 3) + 1;
    if (random === 1) {
        //Если число = 1, то выпадает орёл.
        return ':full_moon: Орёл!';
    } else if (random === 2) { 
        //Если число = 2, то выпадает решка.
        return ':new_moon: Решка!';
    } else if (random === 3) { 
        //Если число = 3, то монета падает ребром.
        return ':last_quarter_moon: Монета упала ребром!';
    }
}

//О боте
function funcAboutBot(){
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

    return EmbMsg(':robot: О БОТЕ', 0x82E9FF, `\n**Версия бота: **${json.version}\n**Автор бота:** <@${autorID}>\n\n**Работает в сети:**\n${msToTime(timeOnline)}\n\n**Пользователей на сервере: **${memCount}`);
}

//Гороскоп
async function funcHoro(znakZ, tMsg){
    return new Promise(function(resolve) {
        //Название знака
        var nameznak = "";
        if (znakZ === 'aries') {
            nameznak = "Овен";
        }
        if (znakZ === 'taurus') {
            nameznak = "Телец";
        }
        if (znakZ === 'gemini') {
            nameznak = "Близнецы";
        }
        if (znakZ === 'cancer') {
            nameznak = "Рак";
        }
        if (znakZ === 'leo') {
            nameznak = "Лев";
        }
        if (znakZ === 'virgo') {
            nameznak = "Дева";
        }
        if (znakZ === 'libra') {
            nameznak = "Весы";
        }
        if (znakZ === 'scorpio') {
            nameznak = "Скорпион";
        }
        if (znakZ === 'sagittarius') {
            nameznak = "Стрелец";
        }
        if (znakZ === 'capricorn') {
            nameznak = "Козерог";
        }
        if (znakZ === 'aquarius') {
            nameznak = "Водолей";
        }
        if (znakZ === 'pisces') {
            nameznak = "Рыбы";
        }

        //Получаем сам гороскоп
        let link = "https://horoscopes.rambler.ru/api/front/v1/horoscope/today/" + znakZ;
        let urlEnc = encodeURI(link);
        var options = {url: urlEnc, method: 'GET', json: true, headers: {'User-Agent': 'request', 'Accept-Language' : 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'}, timeout: 10000};
        //Запрос
        request(options, function(error, response, body){
            //Если возникла ошибка
            if (error) {
                console.log('err get horo: ', error);
                resolve(EmbMsg(':no_entry_sign: Ошибка', 0xE98B14, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`));
            } else {
                //Если есть ответ
                if (response) {
                    //Если статус запроса 200
                    if (response.statusCode == 200) {
                        if (IsJsonString(body) == true) {
                            var regex = /(<([^>]+)>)/ig;
                            var bodytext = body.text;
                            var texthoro = bodytext.replace(regex, "");
                            //Обычное сообщение
                            if (tMsg == 0) {
                                resolve(EmbMsg(':star: Гороскоп :star:', 0xE98B14, `Гороскоп на сегодня для знака **${nameznak}**\n\n>>> ${texthoro}\n\n`));
                            }

                            //Если Slash команда
                            if (tMsg == 1) {
                                resolve(EmbMsg(':star: Гороскоп :star:', 0xE98B14, `Гороскоп на сегодня для знака **${nameznak}**\n\n>>> ${texthoro}\n\n`));
                            }
                        } else {
                            //Ошибка - не JSON
                            resolve(EmbMsg(':no_entry_sign: Ошибка', 0xE98B14, `Произошла ошибка в данных.\nПопробуйте отправить команду позже.`));
                        }
                    } else {
                        //Неверный запрос || Доступ запрещён || Страница не найдена || Внутренняя ошибка сервера
                        if (response.statusCode == 400 || response.statusCode == 403 || response.statusCode == 404 || response.statusCode == 500) {
                            resolve(EmbMsg(':no_entry_sign: Ошибка', 0xE98B14, `Сервер с информацией недоступен.\nПопробуйте отправить команду позже.`));
                        }
                    }
                } else {
                    //Нет данных ответа сервера
                    resolve(EmbMsg(':no_entry_sign: Ошибка', 0xE98B14, `Произошла какая-то непредвиденная ошибка.\nПопробуйте отправить команду позже.`));
                }
            }
        });
    });
}


//----------------------------------------
//Вывод сообщения о работе и готовности бота
//----------------------------------------
client.on('ready', () => {
    // Если всё хорошо, то выводим статус ему + в консоль информаию
    client.user.setPresence({ activities: [{ name: 'Warface RU' }], status: 'online' });
    console.log(`Запустился бот ${client.user.username} ${ Date.now()}`);
    //Получаем id владельца сервера
    const ownerAdmID = client.guilds.cache.get(idSrv).ownerId;

    //----------------------------------------
    //Удаляем все ранее зарегистрированные slash-команды
    //----------------------------------------
    client.api.applications(client.user.id).commands.get().then((result) => {
        var a = result;
        var index, len;
        for (index = 0, len = a.length; index < len; ++index) {
            client.api.applications(client.user.id).commands(a[index]['id']).delete();
        }
    });
    //----------------------------------------
    //Регистрация slash-команд
    //----------------------------------------
    client.api.applications(client.user.id).commands.post({
        data: {
        name: 'команды',
        description: 'Отобразить список всех доступных команд бота'
        },
    });
    client.api.applications(client.user.id).commands.post({
        data: {
        name: 'вк',
        description: 'Получить ссылку на группу клана в VK'
        },
    });
    client.api.applications(client.user.id).commands.post({
        data: {
        name: 'монетка',
        description: 'Выдаёт случайный результат подброса монетки'
        },
    });
    client.api.applications(client.user.id).commands.post({
        data: {
        name: 'бот',
        description: 'Получить информацию о данном боте'
        },
    });
    client.api.applications(client.user.id).commands.post({
        data: {
        name: 'гороскоп',
        description: 'Позволяет получить гороскоп на сегодня по указанному знаку зодиака'
        },
    });

    //----------------------------------------
    //Обработка slash-команд
    //----------------------------------------
    client.on('interactionCreate', async interaction => {
        //Обратотка команды
        if (interaction.isCommand()) {
            //Команда - команды
            if (interaction.commandName === 'команды') {
                if (hasRoleId(interaction.user)) {
                    //Проверяем на права владельца сервера
                    if (interaction.user.id === ownerAdmID) {
                        //Если есть права владельца
                        await interaction.reply({ embeds: [funcCommands(0,'команды',1)], ephemeral: true });
                    } else {
                        //Если Администратор или Модератор
                        await interaction.reply({ embeds: [funcCommands(1,'команды',1)], ephemeral: true });
                    }
                } else {
                    //Обычный пользователь
                    await interaction.reply({ embeds: [funcCommands(2,'команды',1)], ephemeral: true });
                }
            }

            //Команда - вк
            if (interaction.commandName === 'вк') {
                await interaction.reply({ embeds: [funcVk()], components: [MsgLink('https://vk.com/wf_rsd','Наша группа в ВК')], ephemeral: true });
            }
            
            //Команда - монетка
            if (interaction.commandName === 'монетка') {
                await interaction.reply({ content: funcMonetka(), ephemeral: true });
            }

            //Команда - бот
            if (interaction.commandName === 'бот') {
                await interaction.reply({ embeds: [funcAboutBot()], ephemeral: true });
            }

            //Команда - гороскоп
            if (interaction.commandName === 'гороскоп') {
                await interaction.reply({ content: 'Из выпадающего списка ниже выбирете знак зодиака', ephemeral: true, components: [listForHoro('selectHoro')] });
            }
        }

        //Обработка выбора выпадающего списка
        if (interaction.isSelectMenu()) {
            if (interaction.customId === 'selectHoro') {
                let embHoro = await funcHoro(interaction.values[0], 0);                
                await interaction.update({ content: null, embeds: [embHoro], components: [], ephemeral: true });
            }
        }
    });
});


//----------------------------------------
//Обработка сообщений текстового канала
//----------------------------------------
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
                    //Если есть права владельца
                    message.reply({ embeds: [funcCommands(0,command,0)]});
                } else {
                    //Если Администратор или Модератор
                    message.reply({ embeds: [funcCommands(1,command,0)]});
                }
            } else {
                //Обычный пользователь
                message.reply({ embeds: [funcCommands(2,command,0)]});
            }
        } else {
            //Если личное сообщение
            if (hasRoleId(message.author)) {
                //Проверяем на права владельца сервера
                if (message.author.id === ownerSrvID) {
                    //Если есть права владельца
                    message.reply({ embeds: [funcCommands(0,command,0)]});
                } else {
                    //Если Администратор или Модератор
                    message.reply({ embeds: [funcCommands(1,command,0)]});
                }
            } else {
                //Обычный пользователь
                message.reply({ embeds: [funcCommands(2,command,0)]});
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
            message.reply({ embeds: [funcVk()], components: [MsgLink('https://vk.com/wf_rsd','Наша группа в ВК')]});
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
        message.reply({ content: funcMonetka(), allowedMentions: { repliedUser: false }});
    }

    /* Подбросить монетку */
    else if (command === "бот") {
        if(numArg === 2 && args[0] === "?") {
            //Выдаём справку по данной команде
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nВыдаёт информацию о данном боте.\n\n**Пример набора команды**\n\`\`\`${prefix}${command}\`\`\``, 'https://i.imgur.com/kWHcX2v.gif')]});
            return;
        }
        if(numArg === 1) {
            //Отправляем информацию о боте
            message.reply({ embeds: [funcAboutBot()]});
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
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nПозволяет получить игровую статистику по бойцу.\n\nУкажите **ник бойца**\n\n**Пример набора команды**\n\`\`\`${prefix}${command} НикБойца\`\`\``, 'https://i.imgur.com/7gHBgNN.gif')]});
            return;
        }
        

        //Если указали только название команды
        if(numArg === 1 || numArg > 2) {
            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Укажите через пробел ник бойца, которого будите искать.\nТак же можно указать сервер через пробел.\n\nПример: \`${prefix}боец НикБойца Альфа\``)]}).then(m => setTimeout(() => m.delete(), 20000));
            return;
        }
        //Если указали ник
        if(numArg === 2) {
            //Ник бойца
            let uName = args[0].toLowerCase();
            //Проверяем указанный ник
            if (uName.length >= 4 && uName.length <= 16) {
                //Начинаем проверку на указанном сервере
                let link = "http://api.warface.ru/user/stat/?name=" + uName;
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
                                message.reply({ embeds: [EmbMsg(':bar_chart: Статистика по бойцу', 0x02A5D0 , parseApi(data))]});
                            }
                        } else {
                            //Неверный запрос
                            if (res.statusCode == 400) {
                                if (data.message == "Ошибка: invalid response status"){
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Недействительный статус ответа сервера`)]});
                                }
                                if (data.message == "Пользователь не найден"){
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`На сервере такой __боец не найден__`)]});
                                }
                                if (data.message == "Игрок скрыл свою статистику"){
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Боец найден на сервере, но его __статистика скрыта__`)]});
                                }
                                if (data.message == "Персонаж неактивен"){
                                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка',0x02A5D0,`Боец найден на сервере, но его __персонаж неактивен__`)]});
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
            message.reply({ embeds: [EmbMsgHelp(':information_source: СПРАВКА ПО КОМАНДЕ', 0x7ED321, `\nПозволяет получить информацию о клане в ежемесячном рейтинге.\n\nЧтобы получить информацию о нашем клане, достаточно набрать команду\n\`\`\`${prefix}${command}\`\`\`\nЧтобы получить информацю по другому клану, укажите название клана\n\n**Пример набора команды**\n\`\`\`${prefix}${command} НазваниеКлана\`\`\``, 'https://i.imgur.com/rPOFOEd.gif')]});
            return;
        }
        //парсинг данных с API
        function parseApi(info) {
            var clInfo = "";
            var data = info[0];
            //Название клана
            clInfo += "**Название клана:**   ``" + data.clan + "``\n";
            //Глава клана
            clInfo += "**Глава клана:**   ``" + data.clan_leader + "``\n";
            //Бойцов в клане
            clInfo += "**Бойцов в клане:**   ``" + data.members + "``\n";
            //Место клана -> число
            let numRank = parseInt(data.rank, 10);
            if (numRank <= 3000) {
                //
                if (numRank <= 10) {
                    clInfo += "**Лига:**   ``Элитная``\n";
                    clInfo += "**Место в лиге:**   ``" + ((numRank-1)+1) + "``\n";
                }
                if (numRank  > 10 && numRank <= 100) {
                    clInfo += "**Лига:**   ``Платиновая``\n";
                    clInfo += "**Место в лиге:**   ``" + ((numRank-10)) + "``\n";
                }
                if (numRank  > 100 && numRank <= 500) {
                    clInfo += "**Лига:**   ``Золотая``\n";
                    clInfo += "**Место в лиге:**   ``" + ((numRank-100)) + "``\n";
                }
                if (numRank  > 500 && numRank <= 1000) {
                    clInfo += "**Лига:**   ``Серебряная``\n";
                    clInfo += "**Место в лиге:**   ``" + ((numRank-500)) + "``\n";
                }
                if (numRank  > 1000 && numRank <= 2000) {
                    clInfo += "**Лига:**   ``Бронзовая``\n";
                    clInfo += "**Место в лиге:**   ``" + ((numRank-1000)) + "``\n";
                }
                if (numRank  > 2000 && numRank <= 3000) {
                    clInfo += "**Лига:**   ``Стальная``\n";
                    clInfo += "**Место в лиге:**   ``" + ((numRank-2000)) + "``\n";
                }
            } else {
                //Если нет лиги ещё
                clInfo += "**Лига:**   ``Без лиги``\n";
                clInfo += "**Место:**   ``" + numRank + "``\n";
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
            if (clNm != '') {
                //Название клана указано в переменной
                //Проверяем название сервера
                if (clNm.length >= 4 && clNm.length <= 16) {
                    //Название клана в порядке
                    let link = "http://api.warface.ru/rating/monthly?clan=" + clNm;
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
                                        message.reply({ embeds: [EmbMsg(':crossed_swords: Ежемесячный рейтинг клана', 0xFFF100 , parseApi(clan))]});
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
                    //Название клана не в порядке 4-16
                    message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Укажите через пробел название клана, которого будите искать.\n\nПример: \`${prefix}клан НазваниеКлана\``)]}).then(m => setTimeout(() => m.delete(), 20000));
                    return;
                }
            } else {
                //Не указаны переменная названия клана
                message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Укажите через пробел название клана, которого будите искать.\n\nПример: \`${prefix}клан НазваниеКлана\``)]}).then(m => setTimeout(() => m.delete(), 20000));
                return;
            }
        }
        if(numArg === 2) {
            //Клан
            let cName = args[0].toLowerCase();
            //Проверяем название сервера
            if (cName.length >= 4 && cName.length <= 16) {
                //Название клана в порядке
                //Формируем данные для запроса
                let link = "http://api.warface.ru/rating/monthly?clan=" + cName;
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
                                    message.reply({ embeds: [EmbMsg(':crossed_swords: Ежемесячный рейтинг клана', 0xFFF100 , parseApi(clan))]});
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
        if(numArg > 2) {
            message.reply({ embeds: [EmbMsg(':no_entry_sign: Ошибка', 0xFFF100, `Укажите через пробел название клана, которого будите искать.\n\nПример: \`${prefix}клан НазваниеКлана\``)]}).then(m => setTimeout(() => m.delete(), 20000));
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

/* Проверяем изменения голосовых каналов */
client.on('voiceStateUpdate', (oldState, newState) => {
    //console.log("🔴", oldState.voiceChannel);
    //console.log("🔵", newState.voiceChannel);
    //Проверяем наличие канала, куда будем отправлять сообщение
    let logChannel = client.channels.cache.find(ch => ch.id === idChMsg);
    if(!logChannel) return;
    //Канал для отправки сообщения
    let sysCh = client.channels.cache.get(idChMsg);
    //id AFK канала сервера
    const afkSrv = client.guilds.cache.map(guild => guild.afkChannelId).join("\n");

    //информация о каналах и пользователе
    let oldChannel = oldState.channel;
    let newChannel = newState.channel;
    let oldMember = oldState.member;
    let newMember = newState.member;
    let srvNick = '';
    //Проверяем серверный ник
    if(oldMember.nickname == null){
        srvNick = 'По умолчанию';
    } else {
        srvNick = oldMember.nickname;
    }
    

    //Пользователь подключился к голосовому каналу
    if(!oldState.channel && newState.channel) {
        let info = `Пользователь <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nподключился к каналу:\n${newChannel.name}`;
        sysCh.send({ embeds: [EmbedMsg(0x005F31, info)]});
    }
    //Пользователь вышел из голосового канала
    if(oldState.channel && !newState.channel) {
        let info = `Пользователь <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nпокинул канал:\n${oldChannel.name}`;
        sysCh.send({ embeds: [EmbedMsg(0x5F0000, info)]});
    }
    //Пользователь перешёл из голосового канала в другой
    if(oldState.channel && newState.channel && newChannel !== oldChannel) {
        //Получаем информацию из логов
        newMember.guild.fetchAuditLogs().then(logs => {
            //Получения последней записи в логах
            let firstEv = logs.entries.first();
            //Есть ли записи аудит лог
            if (!firstEv) {
                //Если пусто
                //Если пользователь сам перешёл в голосовой канал
                var info = `Пользователь <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nперешёл из канала:\n${oldChannel.name}\nв канал:\n${newChannel.name}`;
            } else {
                //Если лог не пустой
                //Сравниваем дату последнего лога и текущей даты
                if (Date.now() - firstEv.createdTimestamp < 5000) {
                    //Получения id пользователя, который выполнил непосредственно
                    let userID = firstEv.executor.id;
                    var info = `Пользователя <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nперетащили из канала:\n${oldChannel.name}\nв канал:\n${newChannel.name}\n\nКто перетащил:\n<@${userID}>`;
                } else {
                    //Если пользователь сам перешёл в голосовой канал
                    var info = `Пользователь <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nперешёл из канала:\n${oldChannel.name}\nв канал:\n${newChannel.name}`;
                }
            }

            //Отправляем сообщение
            sysCh.send({ embeds: [EmbedMsg(0x002D5F, info)]});
        });
    }
    //Пользователь выключил микрофон
    if(oldState.selfMute === false && newState.selfMute === true) {
        let info = `:microphone: Пользователь <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nотключил микрофон.`;
        sysCh.send({ embeds: [EmbedMsg(0x8B572A, info)]});
    }
    //Пользователь включил микрофон
    if(oldState.selfMute === true && newState.selfMute === false && oldState.channel.id !== afkSrv) {
        let info = `:microphone: Пользователь <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nвключил микрофон.`;
        sysCh.send(EmbedMsg(0x8B572A, info));
    }
    //Пользователь отключил звук
    if(oldState.selfDeaf === false && newState.selfDeaf === true && newState.channel.id !== afkSrv){
        let info = `:mute: Пользователь <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nотключил звук.`;
        sysCh.send({ embeds: [EmbedMsg(0x8B572A, info)]});
    }
    //Пользователь включил звук
    if(oldState.selfDeaf === true && newState.selfDeaf === false){
        let info = `:loud_sound: Пользователь <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nвключил звук.`;
        sysCh.send({ embeds: [EmbedMsg(0x8B572A, info)]});
    }
    //Пользователь включил камеру
    if(oldState.selfVideo === false && newState.selfVideo === true){
        let info = `:film_frames: Пользователь <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nвключил камеру.`;
        sysCh.send({ embeds: [EmbedMsg(0x8B572A, info)]});
    }
    //Пользователь выключил камеру
    if(oldState.selfVideo === true && newState.selfVideo === false){
        let info = `:film_frames: Пользователь <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nвыключил камеру.`;
        sysCh.send({ embeds: [EmbedMsg(0x8B572A, info)]});
    }
    //Пользователь включил стрим
    if(oldState.streaming === false && newState.streaming === true){
        let info = `:red_circle: Пользователь <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nвключил стрим.`;
        sysCh.send({ embeds: [EmbedMsg(0x8B572A, info)]});
    }
    //Пользователь выключил стрим
    if(oldState.streaming === true && newState.streaming === false){
        let info = `:red_circle: Пользователь <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nвыключил стрим.`;
        sysCh.send({ embeds: [EmbedMsg(0x8B572A, info)]});
    }
    //Пользователю выключили микрофон на сервере
    if(oldState.serverMute === false && newState.serverMute === true){
        //Полуаем из логов кто это сделал
        newMember.guild.fetchAuditLogs().then(logs => {
            //Получения id пользователя, который выполнил непосредственно
            let userID = logs.entries.first().executor.id;
            if (!userID) return;
            let info = `:large_orange_diamond: :microphone: Пользователю <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nвыключили микрофон на сервере.\n\nКто отключил:\n<@${userID}>`;
            sysCh.send({ embeds: [EmbedMsg(0x8B572A, info)]});
        });
    }
    //Пользователю включили микрофон на сервере
    if(oldState.serverMute === true && newState.serverMute === false){
        //Полуаем из логов кто это сделал
        newMember.guild.fetchAuditLogs().then(logs => {
            //Получения id пользователя, который выполнил непосредственно
            let userID = logs.entries.first().executor.id;
            if (!userID) return;
            let info = `:large_orange_diamond: :microphone: Пользователю <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nвключили микрофон на сервере.\n\nКто включил:\n<@${userID}>`;
            sysCh.send({ embeds: [EmbedMsg(0x8B572A, info)]});
        });
    }
    //Пользователю выключили звук на сервере
    if(oldState.serverDeaf === false && newState.serverDeaf === true){
        //Полуаем из логов кто это сделал
        newMember.guild.fetchAuditLogs().then(logs => {
            //Получения id пользователя, который выполнил непосредственно
            let userID = logs.entries.first().executor.id;
            if (!userID) return;
            let info = `:large_orange_diamond: :mute: Пользователю <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nвыключили звук на сервере.\n\nКто отключил:\n<@${userID}>`;
            sysCh.send({ embeds: [EmbedMsg(0x8B572A, info)]});
        });
    }
    //Пользователю включили звук на сервере
    if(oldState.serverDeaf === true && newState.serverDeaf === false){
        //Полуаем из логов кто это сделал
        newMember.guild.fetchAuditLogs().then(logs => {
            //Получения id пользователя, который выполнил непосредственно
            let userID = logs.entries.first().executor.id;
            if (!userID) return;
            let info = `:large_orange_diamond: :loud_sound: Пользователю <@${oldMember.id}>\nНик: \`${srvNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\nвключили звук на сервере.\n\nКто включил:\n<@${userID}>`;
            sysCh.send({ embeds: [EmbedMsg(0x8B572A, info)]});
        });
    }
});

//Сообщаем о новом пользователе на сервере
client.on('guildMemberAdd', member => {
    //Проверяем наличие канала, куда будем отправлять сообщение
    let logChannel = client.channels.cache.find(ch => ch.id === idChMsg);
    if(!logChannel) return;

    //Канал для отправки сообщения
    let sysCh = client.channels.cache.get(idChMsg);
    //Формирование
    sysCh.send({ embeds: [EmbMsg('**[Новый пользователь]**', 0xFDFDFD, `Пользователь ${member}\nНик: \`${member.displayName}\`\nНик: \`${member.user.username}#${member.user.discriminator}\`\n\nтолько что зашёл на сервер`)]});

    //Отправляем в личку сообщение пользователю 
    //Название сервера
    const nameSrv = client.guilds.cache.map(guild => guild.name).join("\n");
    member.send({ content: `>>> Добро пожаловать на сервер **${nameSrv}**!\n\n**1.** Необходимо сменить свой ник на нашем сервере по шаблону **Ник в игре (Ваше имя)**.\nПример: **ТащерДжек (Вася)**\n\n**2.** В текстовом канале **#welcome** есть краткая информация о ролях, кто может их выдать. А так же информация о текстовых и голосовых каналах.\n\n**3.** В текстовом канале **#rules** ознакомьтесь с правилами нашего сервера.\n\nСписок доступных команд бота можно узнать с помощью команды:\n\`\`\`${prefix}команды\`\`\``, allowedMentions: { repliedUser: false }});
});

//Сообщаем о пользователе, который покинул сервер
client.on('guildMemberRemove', member => {
    //Проверяем наличие канала, куда будем отправлять сообщение
    let logChannel = client.channels.cache.find(ch => ch.id === idChMsg);
    if(!logChannel) return;
    //Канал для отправки сообщения
    let sysCh = client.channels.cache.get(idChMsg);
    //Формирование
    sysCh.send({ embeds: [EmbMsg('**[Покинул пользователь]**', 0xFDFDFD, `Пользователь ${member}\nНик: \`${member.displayName}\`\nНик: \`${member.user.username}#${member.user.discriminator}\`\n\nпокинул наш сервер`)]});
});

/* Проверка на изменение прав, ника, аватара */
client.on('guildMemberUpdate', function(oldMember, newMember) {
    //Проверяем наличие канала, куда будем отправлять сообщение
    let logChannel = client.channels.cache.find(ch => ch.id === idChMsg);
    if(!logChannel) return;
    //Канал для отправки сообщения
    let sysCh = client.channels.cache.get(idChMsg);

    //объявляем изменения
    var Changes = {
        unknown: 0,
        addedRole: 1,
        removedRole: 2,
        username: 3,
        nickname: 4,
    };
    var change = Changes.unknown;

    //Если изменился личный ник пользователя
    if (newMember.user.username !== oldMember.user.username)
        change = Changes.username;
    //Если изменился серверный ник пользователя
    if (newMember.nickname !== oldMember.nickname)
        change = Changes.nickname;
    //Если добавили роль
    var addedRole = '';
    if (oldMember.roles.cache.size < newMember.roles.cache.size) {
        change = Changes.addedRole;
        //Получаем название роли
        for (const role of newMember.roles.cache.map(x => x.id)) {
            if (!oldMember.roles.cache.has(role)) {
                addedRole = oldMember.guild.roles.cache.get(role).name;
            }
        }
    }
    //Если удалили роль
    var removedRole = '';
    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
        change = Changes.removedRole;
        //Получаем название роли
        for (const role of oldMember.roles.cache.map(x => x.id)) {
            if (!newMember.roles.cache.has(role)) {
                removedRole = oldMember.guild.roles.cache.get(role).name;
            }
        }
    }

    //Отправляем сообщение в канал
    var log = newMember.guild.channels.cache.find(ch => ch.id === idChMsg);
    let info = '';
    if (log) {
        switch (change) {
            //Неизвестное изменение
            case Changes.unknown:
                //info = `Пользователь <@${newMember.id}>\nНик: \`${newMember.nickname}\`\nTag: \`${newMember.user.username}#${newMember.user.discriminator}\`\n\nобновил информацию.`;
                //sysCh.send({ embeds: [EmbMsg('**[ИЗМЕНИЛАСЬ ИНФОРМАЦИЯ]**', 0x50E3C2, info)]}));
                break;
            //Смена ника пользователя
            case Changes.username:
                info = `Пользователь сменивший личный ник: <@${oldMember.id}>\nНик: \`${oldMember.nickname}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\n**Старый ник:**\n${oldMember.user.username}#${oldMember.user.discriminator}\n**Новый ник:**\n${newMember.user.username}#${newMember.user.discriminator}`;
                sysCh.send({ embeds: [EmbMsg('**[ИЗМЕНЕН ЛИЧНЫЙ НИК]**', 0x50E3C2, info)]});
                break;
            //Смена серверного ника
            case Changes.nickname:
                //Ковыряемся в Журнале серверном
                newMember.guild.fetchAuditLogs().then(logs => {
                    //Получения id пользователя, который выполнил непосредственно
                    var userID = logs.entries.first().executor.id;
                    if (!userID) return;
                    let oldNick = '';
                    let newNick = '';
                    //Если первоначальный ник - по умолчанию
                    if (oldMember.nickname != null){
                        oldNick = oldMember.nickname;
                    } else {
                        oldNick = 'По умолчанию';
                    }
                    //Если новый ник - по умолчанию
                    if (newMember.nickname != null){
                        newNick = newMember.nickname;
                    } else {
                        newNick = 'По умолчанию';
                    }
                    info = `У кого сменился серверный ник: <@${oldMember.id}>\nНик: \`${oldNick}\`\nTag: \`${oldMember.user.username}#${oldMember.user.discriminator}\`\n\n**Старый ник:**\n\`${oldNick}\`\n**Новый ник:**\n\`${newNick}\`\n\nКто сменил:\n<@${userID}>`;
                    //Отправляем сообщение
                    sysCh.send({ embeds: [EmbMsg(':repeat: **[ИЗМЕНЕН СЕРВЕРНЫЙ НИК]**', 0x50E3C2, info)]});
                })
                break;
            //Добавление прав/роли
            case Changes.addedRole:
                //Ковыряемся в Журнале серверном
                newMember.guild.fetchAuditLogs().then(logs => {
                    //Получения id пользователя, который выполнил непосредственно
                    var userID = logs.entries.first().executor.id;
                    if (!userID) return;
                    let nickuser = newMember.nickname;
                    if (nickuser == null) {
                        nickuser = 'По умолчанию';
                    }
                    //формируем сообщение
                    info = `**Кому добавили:**<@${newMember.id}>\nНик: \`${nickuser}\`\nTag: \`${newMember.user.username}#${newMember.user.discriminator}\`\n\n**Роль:**\n __${addedRole}__\n\nКто добавил:\n<@${userID}>`;
                    //Отправляем сообщение
                    sysCh.send({ embeds: [EmbMsg(':warning: **[ДОБАВЛЕНА РОЛЬ]**', 0x50E3C2, info)]});
                })
                break;
            //Удаление прав/роли
            case Changes.removedRole:
            //Ковыряемся в Журнале серверном
            newMember.guild.fetchAuditLogs().then(logs => {
                //Получения id пользователя, который выполнил непосредственно
                var userID = logs.entries.first().executor.id;
                if (!userID) return;
                let nickuser = newMember.nickname;
                if (nickuser == null) {
                    nickuser = 'По умолчанию';
                }
                //формируем сообщение
                info = `**Кому удалили:**<@${newMember.id}>\nНик: \`${nickuser}\`\nTag: \`${newMember.user.username}#${newMember.user.discriminator}\`\n\n**Роль:**\n __${removedRole}__\n\nКто удалил:\n<@${userID}>`;
                //Отправляем сообщение
                sysCh.send({ embeds: [EmbMsg(':warning: **[УДАЛЕНА РОЛЬ]**', 0x50E3C2, info)]});
            })
            break;
        }
    }
});



//авторизация
client.login(token);
