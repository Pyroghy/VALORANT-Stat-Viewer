const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const self = process.app;

void function getLockfile() {
    const lockfile = path.join(process.env.LOCALAPPDATA, 'Riot Games/Riot Client/Config/lockfile');
    const keys = ['name', 'PID', 'port', 'password', 'protocol'];
    const data = fs.readFileSync(lockfile, 'utf-8').split(':');

    for (let i = 0; i < keys.length; i++) {
        self.lockfile[keys[i]] = data[i];
    }
}();

class Client {
    async getGameVersion() {
        const res = await fetch('https://valorant-api.com/v1/version');
        const json = await res.json();
        self.version = json.data.riotClientVersion;
    }

    async getCurrentSeason() {
        const res = await fetch(`https://shared.${self.region}.a.pvp.net/content-service/v3/content`, {
            method: "GET",
            headers: {
                'X-Riot-ClientVersion': self.version,
                'X-Riot-ClientPlatform': "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"
            }
        });

        const data = await res.json();
        const season = data.Seasons.find(e => e.IsActive && e.Type === 'act');
        self.season = season.ID;
    }

    async getEntitlements() {
        const res = await fetch(`https://127.0.0.1:${self.lockfile.port}/entitlements/v1/token`, {
            method: "GET",
            headers: {
                'Authorization': `Basic ${Buffer.from(`riot:${self.lockfile.password}`).toString('base64')}`
            }
        });

        const data = await res.json();
        self.puuid = data.subject;
        self.entitlements.accessToken = data.accessToken;
        self.entitlements.token = data.token;
    }

    async run() {
        await this.getGameVersion();
        await this.getCurrentSeason();
        await this.getEntitlements();
    }
}

module.exports = new Client();