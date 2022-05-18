const fetch = require('node-fetch');

const fs = require('fs')

class Match {
    constructor(user) {
        this.puuid = user.puuid;
        this.region = user.region;
        this.version = user.version;
        this.entitlements = user.entitlements;

        this.matchData = {};
        this.matchData.Blue = [];
        this.matchData.Red = [];
    }

    async getCurrentMatch() {
        // switch between "core-game" and "pre-game"
        const res = await fetch(`https://glz-${this.region}-1.${this.region}.a.pvp.net/core-game/v1/players/${this.puuid}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.entitlements.accessToken}`,
                "X-Riot-Entitlements-JWT": this.entitlements.token
            }
        });

        const data = await res.json();
        return data.MatchID;
    }

    async currentMatchData() {
        /*
        const match = await this.getCurrentMatch();
        const res = await fetch(`https://glz-${this.region}-1.${this.region}.a.pvp.net/core-game/v1/matches/${match}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.entitlements.accessToken}`,
                "X-Riot-Entitlements-JWT": this.entitlements.token
            }
        });

        const json = await res.json();
        */

        const json = JSON.parse(fs.readFileSync('./temp/ma2.json', 'utf-8'));
        const players = json.Players;

        for (let i = 0; i < players.length; i++) {
            this.matchData[players[i].TeamID].push({
                puuid: players[i].Subject,
                character: players[i].CharacterID,
                level: players[i].PlayerIdentity.AccountLevel,
                matches: []
            });
        }
    }

    async getPlayerMatches(puuid) {
        const res = await fetch(`https://pd.${this.region}.a.pvp.net/match-history/v1/history/${puuid}?endIndex=5`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.entitlements.accessToken}`,
                "X-Riot-Entitlements-JWT": this.entitlements.token,
                "X-Riot-ClientVersion": this.version,
                "X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"
            }
        });

        const data = await res.json();
        const matchHistory = data.History;
        const latestMatches = matchHistory.map(match => match.MatchID);
        return latestMatches;
    }

    async playerMatches() {
        const matchData = this.matchData;
        const blue = matchData.Blue;
        const red = matchData.Red;

        for (let i = 0; i < blue.length; i++) {
            blue[i].matches = await this.getPlayerMatches(blue[i].puuid);
        }

        for (let i = 0; i < red.length; i++) {
            red[i].matches = await this.getPlayerMatches(red[i].puuid);
        }

        this.matchData = matchData;
    }

    async run() {
        await this.currentMatchData();
        await this.playerMatches();
    }
}

module.exports = Match;