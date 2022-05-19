const fetch = require('node-fetch');

module.exports = class Rank {
    constructor(user, match) {
        this.puuid = user.puuid;
        this.region = user.region;
        this.season = user.season;
        this.version = user.version;
        this.entitlements = user.entitlements;
        this.matchData = match.matchData;
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
        let peak = 0;

        if (competitiveStats) {
            for (const i in competitiveStats) {
                if (competitiveStats[i].Rank > peak) {
                    peak = competitiveStats[i].Rank;
                }
            }

            if (competitiveStats[this.season]) {
                return { peak: peak, rank: competitiveStats[this.season].Rank, rankedRating: competitiveStats[this.season].RankedRating }
            }
            return { peak: peak, rank: 0, rankedRating: 0 }
        }
        return { peak: peak, rank: 0, rankedRating: 0 }
    }

    async getPlayerRank(competitiveTiers, playerCompetitive) {
        for (let i = 0; i < competitiveTiers.length; i++) {
            if (competitiveTiers[i].tier == playerCompetitive.rank) {
                return {
                    rank: competitiveTiers[i].tierName,
                    rankImage: competitiveTiers[i].largeIcon,
                    rankedRating: playerCompetitive.rankedRating
                }
            }
        }
    }

    async getPlayerPeak(competitiveTiers, playerCompetitive) {
        for (let i = 0; i < competitiveTiers.length; i++) {
            if (competitiveTiers[i].tier == playerCompetitive.peak) {
                return {
                    peak: competitiveTiers[i].tierName,
                    peakColor: competitiveTiers[i].color
                }
            }
        }
    }

    async run() {
        const competitiveTiers = await this.getCompetitiveTiers();

        for (let i = 0; i < this.matchData.length; i++) {
            const playerCompetitive = await this.getPlayerMMR(this.matchData[i].puuid);
            const rankData = await this.getPlayerRank(competitiveTiers, playerCompetitive);
            const peakData = await this.getPlayerPeak(competitiveTiers, playerCompetitive);
            this.matchData[i].stats = { ...this.matchData[i].stats,  ...rankData, ...peakData };
        }
    }
}