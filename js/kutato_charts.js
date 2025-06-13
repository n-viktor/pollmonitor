// kutato_charts.js – egy adott kutatóintézethez tartozó trenddiagram rajzolása

function rajzolIntezetTrendDiagram(canvasId, intezetNev) {
  fetch("/data/adatok.json")
    .then((res) => res.json())
    .then((data) => {
      const hatHonap = new Date();
      hatHonap.setMonth(hatHonap.getMonth() - 18);
      hatHonap.setHours(0, 0, 0, 0);

      const filtered = data.filter(
        (p) =>
          p.kor === "biztos pártválasztók" &&
          new Date(p.datum) >= hatHonap &&
          p.intezet.toLowerCase() === intezetNev.toLowerCase()
      );

      if (filtered.length === 0) return;

      const parties = Object.keys(filtered[0].eredmenyek);
      const pointsPerParty = {};
      parties.forEach((p) => (pointsPerParty[p] = []));

      filtered.forEach((kutatas) => {
        parties.forEach((p) => {
          pointsPerParty[p].push({
            x: kutatas.datum,
            y: kutatas.eredmenyek[p],
            intezet: kutatas.intezet,
          });
        });
      });

      const scatterDatasets = parties.map((party) => ({
        label: `${party}`,
        type: "scatter",
        data: pointsPerParty[party],
        showLine: false,
        borderColor: "transparent",
        backgroundColor: Chart.helpers.color(randomColor(party))
          .alpha(0.7)
          .rgbString(),
        pointRadius: 5,
      }));

      const trendLineDatasets = parties.map((party) => {
        const interpolatedDailyData = interpolateDailyData(pointsPerParty[party]);
        const trendData = calculateMovingAverage(interpolatedDailyData, 30);
        return {
          label: `${party} (Trend)`,
          type: "line",
          data: trendData,
          fill: false,
          borderColor: randomColor(party),
          borderWidth: 4,
          pointRadius: 0,
          tension: 0.5,
        };
      });

      const allDatasets = [...scatterDatasets, ...trendLineDatasets];

      new Chart(document.getElementById(canvasId), {
        type: "scatter",
        data: { datasets: allDatasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "time",
              time: {
                unit: "day",
                tooltipFormat: "yyyy-MM-dd",
                displayFormats: {
                  day: "yyyy-MM-dd",
                },
              },
              ticks: {
                autoSkip: true,
                maxTicksLimit: 29,
                font: { size: 11 },
              },
            },
            y: {
              min: 0,
              max: 60,
              ticks: {
                callback: (value) => `${value}%`,
              },
            },
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                filter: (legendItem) => !legendItem.text.includes("(Trend)"),
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const date = new Date(context.parsed.x);
                  const formattedDate = date.toLocaleDateString("hu-HU");
                  let label = context.dataset.label || "";

                  if (context.dataset.type === "scatter") {
                    label = label + ": " + context.parsed.y.toFixed(0) + "%";
                    if (context.raw.intezet) {
                      label += ` (${context.raw.intezet})`;
                    }
                    label += `, ${formattedDate}`;
                  } else {
                    label = `${label.replace(" (Trend)", "")} - Átlag: ${context.parsed.y.toFixed(1)}%, ${formattedDate}`;
                  }

                  return label;
                },
              },
            },
          },
        },
      });
    });
}

// Használat egy HTML oldalon:
// rajzolIntezetTrendDiagram("republikon-canvas", "Republikon");
