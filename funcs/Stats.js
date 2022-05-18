const fetch = require('node-fetch');

class Stats {
    constructor(user, match) {
        this.region = user.region;
        this.version = user.version;
        this.entitlements = user.entitlements;
        this.players = match.matchData
    }

    async getPlayerStats(team) {
        for (let i = 0; i < team.length; i++) {
            const matches = team[i].matches;
            const puuid = team[i].puuid

            let wins = 0;
            let kills = 0;
            let deaths = 0;

            let shots = 0;
            let headshots = 0;

            let name = "";
            let tag = "";

            for (let m = 0; m < matches.length; m++) {
                const res = await fetch(`https://pd.${this.region}.a.pvp.net/match-details/v1/matches/${matches[m]}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${this.entitlements.accessToken}`,
                        "X-Riot-Entitlements-JWT": this.entitlements.token,
                        "X-Riot-ClientVersion": this.version,
                        "X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"
                    }
                });

                const data = await res.json();
                const teams = data.teams;
                const players = data.players;
                const rounds = data.roundResults;

                for (let p = 0; p < players.length; p++) {
                    if (players[p].subject === puuid) {
                        name = players[p].gameName;
                        tag = players[p].tagLine;
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
                        shots += roundDamage[d].legshots + roundDamage[d].bodyshots + roundDamage[d].headshots
                        headshots += roundDamage[d].headshots
                    }
                }
            }

            team[i].name = name;
            team[i].tag = tag;
            team[i].stats = {
                headshot: `${Math.round((headshots / shots) * 100)}%`,
                win: `${Math.round((wins / matches.length) * 100)}%`,
                kd: (kills / deaths).toFixed(2)
            };
        }
    }

    async run() {
        const blue = this.players.Blue;
        const red = this.players.Red;

        await this.getPlayerStats(blue)
        await this.getPlayerStats(red)
    }
}

module.exports = Stats;