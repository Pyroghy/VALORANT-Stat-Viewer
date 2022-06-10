const { getPresences, getPlayerInfo } = require('./Presences.js');
const { getPlayerRank, getPlayerStats } = require('./Stats.js');
const { getMatchId } = require('./Match.js');
const fetch = require('../modules/fetch');
const self = process.app;

async function generatePlayerData(matchPlayers, players, teamId) {
    await Promise.resolve(getPresences()).then(async (presences) => {
        for (let i = 0; i < players.length; i++) {
            const promises = [getPlayerRank(players[i].Subject), getPlayerStats(players[i].Subject), getPlayerInfo(players[i].Subject, presences)];
            await Promise.all(promises).then(data => {
                matchPlayers.push({
                    ...{
                        puuid: players[i].Subject,
                        username: data[2].username,
                        level: players[i].PlayerIdentity.AccountLevel,
                        party: data[2].party,
                        characterId: players[i].CharacterID,
                        team: teamId === null ? players[i].TeamID : teamId,
                    },
                    ...data[0],
                    ...data[1]
                });
            });
        }
    });
}

async function getPlayers(gameState) {
    const matchId = await getMatchId(gameState); // add to global obj or something
    const data = await fetch(`https://glz-${self.region}-1.${self.region}.a.pvp.net/${gameState}/v1/matches/${matchId}`);
    const matchPlayers = [];

    if (gameState === 'pregame') {
        await generatePlayerData(matchPlayers, data.AllyTeam.Players, data.AllyTeam.TeamID);
    }
    else if (gameState === 'core-game') {
        await generatePlayerData(matchPlayers, data.Players, null);
    }

    return matchPlayers;
}

module.exports = {
    getPlayers
}