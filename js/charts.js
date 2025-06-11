function randomColor() {
  const r = () => Math.floor(Math.random() * 256);
  return `rgb(${r()}, ${r()}, ${r()})`;
}

function linearRegression(data) {
  const xs = data.map(p => new Date(p.x).getTime());
  const ys = data.map(p => p.y);

  const n = data.length;
  const sumX = xs.reduce((a,b) => a+b, 0);
  const sumY = ys.reduce((a,b) => a+b, 0);
  const sumXY = xs.reduce((acc, val, i) => acc + val*ys[i], 0);
  const sumXX = xs.reduce((acc, val) => acc + val*val, 0);

  const slope = (n*sumXY - sumX*sumY) / (n*sumXX - sumX*sumX);
  const intercept = (sumY - slope*sumX) / n;

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);

  return [
    {x: new Date(minX), y: slope*minX + intercept},
    {x: new Date(maxX), y: slope*maxX + intercept}
  ];
}


function rajzolLegfrissebbOszlopdiagramok() {
  fetch('data/adatok.json')
    .then(res => res.json())
    .then(data => {
      const filtered = data
        .filter(k => k.kor === "biztos pártválasztók")
        .sort((a, b) => new Date(b.datum) - new Date(a.datum))
        .slice(0, 3);

      filtered.forEach((kutatas, i) => {
        const ctx = document.getElementById(`chart${i}`).getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(kutatas.eredmenyek),
            datasets: [{
              label: `${kutatas.intezet} (${kutatas.datum})`,
              data: Object.values(kutatas.eredmenyek),
              backgroundColor: 'rgba(54, 162, 235, 0.7)'
            }]
          },
          options: {
            responsive: false,
            plugins: {
              title: {
                display: true,
                text: `${kutatas.intezet} - ${kutatas.datum}`
              },
              legend: { display: false }
            },
            scales: {
              y: { min: 0, max: 100 }
            }
          }
        });
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

      if(filtered.length === 0) return;

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

      // Dataset pontokhoz (scatter, csak pontok)
      const scatterDatasets = parties.map(party => ({
        label: party,
        data: pointsPerParty[party],
        showLine: false, // ne kötődjön össze
        borderColor: 'transparent',
        backgroundColor: randomColor(),
        pointRadius: 5,
      }));

      // Dataset trendvonalhoz (line, két pont a regresszióból)
      const lineDatasets = parties.map(party => ({
        label: party + " trendvonal",
        data: linearRegression(pointsPerParty[party]),
        fill: false,
        borderColor: scatterDatasets.find(d => d.label === party).backgroundColor,
        backgroundColor: 'transparent',
        pointRadius: 0,
        tension: 0, // egyenes vonal
        borderWidth: 2,
        datalabels: { display: false }
      }));

      const datasets = [...scatterDatasets, ...lineDatasets];

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
            },
            legend: {
              position: "bottom",
              labels: {
                filter: (item) => !item.text.includes("trendvonal") // trendvonalakat ne listázza a legenda
              }
            }
          }
        }
      });
    });
}


window.addEventListener("DOMContentLoaded", () => {
  rajzolLegfrissebbOszlopdiagramok();
  rajzolTrendPontdiagram("trend-canvas");
});
