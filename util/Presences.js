const fetch = require('node-fetch');
const self = process.app;

function decodePrivate(string) {
    const base64 = Buffer.from(string, 'base64').toString('utf-8')
    return JSON.parse(base64);
}

async function getPresences() {
    return fetch(`https://127.0.0.1:${self.lockfile.port}/chat/v4/presences`, {
        method: "GET",
        headers: {
            'Authorization': `Basic ${Buffer.from(`riot:${self.lockfile.password}`).toString('base64')}`
        }
    }).then(res => res.json()).then(data => data.presences.filter(u => u.product === 'valorant'));
}

function getPlayerInfo(puuid, presences) {
    const player = presences.find(u => u.puuid === puuid);

    if (player === undefined) return {
        username: `null`,
        party: "NaN"
    }

    if ((!player.private.includes("{")) && (player.private !== null) && (player.private !== "")) {
        const privateData = decodePrivate(player.private);

        return {
            username: `${player.game_name}#${player.game_tag}`,
            party: privateData.partyId
        }
    }

    return {
        username: `${player.game_name}#${player.game_tag}`,
        party: "NaN"
    }
}

async function getPlayerPresence() {
    return await Promise.resolve(getPresences()).then(presence => {
        const player = presence.filter(u => u.puuid === self.puuid);
        const privateData = decodePrivate(player[0].private);
        return privateData.sessionLoopState;
    });
}

module.exports = {
    getPresences,
    getPlayerInfo,
    getPlayerPresence
}