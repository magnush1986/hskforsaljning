const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTZbyYpAEx8kmIsLFHuSgWi2KoYxAW1eY_XhQNQhcynNbSJSLs2eFtWcycWOhGw-5aIGe6di2yWGo_g/pub?output=csv";

export async function fetchSalesData() {

  const res = await fetch(csvUrl);
  const text = await res.text();

  const rows = text.split("\n").slice(1);

  return rows
    .filter(r => r.trim() !== "")
    .map(row => {

      // Hantera citattecken och ev. kommatecken i text
      const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(c => c.replace(/^"|"$/g, "")) || [];

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
