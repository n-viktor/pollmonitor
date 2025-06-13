// A Chart.js diagramok inicializálása előtt helyezd el
Chart.defaults.font.family = "'Open Sans', sans-serif"; // Betűtípus család
Chart.defaults.font.size = 12; // Alapértelmezett betűméret
Chart.defaults.font.weight = 'normal'; // Alapértelmezett betűvastagság (pl. 'bold', 'normal', vagy szám)
Chart.defaults.color = '#333'; // Alapértelmezett szövegszín

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
  fetch('/data/adatok.json')
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
            labels: labels,
            datasets: [{
              label: `${kutatas.intezet} (${kutatas.datum})`,
              data: values,
              backgroundColor: backgroundColors
            }]
          },
          options: {
            responsive: true, // Ezt tartsd true-n
            maintainAspectRatio: false, // <-- Fontos: Engedi, hogy a konténer mérete határozza meg a vászon méretét
            // aspectRatio: 1, // <-- Opcionális: Kísérletezz ezzel az értékkel (pl. 1, 1.2, 0.8), ha az előzőek nem elegendőek.
                              //      Egy 1-es arány 1:1 négyzetes formát jelent.
                              //      Magasabb szám (pl. 1.5) szélesebb chartot eredményez, alacsonyabb (pl. 0.8) magasabbat.
            plugins: {
              title: {
                display: true,
                text: `${kutatas.intezet} - ${kutatas.datum}`,
                font: { // <-- A cím betűméretének finomhangolása
                  size: 16 // Kisebb betűméret a címnek, ha túl nagy volt
                }
              },
              legend: { display: false },
              datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: value => value + '%',
                font: {
                  weight: 'bold',
                  size: 12 // <-- Adatfeliratok betűméretének csökkentése
                }
              },
              tooltip: { // <-- EZ AZ ÚJ RÉSZ
                enabled: true, // Biztosítsuk, hogy a tooltip engedélyezve van
                callbacks: {
                  title: function(tooltipItems) {
                      // A tooltipItems tömbben van az összes adatpont, ami az egér alatt van.
                      // Bar chart esetén általában csak egy van.
                      return tooltipItems[0].label; // A párt neve (label)
                  },
                  label: function(tooltipItem) {
                      // tooltipItem.parsed.y az adatpont értéke (százalék)
                      // kutatas.datum a kutatás dátuma
                      return `${tooltipItem.parsed.y}%, ${kutatas.datum}`;
                  }
                }
              }
            },
            scales: {
              x: { // X tengely címkéinek igazítása és méretre optimalizálása
                ticks: {
                  font: {
                    size: 11 // Kisebb betűméret az X tengely címkéinek
                  },
                  maxRotation: 30, // Ne forogjanak el a címkék
                  minRotation: 0,
                  autoSkip: false,
                  maxTicksLimit: 10 // Max ennyi tick legyen
                },
                grid: {
                  display: false // Elrejti a vertikális rácsot, ha zavaró
                }
              },
              y: {
                min: 0,
                max: 60,
                ticks: {
                  font: {
                    size: 11 // Kisebb betűméret az Y tengely címkéinek
                  },
                  callback: function(value) {
                    return value + '%'; // Százalék jel az Y tengelyen
                  }
                }
              }
            },
            layout: {
              padding: { // <-- Padding a diagram körül
                top: 20,
                bottom: 20,
                left: 10,
                right: 10
              }
            }
          },
          plugins: [ChartDataLabels]
        });
      });
    });
}

// Segédfüggvény a dátumok kezeléséhez
function getDaysBetween(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0); // Biztosítsuk, hogy nap elejére álljon

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

// ÚJ SEGÉDFÜGGVÉNY: Napi adatok interpolálása hiányzó felmérések esetén
function interpolateDailyData(partyData) {
  if (partyData.length === 0) return [];

  // 1. Rendezés dátum szerint
  const sortedData = [...partyData].sort((a, b) => new Date(a.x) - new Date(b.x));

  if (sortedData.length === 1) { // Ha csak egy adatpont van, nincs mit interpolálni
    return sortedData.map(d => ({ x: d.x, y: d.y }));
  }

  const firstDate = new Date(sortedData[0].x);
  const lastDate = new Date(sortedData[sortedData.length - 1].x);

  // 2. Dátumtartomány generálása
  const allDates = getDaysBetween(firstDate, lastDate);

  // 3. Adatok feltérképezése gyors hozzáféréshez
  const dataMap = new Map();
  sortedData.forEach(d => {
    dataMap.set(new Date(d.x).toDateString(), d.y);
  });

  const interpolated = [];
  let prevKnownPoint = sortedData[0];
  let nextKnownPoint = sortedData[0];
  let nextKnownIndex = 0;

  for (const currentDate of allDates) {
    const dateString = currentDate.toDateString();

    if (dataMap.has(dateString)) {
      // Ha van felmérés az adott napon, azt használjuk
      interpolated.push({ x: currentDate.toISOString().split('T')[0], y: dataMap.get(dateString) });
      prevKnownPoint = { x: currentDate, y: dataMap.get(dateString) };
      // Frissítjük a nextKnownPoint-ot, ha elértük
      while (nextKnownIndex < sortedData.length && new Date(sortedData[nextKnownIndex].x) <= currentDate) {
        nextKnownIndex++;
      }
      nextKnownPoint = sortedData[nextKnownIndex] || null; // Frissítjük a következő ismert pontot
    } else {
      // Ha nincs felmérés, interpolálunk
      if (!nextKnownPoint || new Date(nextKnownPoint.x) < currentDate) {
          // Ha a következő ismert pont már a múltban van, frissítjük a keresést
          while (nextKnownIndex < sortedData.length && new Date(sortedData[nextKnownIndex].x) < currentDate) {
              nextKnownIndex++;
          }
          prevKnownPoint = sortedData[nextKnownIndex -1] || null;
          nextKnownPoint = sortedData[nextKnownIndex] || null;
      }

      if (prevKnownPoint && nextKnownPoint) {
        const x1 = new Date(prevKnownPoint.x).getTime();
        const y1 = prevKnownPoint.y;
        const x2 = new Date(nextKnownPoint.x).getTime();
        const y2 = nextKnownPoint.y;
        const xCurrent = currentDate.getTime();

        if (x1 === x2) { // Elvileg nem fordulhat elő rendezett adatoknál, de biztonság kedvéért
             interpolated.push({ x: currentDate.toISOString().split('T')[0], y: y1 });
        } else {
            // Lineáris interpoláció: y = y1 + (y2 - y1) * (x - x1) / (x2 - x1)
            const interpolatedY = y1 + (y2 - y1) * (xCurrent - x1) / (x2 - x1);
            interpolated.push({ x: currentDate.toISOString().split('T')[0], y: interpolatedY });
        }
      } else if (prevKnownPoint) {
        // Ha csak megelőző pont van (az időszak végén)
        interpolated.push({ x: currentDate.toISOString().split('T')[0], y: prevKnownPoint.y });
      } else if (nextKnownPoint) {
        // Ha csak követő pont van (az időszak elején), (bár ezt az első pont kezeli)
        interpolated.push({ x: currentDate.toISOString().split('T')[0], y: nextKnownPoint.y });
      }
      // Ha sem prev, sem next nincs (ami nem fordulhatna elő egy jól definiált tartományban), akkor kimarad.
    }
  }
  return interpolated;
}

// A korábbi calculateMovingAverage függvény (változatlan, de az interpolateDailyData után hívjuk majd)
function calculateMovingAverage(data, windowSize) {
  if (data.length === 0) return [];

  // Fontos: Itt már feltételezzük, hogy az 'data' paraméter interpolált, napi adatokat tartalmaz,
  // és már rendezve van dátum szerint az interpolateDailyData függvény miatt.
  const movingAverages = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);

    const sum = window.reduce((acc, curr) => acc + curr.y, 0);
    const average = sum / window.length;

    movingAverages.push({ x: data[i].x, y: average });
  }
  return movingAverages;
}


// --- rajzolTrendPontdiagram függvény módosítása ---
function rajzolTrendPontdiagram(canvasId) {
  fetch("/data/adatok.json")
    .then(res => res.json())
    .then(data => {
      const hatHonap = new Date();
      hatHonap.setMonth(hatHonap.getMonth() - 13);
      hatHonap.setHours(0, 0, 0, 0); // Pontosan a nap elejére állítjuk

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
        label: `${party}`,
        type: 'scatter',
        data: pointsPerParty[party],
        showLine: false,
        borderColor: 'transparent',
        backgroundColor: Chart.helpers.color(randomColor(party)).alpha(0.7).rgbString(), // 70% átlátszóság
        pointRadius: 5,
      }));

      // Line datasets (trend lines)
      const trendLineDatasets = parties.map(party => {
        // --- VÁLTOZTATÁS ITT: Elsőként interpoláljuk az adatokat ---
        const interpolatedDailyData = interpolateDailyData(pointsPerParty[party]);

        // Majd az interpolált adatokra alkalmazzuk a mozgóátlagot
        const trendData = calculateMovingAverage(interpolatedDailyData, 30); // Mozgóátlag ablakmérete, pl. 7 nap

        return {
          label: `${party} (Trend)`,
          type: 'line',
          data: trendData,
          fill: false,
          borderColor: randomColor(party),
          borderWidth: 4,
          pointRadius: 0,
          tension: 0.5
        };
      });

      const allDatasets = [...scatterDatasets, ...trendLineDatasets];

      new Chart(document.getElementById(canvasId), {
        type: 'scatter',
        data: { datasets: allDatasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day', // Most már naponkénti egység is lehet
                tooltipFormat: 'yyyy-MM-dd',
                displayFormats: {
                    day: 'yyyy-MM-dd' // Kisebb tengelyfelirat a napi bontásnál
                }
              },
              title: { display: true, text: '' },
              ticks: {
                autoSkip: true, // Hagyjuk, hogy a Chart.js kihagyja, ha túl sok lenne
                maxTicksLimit: 29, // Max. 10 felirat az X tengelyen
                font: {
                  size: 12 // Kisebb betűméret a napi feliratoknak
                }
              }
            },
            y: {
              min: 0,
              max: 60,
              title: { display: true, text: '' },
              ticks: {
                // --- Módosítás itt ---
                callback: function(value) {
                  return value + '%'; // Hozzáadjuk a % jelet
                }
                // --- Módosítás vége ---
              }
            }
          },
          plugins: {
            title: {
              display: false,
              text: 'Elmúlt 6 hónap eredményei – biztos pártválasztók'
            },
            legend: {
              position: 'bottom',
              labels: {
                filter: function(legendItem, chartData) {
                  return !legendItem.text.includes('(Trend)');
                }
              }
            },
            tooltip: {
              // --- Eltávolítjuk vagy kikommenteljük a filter callback-et ---
              // filter: function(tooltipItem) {
              //   return !tooltipItem.dataset.label.includes('(Trend)');
              // },
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  const date = new Date(context.parsed.x); // A dátum lekérése a parsed.x-ből
                  const formattedDate = date.toLocaleDateString('hu-HU'); // Dátum formázása

                  if (context.dataset.type === 'scatter') {
                      // Pontok Tooltip formázása (változatlan)
                      if (label) {
                        label = label.replace(' (Pontok)', '') + ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += context.parsed.y.toFixed(0) + '%';
                      }
                      if (context.raw.intezet) {
                        label += ` (${context.raw.intezet})`;
                      }
                      label += `, ${formattedDate}`; // Dátum hozzáadása
                  } else if (context.dataset.type === 'line' && label.includes('(Trend)')) {
                      // --- Trendvonalak Tooltip formázása ---
                      const partyName = label.replace(' (Trend)', '');
                      const trendValue = context.parsed.y !== null ? context.parsed.y.toFixed(1) + '%' : '';
                      label = `${partyName} - Átlag: ${trendValue}, ${formattedDate}`;
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
