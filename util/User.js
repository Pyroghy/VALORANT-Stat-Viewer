const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

module.exports = class User {
    constructor() {
        this.lockfile = {};
        this.getLockfile();
        this.puuid = "";
        this.region = "na";
        this.season = "";
        this.version = "";
        this.entitlements = {};
    }

    getLockfile() {
        const lockfile = path.join(process.env.LOCALAPPDATA, 'Riot Games/Riot Client/Config/lockfile');
        const keys = ['name', 'PID', 'port', 'password', 'protocol'];
        const data = fs.readFileSync(lockfile, 'utf-8').split(':');

        for (let i = 0; i < keys.length; i++) {
            this.lockfile[keys[i]] = data[i];
        }
    }

    async getGameVersion() {
        const res = await fetch('https://valorant-api.com/v1/version');
        const json = await res.json();
        this.version = json.data.riotClientVersion;
    }

    async getCurrentSeason() {
        const res = await fetch(`https://shared.${this.region}.a.pvp.net/content-service/v3/content`, {
            method: "GET",
            headers: {
                'X-Riot-ClientVersion': this.version,
                'X-Riot-ClientPlatform': "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"
            }
        })

        const data = await res.json();

        for (let i = 0; i < data.Seasons.length; i++) {
            if (data.Seasons[i].IsActive && data.Seasons[i].Type == "act") {
                this.season = data.Seasons[i].ID;
            }
        }
    }

    async getEntitlements() {
        const res = await fetch(`https://127.0.0.1:${this.lockfile.port}/entitlements/v1/token`, {
            method: "GET",
            headers: {
                'Authorization': `Basic ${Buffer.from(`riot:${this.lockfile.password}`).toString('base64')}`
            }
        });

        const data = await res.json();
        this.puuid = data.subject;
        this.entitlements.accessToken = data.accessToken;
        this.entitlements.token = data.token;
    }

    async run() {
        await this.getGameVersion();
        await this.getCurrentSeason();
        await this.getEntitlements();
    }
}