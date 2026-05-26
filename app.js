import {
  fetchSalesData,
  fetchClubConfig,
  fetchTeams
} from './data.js';

let rawData = [];

let clubConfig = {};

let teamConfig = [];

const urlParams =
  new URLSearchParams(window.location.search);

const preselectedTeam =
  urlParams.get("team");

const allView =
  preselectedTeam === "Alla";

const filterSection =
  document.querySelector(".filters");

async function init() {

  rawData =
    await fetchSalesData();

  clubConfig =
    await fetchClubConfig();

  teamConfig =
    await fetchTeams();

  populateFilter(rawData);

  // ========================================
  // DÖLJ FILTER VID LAG-URL
  // ========================================

  if (preselectedTeam) {

    filterSection.style.display = "none";

    document.getElementById("teamFilter").value =
      preselectedTeam;

  }

  // ========================================
  // GLOBALA KPI
  // ========================================

  renderGlobal(rawData);

  // ========================================
  // FILTRERAD DETALJDATA
  // ========================================

  const filteredData =
  preselectedTeam && !allView
    ? rawData.filter(
        r => r.lag === preselectedTeam
      )
    : rawData;

  renderDetails(filteredData);

  renderProductChart(filteredData);

}

function populateFilter(data) {

  const teams =
    [...new Set(data.map(r => r.lag))]
      .sort();

  const select =
    document.getElementById("teamFilter");

  teams.forEach(team => {

    const option =
      document.createElement("option");

    option.value =
      team;

    option.textContent =
      team;

    select.appendChild(option);

  });

  select.addEventListener("change", () => {

    const selected =
      select.value;

    const filtered =
      selected === "Alla"
        ? rawData
        : rawData.filter(
            r => r.lag === selected
          );

    renderDetails(filtered);

    renderProductChart(filtered);

  });

}

// ========================================
// GLOBAL RENDERING
// ========================================

function renderGlobal(data) {

  let total = 0;

  let totalToalett = 0;

  let totalHushall = 0;

  const players = {};

  data.forEach(r => {

    total += r.total;

    totalToalett += r.toalett;

    totalHushall += r.hushall;

    if (!players[r.spelare]) {

      players[r.spelare] = true;

    }

  });

  // ========================================
  // OMSÄTTNING
  // ========================================

  const totalRevenue =
    (
      totalToalett
      *
      Number(clubConfig.ToapapperPris)
    )
    +
    (
      totalHushall
      *
      Number(clubConfig.HushållspapperPris)
    );

  // ========================================
  // VINST
  // ========================================

  const totalProfit =
    (
      totalToalett
      *
      Number(clubConfig.ToapapperVinst)
    )
    +
    (
      totalHushall
      *
      Number(clubConfig.HushållspapperVinst)
    );

  // ========================================
  // TOTALT MÅL
  // ========================================

  const totalGoal =
    teamConfig
      .filter(t => t.aktiv === 1)
      .reduce(
        (sum, t) => sum + t.mal,
        0
      );

  const goalPercent =
    totalGoal > 0
      ? Math.round(
          (total / totalGoal) * 100
        )
      : 0;

  // ========================================
  // KPI
  // ========================================

  document.getElementById("total").innerText =
    total;

  document.getElementById("teamCount").innerText =
    teamConfig.filter(
      t => t.aktiv === 1
    ).length;

  document.getElementById("playerCount").innerText =
    Object.keys(players).length;

  // ========================================
  // OMSÄTTNING
  // ========================================

  if (document.getElementById("revenue")) {

    document.getElementById("revenue").innerText =
      totalRevenue.toLocaleString("sv-SE")
      +
      " kr";

  }

  // ========================================
  // VINST
  // ========================================

  if (document.getElementById("profit")) {

    document.getElementById("profit").innerText =
      totalProfit.toLocaleString("sv-SE")
      +
      " kr";

  }

  // ========================================
  // GLOBAL MÅLPROGRESS
  // ========================================

  document.getElementById("goal").innerText =
    total
    +
    " / "
    +
    totalGoal;

  document.getElementById("goalPercent").innerText =
    goalPercent + "%";

  document.getElementById("clubProgressFill").style.width =
    Math.min(goalPercent, 100)
    +
    "%";

}

// ========================================
// DETALJRENDERING
// ========================================

function renderDetails(data) {

  const players = {};

  const teams = {};

  data.forEach(r => {

    if (!players[r.spelare]) {

      players[r.spelare] = {
        lag: r.lag,
        total: 0
      };

    }

    players[r.spelare].total += r.total;

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

  const selectedTeam =
    document.getElementById("teamFilter")?.value || "Alla";

  const showPlayers =
    !allView
    &&
    (
      selectedTeam !== "Alla"
      ||
      !!preselectedTeam
    );

  document.getElementById("toplistTitle").innerText =
    showPlayers
      ? "Toppsäljare"
      : "Topplag";

  // ========================================
  // TOPPLISTA
  // ========================================

  if (showPlayers) {

    const sortedPlayers =
      Object.entries(players)
        .sort((a,b) => b[1].total - a[1].total);

    document.getElementById("toplist").innerHTML =
      sortedPlayers
        .slice(0,10)
        .map(([name, obj], index) => `

          <div class="player-card">

            <div class="rank">
              #${index + 1}
            </div>

            <h3>
              ${name}
            </h3>

            <div class="team-name">
              ${obj.lag}
            </div>

            <div class="value">
              ${obj.total}
            </div>

          </div>

        `).join("");

  }
  else {

    const sortedTeams =
      Object.entries(teams)
        .sort((a,b) => b[1].total - a[1].total);

    document.getElementById("toplist").innerHTML =
      sortedTeams
        .slice(0,10)
        .map(([team, obj], index) => `

          <div class="player-card">

            <div class="rank">
              #${index + 1}
            </div>

            <h3>
              ${team}
            </h3>

            <div class="team-name">
              Lag
            </div>

            <div class="value">
              ${obj.total}
            </div>

          </div>

        `).join("");

  }

  // ========================================
  // LAG
  // ========================================

  const teamContainer =
    document.getElementById("teams");

  teamContainer.innerHTML =
    Object.entries(teams)
      .sort((a,b) => b[1].total - a[1].total)
      .map(([team, obj]) => {

        const sortedPlayers =
          Object.entries(obj.players)
            .sort((a,b) => b[1] - a[1]);

        const teamGoal =
          teamConfig.find(
            t => t.lag === team
          )?.mal || 0;

        const percent =
          teamGoal > 0
            ? Math.round(
                (obj.total / teamGoal) * 100
              )
            : 0;

        if (allView) {

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

            </div>

          `;

        }

        return `

          <div class="team-card">

            <button
              class="team-toggle ${preselectedTeam === team ? 'active' : ''}"
              onclick="toggleTeam(this)">

              <div class="team-toggle-header">

                <h3>
                  ${team}
                </h3>

                <span class="toggle-icon">
                  ${preselectedTeam === team ? '−' : '+'}
                </span>

              </div>

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

            </button>

            <div class="team-content ${preselectedTeam === team ? 'open' : ''}">

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

          </div>

        `;

      }).join("");

}

function renderProductChart(data) {

  let totalToalett = 0;
  let totalHushall = 0;

  data.forEach(r => {

    totalToalett += r.toalett;
    totalHushall += r.hushall;

  });

  const total =
    totalToalett + totalHushall;

  const toalettPercent =
    total > 0
      ? Math.round(
          (totalToalett / total) * 100
        )
      : 0;

  const hushallPercent =
    total > 0
      ? Math.round(
          (totalHushall / total) * 100
        )
      : 0;

  document.getElementById(
    "productDistribution"
  ).innerHTML = `

    <div class="distribution-row">

      <div class="distribution-header">

        <span>
          🧻 Toalettpapper
        </span>

        <span>
          ${totalToalett} balar (${toalettPercent}%)
        </span>

      </div>

      <div class="progress-bar">

        <div
          class="progress-fill"
          style="width:${toalettPercent}%;">
        </div>

      </div>

    </div>

    <div class="distribution-row">

      <div class="distribution-header">

        <span>
          🧻 Hushållspapper
        </span>

        <span>
          ${totalHushall} balar (${hushallPercent}%)
        </span>

      </div>

      <div class="progress-bar">

        <div
          class="progress-fill"
          style="width:${hushallPercent}%;">
        </div>

      </div>

    </div>

  `;

}

window.toggleTeam = function(button) {

  const content =
    button.nextElementSibling;

  const icon =
    button.querySelector(".toggle-icon");

  const isOpen =
    content.classList.contains("open");

  if (isOpen) {

    content.classList.remove("open");

    button.classList.remove("active");

    icon.innerText = "+";

  }
  else {

    content.classList.add("open");

    button.classList.add("active");

    icon.innerText = "−";

  }

}

init();
