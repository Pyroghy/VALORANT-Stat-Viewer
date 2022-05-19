const fetch = require('node-fetch');

module.exports = class Game {
    constructor(user) {
        this.puuid = user.puuid;
        this.region = user.region;
        this.entitlements = user.entitlements;
        this.matchId = "";
        this.matchData = [];
    }

    async getPlayer(gameType) {
        const res = await fetch(`https://glz-${this.region}-1.${this.region}.a.pvp.net/${gameType}/v1/players/${this.puuid}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.entitlements.accessToken}`,
                "X-Riot-Entitlements-JWT": this.entitlements.token
            }
        });

        const data = await res.json();
        this.matchId = data.MatchID;
    }

    async getMatch(gameType) {
        const res = await fetch(`https://glz-${this.region}-1.${this.region}.a.pvp.net/${gameType}/v1/matches/${this.matchId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.entitlements.accessToken}`,
                "X-Riot-Entitlements-JWT": this.entitlements.token
            }
        });

        const data = await res.json();
        this.matchData = data.Players.map(u => ({ puuid: u.Subject, team: u.TeamID, character: u.CharacterID }));
    }

    async run(gameType) {
        await this.getPlayer(gameType);
        await this.getMatch(gameType);
    }
}