module.exports = class Player {
    constructor(rank, presences) {
        this.matchData = rank.matchData;
        this.presences = presences.presences;
    }

    decodePrivate(string) {
        const base64 = Buffer.from(string, 'base64').toString('utf-8')
        return JSON.parse(base64);
    }

    async getPlayers() {
        for (let i = 0; i < this.matchData.length; i++) {
            const player = this.presences.find(u => u.puuid === this.matchData[i].puuid);
            const privateData = this.decodePrivate(player.private);

            this.matchData[i].ign = `${player.game_name}#${player.game_tag}`;
            this.matchData[i].level = privateData.accountLevel;
            this.matchData[i].party = privateData.partyId;
        }
    }

    async run() {
        await this.getPlayers();
    }
}