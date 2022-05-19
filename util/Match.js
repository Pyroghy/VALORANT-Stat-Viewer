const fetch = require('node-fetch');

module.exports = class Match {
    constructor(user, game) {
        this.puuid = user.puuid;
        this.region = user.region;
        this.version = user.version;
        this.entitlements = user.entitlements;
        this.matchData = game.matchData;
    }

    async getMatchHistory(puuid) {
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
        return data.History.map(match => match.MatchID);
    }

    async getPlayerStats(puuid, matches) {
        let wins = 0;
        let kills = 0;
        let deaths = 0;
        let shots = 0;
        let headshots = 0;

        for (let i = 0; i < matches.length; i++) {
            const res = await fetch(`https://pd.${this.region}.a.pvp.net/match-details/v1/matches/${matches[i]}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${this.entitlements.accessToken}`,
                    "X-Riot-Entitlements-JWT": this.entitlements.token,
                    "X-Riot-ClientVersion": this.version,
                    "X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"
                }
            });

            const data = await res.json();
            const players = data.players;
            const teams = data.teams;
            const rounds = data.roundResults;

            for (let p = 0; p < players.length; p++) {
                if (players[p].subject === puuid) {
                    kills += players[p].stats.kills;
                    deaths += players[p].stats.deaths;

                    for (let t = 0; t < teams.length; t++) {
                        if (players[p].teamId === teams[t].teamId && teams[t].won) {
                            wins++;
                        }
                    }
                }
            }

            for (let r = 0; r < rounds.length; r++) {
                const roundStats = rounds[r].playerStats;
                const round = roundStats.find(u => u.subject === puuid);
                const roundDamage = round.damage;

                for (let d = 0; d < roundDamage.length; d++) {
                    shots += roundDamage[d].legshots + roundDamage[d].bodyshots + roundDamage[d].headshots;
                    headshots += roundDamage[d].headshots;
                }
            }
        }

        return {
            headshot: `${Math.round((headshots / shots) * 100)}%`,
            win: `${Math.round((wins / matches.length) * 100)}%`,
            kd: (kills / deaths).toFixed(2)
        }
    }

    async run() {
        for (let i = 0; i < this.matchData.length; i++) {
            const matches = await this.getMatchHistory(this.matchData[i].puuid);
            this.matchData[i].stats = await this.getPlayerStats(this.matchData[i].puuid, matches);
        }
    }
}