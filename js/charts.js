function randomColor(party) {
  const colors = {
    "TISZA": "#038f76",
    "FIDESZ-KDNP": "#fa8d01",
    "DK": "#3a67a7",
    "MI HAZÁNK": "#708B32",
    "MKKP": "#da0101",
    "EGYÉB PÁRT": "#979797",
    "BIZONYTALAN/NT/NV": "#666666"
  };
  const standardized = party.toUpperCase().trim();
  return colors[standardized] || "#666666";
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

        // Pártok rendezése csökkenő sorrendbe az eredmények alapján
        const sortedParties = Object.entries(kutatas.eredmenyek)
          .sort(([, valueA], [, valueB]) => valueB - valueA);

        const labels = sortedParties.map(([key]) => key);
        const values = sortedParties.map(([, value]) => value);
        const backgroundColors = sortedParties.map(([key]) => randomColor(key));

        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels, // Már rendezett címkék
            datasets: [{
              label: `${kutatas.intezet} (${kutatas.datum})`,
              data: values, // Már rendezett adatok
              backgroundColor: backgroundColors // Már rendezett színek
            }]
          },
          options: {
            responsive: false,
            plugins: {
              title: {
                display: true,
                text: `${kutatas.intezet} - ${kutatas.datum}`
              },
              legend: { display: false },
              datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: value => value + '%',
                font: {
                  weight: 'bold'
                }
              }
            },
            scales: {
              y: { min: 0, max: 100 }
            }
          },
          plugins: [ChartDataLabels]
        });
      });
    });
}

function calculateMovingAverage(data, windowSize) {
  if (data.length === 0) return [];

  // Sort data by date (x-axis) to ensure correct moving average calculation
  const sortedData = [...data].sort((a, b) => new Date(a.x) - new Date(b.x));

  const movingAverages = [];
  for (let i = 0; i < sortedData.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const end = i + 1;
    const window = sortedData.slice(start, end);

    const sum = window.reduce((acc, curr) => acc + curr.y, 0);
    const average = sum / window.length;

    movingAverages.push({ x: sortedData[i].x, y: average });
  }
  return movingAverages;
}

function rajzolTrendPontdiagram(canvasId) {
  fetch("data/adatok.json")
    .then(res => res.json())
    .then(data => {
      const hatHonap = new Date();
      hatHonap.setMonth(hatHonap.getMonth() - 6);

      const filtered = data.filter(p =>
        p.kor === "biztos pártválasztók" &&
        new Date(p.datum) >= hatHonap
      );

      if (filtered.length === 0) return;

      const parties = Object.keys(filtered[0].eredmenyek);
      const pointsPerParty = {};
      parties.forEach(p => pointsPerParty[p] = []);

      filtered.forEach(kutatas => {
        parties.forEach(p => {
          pointsPerParty[p].push({
            x: kutatas.datum,
            y: kutatas.eredmenyek[p],
            intezet: kutatas.intezet
          });
        });
      });

      // Scatter datasets (existing points)
      const scatterDatasets = parties.map(party => ({
        label: `${party}`, // Módosítottam a labelt
        type: 'scatter',
        data: pointsPerParty[party],
        showLine: false,
        borderColor: 'transparent',
        backgroundColor: randomColor(party),
        pointRadius: 5,
        // Optional: Make scatter points slightly transparent if desired
        // backgroundColor: p => Chart.helpers.color(randomColor(p.dataset.label.replace(' (Pontok)', ''))).alpha(0.6).rgbString(),
      }));

      // Line datasets (trend lines)
      const trendLineDatasets = parties.map(party => {
        const trendData = calculateMovingAverage(pointsPerParty[party], 3); // Adjust window size (e.g., 3, 5, 7) for smoothing
        return {
          label: `${party} (Trend)`, // Label for the trend line
          type: 'line',
          data: trendData,
          fill: false,
          borderColor: randomColor(party), // Same color as scatter points
          borderWidth: 2,
          pointRadius: 0, // No points on the trend line
          tension: 0.3, // Adds a slight curve to the line
        };
      });

      // Combine scatter and trend line datasets
      const allDatasets = [...scatterDatasets, ...trendLineDatasets];

      new Chart(document.getElementById(canvasId), {
        type: 'scatter', // Keep base type as scatter for points
        data: { datasets: allDatasets }, // Use all combined datasets
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: { unit: 'month', tooltipFormat: 'yyyy-MM-dd' },
              title: { display: true, text: 'Dátum' }
            },
            y: {
              min: 0,
              max: 100,
              title: { display: true, text: '%' }
            }
          },
          plugins: {
            title: {
              display: false,
              text: 'Elmúlt 6 hónap eredményei – biztos pártválasztók'
            },
            legend: {
              position: 'bottom',
              // --- Módosítás itt ---
              labels: {
                filter: function(legendItem, chartData) {
                  // Csak azokat a elemeket mutasd, amelyek labelje NEM tartalmazza a "(Trend)" stringet
                  return !legendItem.text.includes('(Trend)');
                }
              }
              // --- Módosítás vége ---
            },
            tooltip: {
              // --- Ezt a részt már nem kell módosítani a korábbi verzióhoz képest,
              //     mert a `tooltip: { enabled: false }` dataset szintű beállítás az elsődleges.
              //     Hagyjuk meg, ha más típusú chartoknál szükség van rá a komplexebb logikára.
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';

                  // Ha ez egy trendvonal dataset, akkor üres stringet adunk vissza
                  if (context.dataset.tooltip && context.dataset.tooltip.enabled === false) {
                    return '';
                  }

                  if (context.dataset.type === 'scatter') {
                      if (label) {
                        label = label.replace(' (Pontok)', '') + ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += context.parsed.y + '%';
                      }
                      if (context.raw.intezet) {
                        label += ` (${context.raw.intezet})`;
                      }
                      if (context.raw.x) {
                        const date = new Date(context.raw.x);
                        label += `, ${date.toLocaleDateString('hu-HU')}`;
                      }
                  } else { // Ez a rész technikailag már nem fut le a `tooltip: { enabled: false }` miatt, de a biztonság kedvéért itt hagyhatjuk.
                      if (label) {
                          label = label.replace(' (Trend)', '') + ' (Trend): ';
                      }
                      if (context.parsed.y !== null) {
                          label += context.parsed.y.toFixed(1) + '%';
                      }
                  }
                  return label;
                }
              }
            }
          }
        }
      });
    });
}

// Ne feledd, hogy a calculateMovingAverage függvényre még mindig szükséged van:
// function calculateMovingAverage(data, windowSize) { ... }

window.addEventListener("DOMContentLoaded", () => {
  rajzolLegfrissebbOszlopdiagramok();
  rajzolTrendPontdiagram("trend-canvas");
});
