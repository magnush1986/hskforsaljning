import {
  fetchSalesData,
  fetchClubConfig,
  fetchTeams
} from './data.js';

let rawData = [];

let clubConfig = {};

let teamConfig = [];

const urlParams = new URLSearchParams(window.location.search);

const preselectedTeam =
  urlParams.get("team");

async function init() {

  rawData = await fetchSalesData();

  clubConfig = await fetchClubConfig();

  teamConfig = await fetchTeams();

  populateFilter(rawData);

  if (preselectedTeam) {

  document.getElementById("teamFilter").value =
    preselectedTeam;

  rawData = rawData.filter(
    r => r.lag === preselectedTeam
  );

}
  
  render(
  preselectedTeam
    ? rawData.filter(r => r.lag === preselectedTeam)
    : rawData
);

}

function populateFilter(data) {

  const teams = [...new Set(data.map(r => r.lag))]
    .sort();

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

  let totalToalett = 0;

  let totalHushall = 0;

  const players = {};

  const teams = {};

  data.forEach(r => {

    total += r.total;

    totalToalett += r.toalett;

    totalHushall += r.hushall;

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

  // ========================================
  // OMSÄTTNING
  // ========================================

  const totalRevenue =
    (
      totalToalett * Number(clubConfig.ToapapperPris)
    )
    +
    (
      totalHushall * Number(clubConfig.HushållspapperPris)
    );

  // ========================================
  // VINST
  // ========================================

  const totalProfit =
    (
      totalToalett * Number(clubConfig.ToapapperVinst)
    )
    +
    (
      totalHushall * Number(clubConfig.HushållspapperVinst)
    );

  // ========================================
  // TOTALT MÅL
  // ========================================

  const totalGoal = teamConfig
    .filter(t => t.aktiv === 1)
    .reduce((sum, t) => sum + t.mal, 0);

  // ========================================
  // KPI
  // ========================================

  document.getElementById("total").innerText =
    total;

  document.getElementById("teamCount").innerText =
    teamConfig.filter(t => t.aktiv === 1).length;

  document.getElementById("playerCount").innerText =
    Object.keys(players).length;

  // ========================================
  // NYA KPI
  // ========================================

  if (document.getElementById("revenue")) {

    document.getElementById("revenue").innerText =
      totalRevenue.toLocaleString("sv-SE") + " kr";

  }

  if (document.getElementById("profit")) {

    document.getElementById("profit").innerText =
      totalProfit.toLocaleString("sv-SE") + " kr";

  }

  if (document.getElementById("goal")) {

    document.getElementById("goal").innerText =
      total + " / " + totalGoal;

  }

  // ========================================
  // TOPPLISTA
  // ========================================

  const sortedPlayers = Object.entries(players)
    .sort((a,b) => b[1].total - a[1].total);

  document.getElementById("toplist").innerHTML =
    sortedPlayers
      .slice(0,10)
      .map(([name, obj], index) => `

        <div class="player-card">

          <div class="rank">
            #${index + 1}
          </div>

          <h3>${name}</h3>

          <div class="team-name">
            ${obj.lag}
          </div>

          <div class="value">
            ${obj.total}
          </div>

        </div>

      `).join("");

  // ========================================
  // LAG
  // ========================================

  const teamContainer =
    document.getElementById("teams");

  teamContainer.innerHTML = Object.entries(teams)
    .sort((a,b) => b[1].total - a[1].total)
    .map(([team, obj]) => {

      const sortedPlayers = Object.entries(obj.players)
        .sort((a,b) => b[1] - a[1]);

      const teamGoal =
        teamConfig.find(t => t.lag === team)?.mal || 0;

      const percent =
        teamGoal > 0
          ? Math.round((obj.total / teamGoal) * 100)
          : 0;

      return `

        <div class="team-card">

          <h3>
            ${team}
          </h3>

          <div class="team-progress">

            <div class="team-progress-label">

              <span>
                ${obj.total} / ${teamGoal}
              </span>

              <span>
                ${percent}%
              </span>

            </div>

            <div class="progress-bar">

              <div
                class="progress-fill"
                style="width:${Math.min(percent,100)}%;">
              </div>

            </div>

          </div>

          ${sortedPlayers.map(([name, total]) => `

            <div class="team-row">

              <span class="name">
                ${name}
              </span>

              <span class="total">
                ${total}
              </span>

            </div>

          `).join("")}

        </div>

      `;

    }).join("");

}

init();
