process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
process.app = {};
process.app.lockfile = {};
process.app.entitlements = {};
process.app.region = "na";
process.app.version = "";
process.app.season = "";
process.app.puuid = "";

const client = require('./util/Client');
const match = require('./util/Match');
const content = require('./util/content');
const { getPlayerPresence } = require('./util/Presences');
const render = require('./modules/render');

window.addEventListener('load', async () => {
    await client.run();
    await content();
    let game;

    setInterval(async () => {
        const status = await getPlayerPresence();
    
        if (game !== status) {
            game = status;

            if (status === 'PREGAME') {
                const matchData = await match.getPlayers('pregame');
                render('pregame', matchData);
            }
            if (status === 'INGAME') {
                const matchData = await match.getPlayers('core-game');
                render('core-game', matchData);
            }
        }
    }, 1000);
});