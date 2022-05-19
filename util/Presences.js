const fetch = require('node-fetch');

module.exports = class Presences {
    constructor(user) {
        this.lockfile = user.lockfile;
        this.presences = [];
    }

    async getPresences() {
        const res = await fetch(`https://127.0.0.1:${this.lockfile.port}/chat/v4/presences`, {
            method: "GET",
            headers: {
                'Authorization': `Basic ${Buffer.from(`riot:${this.lockfile.password}`).toString('base64')}`
            }
        });

        const data = await res.json();
        this.presences = data.presences.filter(u => u.product === 'valorant');
    }

    async run() {
        await this.getPresences();
    }
}