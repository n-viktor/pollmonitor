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

  // Egységesítjük: nagybetű + trim
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
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(kutatas.eredmenyek),
            datasets: [{
              label: `${kutatas.intezet} (${kutatas.datum})`,
              data: Object.values(kutatas.eredmenyek),
              backgroundColor: Object.keys(kutatas.eredmenyek).map(p => randomColor(p))
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

function interpolatePoints(points, startDate, endDate) {
  points = points
    .map(p => ({x: new Date(p.x), y: p.y}))
    .sort((a,b) => a.x - b.x);

  const result = [];
  for(let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const currentDate = new Date(d);

    const exact = points.find(p => p.x.getTime() === currentDate.getTime());
    if(exact) {
      result.push({x: new Date(currentDate), y: exact.y});
      continue;
    }

    if(currentDate < points[0].x) {
      result.push({x: new Date(currentDate), y: points[0].y});
      continue;
    }

    if(currentDate > points[points.length -1].x) {
      result.push({x: new Date(currentDate), y: points[points.length -1].y});
      continue;
    }

    let before = null;
    let after = null;
    for(let i=0; i<points.length-1; i++) {
      if(points[i].x < currentDate && points[i+1].x > currentDate) {
        before = points[i];
        after = points[i+1];
        break;
      }
    }

    if(before && after) {
      const totalTime = after.x - before.x;
      const elapsed = currentDate - before.x;
      const ratio = elapsed / totalTime;
      const interpolatedY = before.y + ratio * (after.y - before.y);
      result.push({x: new Date(currentDate), y: interpolatedY});
    }
  }
  return result;
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

      const startDate = hatHonap;
      const endDate = new Date();

      // Interpoláljuk minden párt pontjait napi bontásban
      const interpolatedPerParty = {};
      parties.forEach(p => {
        interpolatedPerParty[p] = interpolatePoints(pointsPerParty[p], startDate, endDate);
      });

      // Most készítjük el a dataseteket pártonként:
      // - Scatter pontok (valós adatok)
      // - Folytonos vonal (interpolált trendvonal)

      const datasets = [];

      parties.forEach(party => {
        // Scatter pont dataset
        datasets.push({
          label: party,
          type: 'scatter',
          data: pointsPerParty[party],
          showLine: false,
          backgroundColor: randomColor(party),
          borderColor: randomColor(party),
          pointRadius: 5,
        });

        // Trendvonal dataset (folytonos vonal)
        datasets.push({
          label: party + " trendvonal",
          type: 'line',
          data: interpolatedPerParty[party],
          fill: false,
          borderColor: randomColor(party),
          backgroundColor: 'transparent',
          pointRadius: 0,
          tension: 0.3,
          borderWidth: 3,
          borderDash: [],  // NINCS szaggatás, sima vonal
          datalabels: { display: false }
        });
      });

      new Chart(document.getElementById(canvasId), {
        type: 'scatter',
        data: { datasets },
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
              display: true,
              text: 'Elmúlt 6 hónap eredményei – biztos pártválasztók'
            },
            legend: {
              position: 'bottom',
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
