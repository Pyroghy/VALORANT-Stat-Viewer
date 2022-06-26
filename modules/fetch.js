const nodeFetch = require('node-fetch');
const self = process.app;

async function fetch(url, headers = {}) {
    if (url.startsWith('https://pd')) {
        headers = {
            "Authorization": `Bearer ${self.entitlements.accessToken}`,
            "X-Riot-Entitlements-JWT": self.entitlements.token,
            "X-Riot-ClientVersion": self.version,
            "X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"
        }
    }
    if (url.startsWith('https://glz')) {
        headers = {
            "Authorization": `Bearer ${self.entitlements.accessToken}`,
            "X-Riot-Entitlements-JWT": self.entitlements.token
        }
    }
    if (url.startsWith('https://valorant-api')) {
        return nodeFetch(url).then(res => res.json()).then(json => json.data);
    }
    if (url.startsWith('https://shared')) {
        headers = {
            'X-Riot-ClientVersion': self.version,
            'X-Riot-ClientPlatform': "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"
        }
    }
    if (url.startsWith('https://127')) {
        return nodeFetch(url, { method: "GET", headers: headers }).then(res => res.json()).then(data => data);
    }

    return nodeFetch(url, { method: "GET", headers: headers }).then(res => res.json()).then(data => data);
}

module.exports = fetch;