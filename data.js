const salesUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTZbyYpAEx8kmIsLFHuSgWi2KoYxAW1eY_XhQNQhcynNbSJSLs2eFtWcycWOhGw-5aIGe6di2yWGo_g/pub?output=csv";

const clubUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSmzvSAwaB1GqDBcJayz35ZoPpS2SYVih9cd06xpLiNmekGjt-vnFQR574iyYHMo_ZWWNPBEM6amQd/pub?gid=1902328772&single=true&output=csv";

const teamUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQSmzvSAwaB1GqDBcJayz35ZoPpS2SYVih9cd06xpLiNmekGjt-vnFQR574iyYHMo_ZWWNPBEM6amQd/pub?gid=0&single=true&output=csv";

function parseCsvRow(row) {

  return row.match(/(".*?"|[^",]+)(?=,|$)/g)
    ?.map(c => c.replace(/^"|"$/g, "").trim()) || [];

}

// ========================================
// FÖRSÄLJNING
// ========================================

export async function fetchSalesData() {

  const res = await fetch(salesUrl);

  const text = await res.text();

  const rows = text.split("\n").slice(1);

  return rows
    .filter(r => r.trim() !== "")
    .map(row => {

      const cols = parseCsvRow(row);

      const toalett = parseInt(cols[5]) || 0;
      const hushall = parseInt(cols[6]) || 0;

      return {

        timestamp: cols[0],
        lag: cols[1],
        spelare: cols[2],
        namn: cols[3],
        telefon: cols[4],

        toalett,
        hushall,

        total: toalett + hushall

      };

    });

}

// ========================================
// KLUBBVARIABLER
// ========================================

export async function fetchClubConfig() {

  const res = await fetch(clubUrl);

  const text = await res.text();

  const rows = text.split("\n").slice(1);

  const config = {};

  rows.forEach(row => {

    const cols = parseCsvRow(row);

    config[cols[0]] = cols[1];

  });

  return config;

}

// ========================================
// LAG
// ========================================

export async function fetchTeams() {

  const res = await fetch(teamUrl);

  const text = await res.text();

  const rows = text.split("\n").slice(1);

  return rows
    .filter(r => r.trim() !== "")
    .map(row => {

      const cols = parseCsvRow(row);

      return {

        lag: cols[0],
        aktiv: Number(cols[1]),
        sortering: Number(cols[2]),
        mal: Number(cols[3])

      };

    });

}
