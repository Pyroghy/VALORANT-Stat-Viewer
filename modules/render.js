function createPlayerModule(parent, player, color) {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player'
    playerDiv.style.borderBottom = `2px solid ${color}`;
    playerDiv.style.borderLeft = `2px solid ${color}`;
    playerDiv.innerHTML = `
        <section class="player-info">
            <section class="top">
                <section class="info">
                    <section class="basic">
                        <img src="https://media.valorant-api.com/agents/${player.characterId}/displayicon.png">
                        <span>${player.level}</span>
                    </section>

                    <section class="container">
                        <section class="main">
                            <span class="name">${player.username}</span>

                            <div class="stats">
                                <span><b>${player.stats.kd}</b> KD</span>
                                <span style="text-indent: 15px"><b>${player.stats.hs}</b> HS</span>
                                <span style="text-indent: 15px"><b>${player.stats.adr}</b> ADR</span>
                                <span style="text-indent: 15px"><b>${player.stats.acs}</b> ACS</span>
                            </div>
                        </section>
                    </section>
                </section>
            </section>

            <section class="bottom">
                <section class="wins">
                    <div class="results">
                        <span style="color: ${player.wins[0] ? 'lightgreen">W' : 'crimson">L'}</span>
                        <span style="color: ${player.wins[1] ? 'lightgreen">W' : 'crimson">L'}</span>
                        <span style="color: ${player.wins[2] ? 'lightgreen">W' : 'crimson">L'}</span>
                        <span style="color: ${player.wins[3] ? 'lightgreen">W' : 'crimson">L'}</span>
                        <span style="color: ${player.wins[4] ? 'lightgreen">W' : 'crimson">L'}</span>
                    </div>
                </section>
            
                <span class="peak" style="color: #${player.rank.peakColor}">${player.rank.peak} PEAK</span>
            </section>
        </section>

        <section class="rank">
            <img src="${player.rank.rankImage}">
            <span>${player.rank.rankRating} RR</span>
        </section>
    `;

    parent.appendChild(playerDiv);
}

function getPartyColor(parties) {
    const colors = ['#0087ff', '#af0000', '#5f8700', '#af8700', '#af005f', '#d75f00'];
    const partyColors = {};

    for (let i = 0, j = 0; i < parties.length; i++) {
        let dupes = parties.filter(e => e === parties[i])

        if (!partyColors[parties[i]]) {
            partyColors[parties[i]] = dupes.length > 1 ? colors[j++] : '#262626';
        }
    }

    return partyColors;
}

function render(gameState, matchData) {
    const blue = document.getElementById('Blue');
    const red = document.getElementById('Red');

    const parties = matchData.map(e => e.party);
    const partyColors = getPartyColor(parties);

    console.log(partyColors)

    if (gameState === 'pregame') {
        for (let i = 0; i < matchData.length; i++) {
            createPlayerModule(blue, matchData[i], partyColors[matchData[i].party] || '#262626');
        }
    }

    if (gameState === 'core-game') {
        const blueTeam = matchData.filter(e => e.team === 'Blue');
        const redTeam = matchData.filter(e => e.team === 'Red');

        if (redTeam.length === 0) {
            // can make this look better
            // prob a better way to do this
            for (let i = 0; i < blueTeam.length; i++) {
                if (i < (blueTeam.length / 2)) {
                    createPlayerModule(blue, blueTeam[i], partyColors[blueTeam[i].party] || '#262626');
                }
                else {
                    createPlayerModule(red, blueTeam[i], partyColors[blueTeam[i].party] || '#262626');
                }
            }
        }
        else {
            // prob combine these
            for (let i = 0; i < blueTeam.length; i++) {
                createPlayerModule(blue, blueTeam[i], partyColors[blueTeam[i].party] || '#262626');
            }

            for (let i = 0; i < redTeam.length; i++) {
                createPlayerModule(red, redTeam[i], partyColors[redTeam[i].party] || '#262626');
            }
        }

    }

}

module.exports = render;