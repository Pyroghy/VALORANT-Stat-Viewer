process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const User = require('./util/User');
const Game = require('./util/Game');
const Match = require('./util/Match');
const Rank = require('./util/Rank');
const Presences = require('./util/Presences');
const Player = require('./util/Player');

async function getAgent(agent) {
    const res = await fetch(`https://valorant-api.com/v1/agents/${agent}`)
    const json = await res.json()
    const data = json.data;

    return {
        name: data.displayName,
        image: data.displayIcon
    }
}

void async function init() {
    const user = new User();
    await user.run();

    const presences = new Presences(user);
    await presences.run();

    const game = new Game(user);
    await game.run('core-game'); // pregame and core-game - get game state

    const match = new Match(user, game);
    await match.run();

    const rank = new Rank(user, match);
    await rank.run();

    const player = new Player(rank, presences);
    await player.run();

    const blue = document.getElementById('Blue');
    const red = document.getElementById('Red');

    // not for dm

    const blueTeam = player.matchData.filter(u => u.team === 'Blue');
    const redTeam = player.matchData.filter(u => u.team === 'Red');

    for (let i = 0; i < blueTeam.length; i++) {
        const agent = await getAgent(blueTeam[i].character);
        const player = document.createElement('div');

        player.className = 'player'
        player.style.borderBottom = `2px solid #${blueTeam[i].party.substring(0, 6)}`;
        player.style.borderLeft = `2px solid #${blueTeam[i].party.substring(0, 6)}`;
        player.innerHTML = `<div class="agent-info">
            <img class="img" src="${agent.image}">
            <div class="value" style="color: white">${agent.name}</div>
        </div>
        <div class="player-info">
            <div class="details"><span>[${blueTeam[i].level}] ${blueTeam[i].ign}</span></div>
            <div class="stats">
                <div style="color: #${blueTeam[i].stats.peakColor}; text-indent: 1vw;">${blueTeam[i].stats.peak} Peak</div>
                <div style="color: ${blueTeam[i].stats.kd >= 1 ? 'lightgreen' : 'crimson'};">${blueTeam[i].stats.kd} KD</div> 
                <div style="color: white; text-indent: -4vw;">${blueTeam[i].stats.win} Win Rate</div>
                <div style="color: white; text-indent: -4vw;">${blueTeam[i].stats.headshot} Headshot</div>
            </div>
        </div>
        <div class="player-rank">
            <img class="img" src="${blueTeam[i].stats.rankImage}">
            <div class="value" style="color: white">${blueTeam[i].stats.rankedRating} RR</div>
        </div>`;

        blue.appendChild(player);
    }

    for (let i = 0; i < redTeam.length; i++) {
        const agent = await getAgent(redTeam[i].character);
        const player = document.createElement('div');

        player.className = 'player'
        player.style.borderBottom = `2px solid #${redTeam[i].party.substring(0, 6)}`;
        player.style.borderLeft = `2px solid #${redTeam[i].party.substring(0, 6)}`;
        player.innerHTML = `<div class="agent-info">
            <img class="img" src="${agent.image}">
            <div class="value" style="color: white">${agent.name}</div>
        </div>
        <div class="player-info">
            <div class="details"><span>[${redTeam[i].level}] ${redTeam[i].ign}</span></div>
            <div class="stats">
                <div style="color: #${redTeam[i].stats.peakColor}; text-indent: 1vw;">${redTeam[i].stats.peak} Peak</div>
                <div style="color: ${redTeam[i].stats.kd >= 1 ? 'lightgreen' : 'crimson'};">${redTeam[i].stats.kd} KD</div> 
                <div style="color: white; text-indent: -4vw;">${redTeam[i].stats.win} Win Rate</div>
                <div style="color: white; text-indent: -4vw;">${redTeam[i].stats.headshot} Headshot</div>
            </div>
        </div>
        <div class="player-rank">
            <img class="img" src="${redTeam[i].stats.rankImage}">
            <div class="value" style="color: white">${redTeam[i].stats.rankedRating} RR</div>
        </div>`;

        red.appendChild(player);
    }
}();