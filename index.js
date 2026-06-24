const { Api, TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const dotenv = require('dotenv');

dotenv.config()

// my.telegram.org
const apiId = Number(process.env.API_ID); // API ID
const apiHash = process.env.API_HASH;
const stringSession = new StringSession("");

const CHANNEL = process.env.CHANNEL_NAME;

(async () => {
    const client = new TelegramClient(
        stringSession,
        apiId,
        apiHash,
        { connectionRetries: 5 }
    );

    await client.start({
        phoneNumber: async () => await input.text("Phone: "),
        password: async () => await input.text("2FA Password: "),
        phoneCode: async () => await input.text("Code: "),
        onError: console.log,
    });

    console.log("Logged in");

    const channel = await client.getEntity(CHANNEL);
    const SEARCH_CHAR = await input.text("Search character: ")
    const REPLACE_CHAR = await input.text("Replace with: ")

    for await (const message of client.iterMessages(channel)) {
        if (!message.message) continue;


        if (message.message.includes(SEARCH_CHAR)) {
            const newText = message.message.replaceAll(
                SEARCH_CHAR,
                REPLACE_CHAR
            );

            try {
                await client.editMessage(channel, {
                    message: message.id,
                    text: newText,
                });

                console.log(`Edited: ${message.id}`);
            } catch (err) {
                console.log(`Failed ${message.id}:`, err.message);
            }
        }
    }

    await client.invoke(new Api.auth.LogOut({}));
    console.log("Editing done, GoodLock :)");
    process.exit(0);
})();