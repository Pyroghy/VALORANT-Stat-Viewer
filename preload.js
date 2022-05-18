const User = require('./funcs/User.js');
const Rank = require('./funcs/Rank.js');
const Match = require('./funcs/Match.js');
const Stats = require('./funcs/Stats.js');

async function getAgent(agent) {
    const res = await fetch(`https://valorant-api.com/v1/agents/${agent}`)
    const json = await res.json()
    const data = json.data;

    return {
        name: data.displayName,
        image: data.displayIcon
    }
}

async function loadPlayers(team, players) {
    for (let i = 0; i < team.length; i++) {
        const agent = await getAgent(team[i].character);

        players[i].innerHTML = `
            <div class="agent">
                <img class="agent-img" src="${agent.image}">
            </div>
            
            <div class="info">
                <div>
                    <p class="agent-name">${agent.name}</p>
                    <p>[${team[i].level}] ${team[i].ign}</p>
                </div>
            </div>
            
            <div class="stats">
                <div>PEAK: ${team[i].stats.peak}</div>
                <div>KD Ratio: ${team[i].stats.kd}</div>
                <div>Win Ratio: ${team[i].stats.win}</div>
                <div>HS Ratio: ${team[i].stats.headshot}</div>
            </div>
            
            <div class="rank">
                <img class="rank-img" src="${team[i].stats.rank}">
                <div class="rr">${team[i].stats.rr} RR</div>
            </div>`;
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    const user = new User();
    await user.run();

    const match = new Match(user);
    await match.run();

    const stats = new Stats(user, match);
    await stats.run();

    const rank = new Rank(user, match);
    await rank.run();

    const blue = rank.matchPlayers.Blue;
    const bluePlayers = document.getElementById('bluePlrs');

    await loadPlayers(blue, bluePlayers.children);

    const red = rank.matchPlayers.Red;
    const redPlayers = document.getElementById('redPlrs');

    await loadPlayers(red, redPlayers.children);
});