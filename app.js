import { fetchSalesData } from './data.js';

let rawData = [];

async function init() {

  rawData = await fetchSalesData();

  populateFilter(rawData);

  render(rawData);

}

function populateFilter(data) {

  const teams = [...new Set(data.map(r => r.lag))].sort();

  const select = document.getElementById("teamFilter");

  teams.forEach(team => {

    const option = document.createElement("option");

    option.value = team;
    option.textContent = team;

    select.appendChild(option);

  });

  select.addEventListener("change", () => {

    const selected = select.value;

    const filtered = selected === "Alla"
      ? rawData
      : rawData.filter(r => r.lag === selected);

    render(filtered);

  });

}

function render(data) {

  let total = 0;

  const players = {};
  const teams = {};

  data.forEach(r => {

    total += r.total;

    // spelare
    if (!players[r.spelare]) {

      players[r.spelare] = {
        lag: r.lag,
        total: 0
      };

    }

    players[r.spelare].total += r.total;

    // lag
    if (!teams[r.lag]) {

      teams[r.lag] = {
        total: 0,
        players: {}
      };

    }

    teams[r.lag].total += r.total;

    if (!teams[r.lag].players[r.spelare]) {

      teams[r.lag].players[r.spelare] = 0;

    }

    teams[r.lag].players[r.spelare] += r.total;

  });

  // KPI
  document.getElementById("total").innerText = total;
  document.getElementById("teamCount").innerText = Object.keys(teams).length;
  document.getElementById("playerCount").innerText = Object.keys(players).length;

  // toplista
  const sortedPlayers = Object.entries(players)
    .sort((a,b) => b[1].total - a[1].total);

  document.getElementById("toplist").innerHTML = sortedPlayers
    .slice(0,10)
    .map(([name, obj], index) => `

      <div class="player-card">

        <div class="rank">#${index + 1}</div>

        <h3>${name}</h3>

        <div class="team-name">${obj.lag}</div>

        <div class="value">${obj.total}</div>

      </div>

    `).join("");

  // lag
  const teamContainer = document.getElementById("teams");

  teamContainer.innerHTML = Object.entries(teams)
    .sort((a,b) => b[1].total - a[1].total)
    .map(([team, obj]) => {

      const sortedPlayers = Object.entries(obj.players)
        .sort((a,b) => b[1] - a[1]);

      return `

        <div class="team-card">

          <h3>${team}</h3>

          ${sortedPlayers.map(([name, total]) => `

            <div class="team-row">

              <span class="name">${name}</span>

              <span class="total">${total}</span>

            </div>

          `).join("")}

        </div>

      `;

    }).join("");

}

init();
