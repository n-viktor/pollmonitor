function randomColor() {
  const r = () => Math.floor(Math.random() * 256);
  return `rgb(${r()}, ${r()}, ${r()})`;
}

function rajzolLegfrissebbOszlopdiagram(containerId) {
  fetch("data/adatok.json")
  .then(res => res.json())
  .then(data => {
    console.log("Adatok betöltve:", data);

    const filtered = data
      .filter(p => p.kor === "biztos pártválasztók")
      .sort((a, b) => new Date(b.datum) - new Date(a.datum))
      .slice(0, 3);

    console.log("Szűrt 3 kutatás:", filtered);
  })
  .catch(err => console.error("Hiba a fetch-ben:", err));
}

function rajzolTrendPontdiagram(canvasId) {
  fetch("data/adatok.json")
    .then(res => res.json())
    .then(data => {
      const most = new Date();
      const hatHonap = new Date();
      hatHonap.setMonth(hatHonap.getMonth() - 6);

      const filtered = data.filter(p =>
        p.kor === "biztos pártválasztók" &&
        new Date(p.datum) >= hatHonap
      );

      const parties = Object.keys(filtered[0]?.eredmenyek || {});
      const pointsPerParty = {};
      parties.forEach(p => pointsPerParty[p] = []);

      filtered.forEach(kutatas => {
        parties.forEach(p => {
          pointsPerParty[p].push({
            x: kutatas.datum,
            y: kutatas.eredmenyek[p]
          });
        });
      });

      const datasets = parties.map(party => ({
        label: party,
        data: pointsPerParty[party],
        showLine: true,
        borderColor: randomColor(),
        backgroundColor: "rgba(0,0,0,0)",
        tension: 0.3
      }));

      new Chart(document.getElementById(canvasId), {
        type: "scatter",
        data: {
          datasets
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: "time",
              time: {
                unit: "month",
                tooltipFormat: "yyyy-MM-dd"
              },
              title: { display: true, text: "Dátum" }
            },
            y: {
              min: 0,
              max: 100,
              title: { display: true, text: "%" }
            }
          },
          plugins: {
            title: {
              display: true,
              text: "Elmúlt 6 hónap eredményei – biztos pártválasztók"
            }
          }
        }
      });
    });
}

// Automatikus inicializálás
window.addEventListener("DOMContentLoaded", () => {
  rajzolLegfrissebbOszlopdiagram("legfrissebb-container");
  rajzolTrendPontdiagram("trend-canvas");
});