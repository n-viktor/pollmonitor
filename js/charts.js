function randomColor() {
  const r = () => Math.floor(Math.random() * 256);
  return `rgb(${r()}, ${r()}, ${r()})`;
}

function rajzolLegfrissebbOszlopdiagram(containerId) {
  fetch("data/adatok.json")
    .then(res => res.json())
    .then(data => {
      const filtered = data
        .filter(p => p.kor === "biztos pártválasztók")
        .sort((a, b) => new Date(b.datum) - new Date(a.datum))
        .slice(0, 3);

      if (filtered.length === 0) {
        console.warn("Nincs adat biztos pártválasztókra.");
        return;
      }

      const container = document.getElementById(containerId);
      container.innerHTML = ""; // töröljük az előző tartalmat

      filtered.forEach((kutatas, index) => {
        const title = document.createElement("h3");
        title.textContent = `${kutatas.intezet} – ${kutatas.datum}`;
        container.appendChild(title);

        const canvas = document.createElement("canvas");
        canvas.id = `legfrissebb-canvas-${index}`;
        canvas.width = 400;
        canvas.height = 300;
        container.appendChild(canvas);

        const parties = Object.keys(kutatas.eredmenyek);
        const dataset = {
          label: `${kutatas.intezet} (${kutatas.datum})`,
          data: parties.map(p => kutatas.eredmenyek[p]),
          backgroundColor: randomColor()
        };

        new Chart(canvas.getContext("2d"), {
          type: "bar",
          data: {
            labels: parties,
            datasets: [dataset]
          },
          options: {
            responsive: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true, max: 100 }
            }
          }
        });
      });
    })
    .catch(err => {
      console.error("Hiba a JSON betöltésekor:", err);
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
  rajzolLegfrissebbOszlopdiagram("legfrissebb-container");
  rajzolTrendPontdiagram("trend-canvas");
});