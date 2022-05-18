const fetch = require('node-fetch');

class Rank {
    constructor(user, match) {
        this.puuid = user.puuid;
        this.region = user.region;
        this.season = user.season;
        this.version = user.version;
        this.entitlements = user.entitlements;
        this.players = match.matchData;

        this.matchPlayers = {};
        this.matchPlayers.Blue = [];
        this.matchPlayers.Red = [];
    }

    async getCompetitiveTiersUuid() {
        const res = await fetch('https://valorant-api.com/v1/seasons/competitive');
        const json = await res.json();
        const data = json.data;

        for (let i = 0; i < data.length; i++) {
            if (data[i].seasonUuid == this.season) {
                return data[i].competitiveTiersUuid;
            }
        }
    }

    async getCompetitiveTiers() {
        const competitiveTiersUuid = await this.getCompetitiveTiersUuid();
        const res = await fetch(`https://valorant-api.com/v1/competitivetiers/${competitiveTiersUuid}`);
        const json = await res.json();
        return json.data.tiers;
    }

    async getPlayerMMR(puuid) {
        const res = await fetch(`https://pd.${this.region}.a.pvp.net/mmr/v1/players/${puuid}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${this.entitlements.accessToken}`,
                'X-Riot-Entitlements-JWT': this.entitlements.token,
                'X-Riot-ClientVersion': this.version,
                'X-Riot-ClientPlatform': "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"
            }
        })

        const data = await res.json();
        const competitiveStats = data.QueueSkills.competitive.SeasonalInfoBySeasonID;

        if (competitiveStats) {
            let peak = 0;

            for (const i in competitiveStats) {
                if (competitiveStats[i].Rank > peak) {
                    peak = competitiveStats[i].Rank;
                }
            }

            if (competitiveStats[this.season]) {
                return {
                    peak: peak,
                    rank: competitiveStats[this.season].Rank,
                    rr: competitiveStats[this.season].RankedRating
                }
            }
            return { peak: peak, rank: 0, rr: 0 }
        }
        return { peak: 0, rank: 0, rr: 0 }
    }

    async getPlayerRank(puuid) {
        const competitiveTiers = await this.getCompetitiveTiers();
        const playerCompetitive = await this.getPlayerMMR(puuid);

        for (let i = 0; i < competitiveTiers.length; i++) {
            if (competitiveTiers[i].tier == playerCompetitive.rank) {
                return {
                    peak: playerCompetitive.peak,
                    tier: competitiveTiers[i].tier,
                    image: competitiveTiers[i].largeIcon,
                    rr: playerCompetitive.rr
                }
            }
        }
    }

    async run() {
        const blue = this.players.Blue;
        const red = this.players.Red;

        for (let i = 0; i < blue.length; i++) {
            const rankData = await this.getPlayerRank(blue[i].puuid);
            this.matchPlayers.Blue.push({
                puuid: blue[i].puuid,
                ign: blue[i].ign,
                level: blue[i].level,
                character: blue[i].character,
                stats: {
                    peak: rankData.peak,
                    rank: rankData.image,
                    rr: rankData.rr,
                    headshot: blue[i].stats.headshot,
                    win: blue[i].stats.win,
                    kd: blue[i].stats.kd
                }
            });
        }

        for (let i = 0; i < red.length; i++) {
            const rankData = await this.getPlayerRank(red[i].puuid);
            this.matchPlayers.Red.push({
                puuid: red[i].puuid,
                ign: `${red[i].name}#${red[i].tag}`,
                level: red[i].level,
                character: red[i].character,
                stats: {
                    peak: rankData.peak,
                    rank: rankData.image,
                    rr: rankData.rr,
                    headshot: red[i].stats.headshot,
                    win: red[i].stats.win,
                    kd: red[i].stats.kd
                }
            });
        }

        this.matchPlayers = this.matchPlayers;
    }
}

module.exports = Rank;