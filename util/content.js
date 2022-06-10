const fetch = require('node-fetch');
const self = process.app;

async function getCompetitiveTiers() {
    return fetch('https://valorant-api.com/v1/seasons/competitive').then(res => res.json()).then(json => {
        const data = json.data.find(e => e.seasonUuid === self.season);
        return fetch(`https://valorant-api.com/v1/competitivetiers/${data.competitiveTiersUuid}`).then(res => res.json()).then(json => {
            return json.data.tiers;
        });
    });
}

module.exports = async function() {
    process.content = {};
    process.content.competitiveTiers = await getCompetitiveTiers();
}