function randomColor() {
  const r = () => Math.floor(Math.random() * 256);
  return `rgb(${r()}, ${r()}, ${r()})`;
}

function rajzolLegfrissebbOszlopdiagramok() {
  fetch("data/adatok.json")
    .then(res => res.json())
    .then(data => {
      const filtered = data
        .filter(p => p.kor === "biztos pártválasztók")
        .sort((a, b) => new Date(b.datum) - new Date(a.datum))
        .slice(0, 3);

      filtered.forEach((kutatas, index) => {
        const parties = Object.keys(kutatas.eredmenyek);
        const values = parties.map(p => kutatas.eredmenyek[p]);

        const canvas = document.getElementById(`legfrissebb-canvas-${index}`);
        if (!canvas) {
          console.error(`Nem található canvas: legfrissebb-canvas-${index}`);
          return;
        }
        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
          type: "bar",
          data: {
            labels: parties,
            datasets: [{
              label: `${kutatas.intezet} (${kutatas.datum})`,
              data: values,
              backgroundColor: randomColor()
            }]
          },
          options: {
            responsive: false,
            plugins: {
              title: {
                display: true,
                text: `${kutatas.intezet} - ${kutatas.datum}`
              },
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                min: 0,
                max: 100,
                ticks: {
                  stepSize: 10,
                  callback: val => val + '%'
                }
              }
            }
          }
        });
      });
    })
    .catch(err => console.error("Hiba a JSON betöltésekor:", err));
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

      if (filtered.length === 0) {
        console.warn("Nincs adat az elmúlt 6 hónapra a biztos pártválasztóknál.");
        return;
      }

      const parties = Object.keys(filtered[0].eredmenyek);
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

      const ctx = document.getElementById(canvasId).getContext('2d');

      new Chart(ctx, {
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

// Eseménykezelő, hogy csak DOM betöltés után fusson
window.addEventListener("DOMContentLoaded", () => {
  rajzolLegfrissebbOszlopdiagramok();
  rajzolTrendPontdiagram("trend-canvas");
});
