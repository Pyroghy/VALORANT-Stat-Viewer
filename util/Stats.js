const { getMatchHistory } = require('./Match.js');
const fetch = require('../modules/fetch');
const self = process.app;

async function getPlayerStats(puuid) {
    let wins = [];
    let kills = 0;
    let deaths = 0;
    let shots = 0;
    let headshots = 0;

    let score = 0;
    let damage = 0;
    let roundsPlayed = 0;

    return await Promise.resolve(getMatchHistory(puuid)).then(async (matchHistory) => {
        const promises = matchHistory.map(match => fetch(`https://pd.${self.region}.a.pvp.net/match-details/v1/matches/${match}`));
        await Promise.all(promises).then(data => data.map(match => {
            const rounds = match.roundResults;
            const player = match.players.find(e => e.subject === puuid);
            const team = match.teams.find(e => e.teamId === player.teamId);

            kills += player.stats.kills;
            deaths += player.stats.deaths;
            score += player.stats.score;
            roundsPlayed += player.stats.roundsPlayed;
            wins.push(team.won);

            for (let j = 0; j < rounds.length; j++) {
                const round = rounds[j].playerStats.find(e => e.subject === puuid);
                const roundDamage = round.damage;

                for (let d = 0; d < roundDamage.length; d++) {
                    shots += roundDamage[d].legshots + roundDamage[d].bodyshots + roundDamage[d].headshots;
                    damage += roundDamage[d].damage;
                    headshots += roundDamage[d].headshots;
                }
            }
        }));

        return {
            wins: wins,
            stats: {
                hs: `${Math.round((headshots / shots) * 100)}%`,
                kd: (kills / deaths).toFixed(2),
                adr: Math.round(damage / roundsPlayed),
                acs: Math.round(score / roundsPlayed)
            }
        }
    });
}

async function getPlayerRank(puuid) {
    return fetch(`https://pd.${self.region}.a.pvp.net/mmr/v1/players/${puuid}`).then(data => {
        const competitiveStats = data.QueueSkills.competitive.SeasonalInfoBySeasonID;
        const competitiveTiers = process.content.competitiveTiers;
        const rank = {
            peak: "UNRATED",
            peakColor: "#FFFFFF",
            rankImage: "https://media.valorant-api.com/competitivetiers/e4e9a692-288f-63ca-7835-16fbf6234fda/0/smallicon.png",
            rankRating: "0"
        }

        if (competitiveStats) {
            const peak = Math.max(...Object.values(competitiveStats).map(e => e.CompetitiveTier));
            const competitivePeak = competitiveTiers.find(e => e.tier === peak);
            rank.peak = competitivePeak.tierName;
            rank.peakColor = competitivePeak.color;

            if (competitiveStats[self.season]) {
                const competitiveRank = competitiveTiers.find(e => e.tier === competitiveStats[self.season].Rank);
                rank.rankImage = competitiveRank.smallIcon;
                rank.rankRating = competitiveStats[self.season].RankedRating;
                return { rank }
            }
            return { rank }
        }
        return { rank }
    });
}

module.exports = {
    getPlayerStats,
    getPlayerRank
}