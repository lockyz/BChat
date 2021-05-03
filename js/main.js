
function escapeHtml(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function leadingZero(number) {
	if (Number(number) < 10) {
		number = '0' + number;
	}
	return number;
};

var token;
if (!localStorage.getItem('token') || localStorage.getItem('token') === '') {
	token = prompt('token', '');
	localStorage.setItem('token', token);
}
token = localStorage.getItem('token');

const client = new Discord.Client();
client.login(token);

$(document)
	.ready(() => {

		$("#refreshToken")
			.click(() => {
				if (window.confirm('Are you sure ?')) {
					localStorage.setItem('token', '')
					window.location.reload(true);
				} else {
					return;
				}
			});

		$("#lastMessages")
			.html(getSavedValue("lastMessages"));

		client.on('message', (message) => {
			if (message.channel.type !== "text") {
				if ($("#guilds")
					.val() === 'DM') {
					updateChannel(client);
				}
			} else {
				if (message.author.bot) {} else {
					$("#lastMessages")
						.html($("#lastMessages")
							.html() + `<br>[<b>#${escapeHtml(message.channel.name)} | ${escapeHtml(message.author.tag)}]</b> ${escapeHtml(message.content)}`);
				}
				localStorage.setItem('lastMessages', $('#lastMessages')
					.html());

				if (message.channel.id === $("#channels")
					.val()) {
					updateChannel(client);
				}
			}
		});

		client.on('ready', () => {
			if (client.user.bot) {
				console.log('Connected to the API.\nStarting Channel Search')
				fetchGuilds(client);
				$('#botName')
					.html(`<img src='${client.user.avatarURL||'./img/pp_discord.png'}' class='avatarIMG'> ${escapeHtml(client.user.username)}`);
			} else {
				alert("It is against the TOS to use the discord API for a selfbot.")
				return;
			}
		});

		client.on('disconnect', () => {
		})

		client.on('messageDelete', (message) => {
			if (message.channel.id === $("#channels")
				.val()) updateChannel(client);
			if ($("#guilds")
				.val() === 'DM' && message.author.id === $('#channels')
				.val()) updateChannel(client);
		});

		client.on('messageUpdate', (oldMessage, newMessage) => {
			if (oldMessage.channel.id === $("#channels")
				.val()) updateChannel(client);
			if ($("#guilds")
				.val() === 'DM' && oldMessage.author.id === $('#channels')
				.val()) updateChannel(client);
		});

		client.on('guildCreate', (guild) => {
			//fetchGuilds(client);
		});

		client.on('guildDelete', (guild) => {
			//fetchGuilds(client);
		});

		client.on('guildMemberAdd', (member) => {
			//fetchGuilds(client);
		});

		client.on('guildMemberRemove', (member) => {
			//fetchGuilds(client);
		});

		$(document)
			.on('change', '#guilds', () => {
				updtateGuild(client);
			});

		$(document)
			.on('change', '#channels', () => {
				updateChannel(client);
			});

		$("#send")
			.click(() => {
				sendMessage(client);
            });

		$("#delLast")
			.click(() => {
				if (client.user.lastMessage === null) {
					$("#delLast")
						.html(`<i class="fas fa-times"></i> Delete Last Message [ERROR]`)
					setTimeout(function() {
						$("#delLast")
							.html(`<i class="far fa-calendar-times"></i> Delete Last Message`);
					}, 2000);
					return;
				} else {
					try {
						client.user.lastMessage.delete();
						updateChannel(client);
					} catch (error) {
						return;
					}
				}
			});

			$("#refreshChannels")
			.click(() => {
				fetchGuilds(client);
            });

		$('#btnrRefreshChat')
			.click(() => {
				$("#btnrRefreshChat")
					.html(`<i class="fas fa-sync fa-spin"></i> Refresh Chat`);
				updateChannel(client);
				setTimeout(function() {
					$("#btnrRefreshChat")
						.html(`<i class="fas fa-sync-alt"></i> Refresh Chat`);
				}, 2000);

			});

		setInterval(() => {
			$("#activaterpc")
			.click(() => {
			if($("#chk4").val() === 'online') {
				client.user.setPresence({
					game: {
						name: $("#toactivaterpc").val()
					}
					, status: 'online'
				})
				console.log('Going Online')
			}
			if($("#chk4").val() === 'invisible') {
					client.user.setPresence({
						game: {
							name: ''
						}
						, status: 'invisible'
					})
					console.log('Going Offline')
			}
			if($("#chk4").val() === 'dnd') {
				client.user.setPresence({
					game: {
						name: $("#toactivaterpc").val()
					}
					, status: 'dnd'
				})
				console.log('Going DND')
		}
		if($("#chk4").val() === 'idle') {
			client.user.setPresence({
				game: {
					name: $("#toactivaterpc").val()
				}
				, status: 'idle'
			})
			console.log('Going Idle')
			}})
		}, 1000);
	});

function getSavedValue(v) {
	if (localStorage.getItem(v) === null) {
		return "";
	}
	return localStorage.getItem(v);
}

function fetchGuilds(client) {
	$('#channels')
		.children('option')
		.remove();
	$('#guilds')
		.children('option')
		.remove();

	client.guilds.forEach((guild) => {
		$("#guilds")
			.append(`<option value="${guild.id}">${escapeHtml(guild.name)}</option>`);
	});
	$("#guilds")
		.append(`<option value="DM">[DM]</option>`);

	setTimeout(() => {
		updtateGuild(client);
	}, 250);
}

function updtateGuild(client) {
	$('#channels')
		.children('option')
		.remove();

	if ($("#guilds")
		.val() === 'DM') {

		var usersArray = [];

		client.users.forEach((user) => {
			if (!user.bot) {
				usersArray.push(`${escapeHtml(user.username.toLowerCase())}    ||sortedbyønlyøne||    ${user.id}    ||sortedbyønlyøne||    ${escapeHtml(user.username)}`);
			}
		});
		usersArray.sort();
		for (let i = 0; i < usersArray.length; i++) {
			usersArray[i] = usersArray[i].split('    ||sortedbyønlyøne||    ');
			$("#channels")
				.append(`<option value="${usersArray[i][1]}">${escapeHtml(usersArray[i][2])} (${usersArray[i][1]})</option>`);
		}
	} else {
		var guild = client.guilds.find((g) => g.id === $("#guilds")
			.val());
		var guildEmojis = [];

		guild.emojis.forEach((emoji) => {
			if (emoji.animated) {
				guildEmojis.push(`&lt;a:${emoji.identifier}&gt; <button class='mini' value='<a:${emoji.identifier}>' onclick='addText(this.value)'>Add</button>`);
			} else guildEmojis.push(`&lt;:${emoji.identifier}&gt; <button class='mini' value='<:${emoji.identifier}>' onclick='addText(this.value)'>Add</button>`);
		});

		guild.channels.filter((chan) => chan.type === 'text')
			.forEach((channel) => {
				if (channel.permissionsFor(guild.me)
					.has('VIEW_CHANNEL')) {
					$("#channels")
						.append(`<option value="${channel.id}">${escapeHtml(channel.name)}</option>`);
						console.log('Finished Searching for Text Channels.\nStarting News Channel Search')
				}
			});
		
			guild.channels.filter((chan) => chan.type === 'news')
			.forEach((channel) => {
				if (channel.permissionsFor(guild.me)
					.has('VIEW_CHANNEL')) {
					$("#channels")
						.append(`<option value="${channel.id}">${escapeHtml(channel.name)}</option>`);
						console.log('Finished Searching for News Channels.\nSearching Complete. Bot can now be used')
				}
			});

		$('#guildName')
			.html(`<img src='${guild.iconURL||'./img/pp_discord.png'}' class='avatarIMG'> ${escapeHtml(guild.name)}`);
    }

    setTimeout(() => {
        updateChannel(client);
    }, 250);
}

function updateChannel(client) {
    var channel;
    if ($("#guilds").val() === 'DM') {
        var user = client.users.find((user) => user.id === $('#channels').val());
        channel = client.channels.find((channel) => channel.type === 'dm' && channel.recipient.id === user.id);

        $('#guildName').html(`<img src='${user.avatarURL||'./img/pp_discord.png'}' class='avatarIMG'> ${escapeHtml(user.username)}`);
        $("#guildInfo").html(`User ID : (${user.id}) <button class='mini' value='<@!${user.id}>' onclick="addText(this.value)"> <i class="fas fa-at"></i> </button>`);

        $("#channelNameLabel").text(`Chat [${user.username}]`);
        $("#channelName").html(`<img src='https://static.thenounproject.com/png/332789-200.png' class="fasIMG invert"> #${escapeHtml(user.username)}`);
    } else {
        channel = client.channels.find((c) => c.id === $("#channels").val());

        $("#channelNameLabel").text(`Chat [${channel.name}]`);
        $("#channelName").html(`<img src='https://static.thenounproject.com/png/332789-200.png' class="fasIMG invert"> #${escapeHtml(channel.name)}`);
    }
    $('#chat').html('');
    setTimeout(() => {
        try {
            channel.fetchMessages()
                .then((messages) => {
                    var msgArray = Array.from(messages).reverse();
                    var html;
                    if ($("#guilds").val() === 'DM') {
                        msgArray.forEach((msg) => {
                            var date = new Date(msg[1].createdAt);
                            var timestamp = `${leadingZero(date.getDate())}/${leadingZero(date.getMonth() + 1)}/${date.getFullYear()} ${leadingZero(date.getHours() + 1)}:${leadingZero(date.getMinutes())}`;
                            html = `<br><b>${escapeHtml(msg[1].author.username)} [${timestamp}] <button class='mini' value="<@!${msg[1].author.id}>" onclick='addText(this.value)'> <i class="fas fa-at"></i> </button></b> ${escapeHtml(msg[1].content)}`;
                            $('#chat').html($('#chat').html() + html);
                        });
                    } else {
                        msgArray.forEach((msg) => {
                            var date = new Date(msg[1].createdAt);
                            var timestamp = `${leadingZero(date.getDate())}/${leadingZero(date.getMonth() + 1)}/${date.getFullYear()} ${leadingZero(date.getHours() + 1)}:${leadingZero(date.getMinutes())}`;
                            html = `<br><b>${escapeHtml(msg[1].author.username)} [${timestamp}] <button class='mini' value="<@!${msg[1].author.id}>" onclick='addText(this.value)'> <i class="fas fa-at"></i> </button><button class='mini' value="${msg[0]}" onclick='dlt(this.value)'> <i class="fas fa-trash-alt"></i> </button></b> ${escapeHtml(msg[1].content)}`
                            $('#chat').html($('#chat').html() + html);
                        });
                    }
                });
        } catch (error) {
            return;
        }
    }, 500);
}

function sendMessage(client) {
    if ($("#toSend").val() === '') {
        $("#send").html(`<i class="fas fa-times"></i> Send [ERROR]`)
        setTimeout(function () {
            $("#send").html(`<i class="fas fa-share-square"></i> Send`);
        }, 2000);
        return alert('Cannot send empty message');
    } else {
        if ($("#guilds").val() === 'DM') {
            var user = client.users.find((user) => user.id === $('#channels').val());
            user.send($("#toSend").val());
        } else {
            client.channels.find((channel) => channel.id === $('#channels').val()).send($("#toSend").val());
        }
        $('#toSend').val('');
    }
}

function addText(value) {
    $("#toSend").val(`${$("#toSend").val()}${value} `);
}

function dlt(value) {
    if (window.confirm('Are you sure ?')) {
        client.channels.find((channel) => channel.id === $("#channels").val()).fetchMessage(value).then((msg) => msg.delete())
    }
}