const fetch = require('node-fetch');
const self = process.app;

async function getMatchId(gameState) {
    return fetch(`https://glz-${self.region}-1.${self.region}.a.pvp.net/${gameState}/v1/players/${self.puuid}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${self.entitlements.accessToken}`,
            "X-Riot-Entitlements-JWT": self.entitlements.token
        }
    }).then(res => res.json()).then(data => data.MatchID);
}

async function getMatchHistory(puuid) {
    return fetch(`https://pd.${self.region}.a.pvp.net/match-history/v1/history/${puuid}?endIndex=5`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${self.entitlements.accessToken}`,
            "X-Riot-Entitlements-JWT": self.entitlements.token,
            "X-Riot-ClientVersion": self.version,
            "X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"
        }
    }).then(res => res.json()).then(data => data.History.map(match => match.MatchID));
}

module.exports = {
    getMatchId,
    getMatchHistory
}