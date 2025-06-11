function randomColor() {
  const r = () => Math.floor(Math.random() * 256);
  return `rgb(${r()}, ${r()}, ${r()})`;
}

function rajzolLegfrissebbOszlopdiagram(canvasId) {
  fetch("data/adatok.json")
    .then(res => res.json())
    .then(data => {
      const filtered = data
        .filter(p => p.kor === "biztos pártválasztók")
        .sort((a, b) => new Date(b.datum) - new Date(a.datum))
        .slice(0, 3);

      const parties = Object.keys(filtered[0].eredmenyek);
      const datasets = filtered.map(kutatas => ({
        label: `${kutatas.intezet} (${kutatas.datum})`,
        data: parties.map(p => kutatas.eredmenyek[p]),
        backgroundColor: randomColor()
      }));

      new Chart(document.getElementById(canvasId), {
        type: "bar",
        data: {
          labels: parties,
          datasets: datasets
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "3 legfrissebb kutatás – biztos pártválasztók"
            }
          }
        }
      });
    });
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
  rajzolLegfrissebbOszlopdiagram("legfrissebb-canvas");
  rajzolTrendPontdiagram("trend-canvas");
});