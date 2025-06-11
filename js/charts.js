// charts.js
function randomColor() {
  const r = () => Math.floor(Math.random() * 256);
  return `rgb(${r()}, ${r()}, ${r()})`;
}

function megjelenitKutatasok(adatok, elemId) {
  const container = document.getElementById(elemId);
  container.innerHTML = ""; // előző tartalom törlése

  adatok.slice().reverse().forEach(poll => {
    const div = document.createElement("div");
    div.className = "poll-entry";
    div.innerHTML = `
      <strong>${poll.datum}</strong> – <em>${poll.kor}</em><br />
      <ul>
        ${Object.entries(poll.eredmenyek).map(([part, val]) => `<li>${part}: ${val}%</li>`).join('')}
      </ul>
    `;
    container.appendChild(div);
  });
}

function rajzolTrendeket(adatok, canvasId) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  const labels = adatok.map(p => p.datum);
  const parties = Object.keys(adatok[0].eredmenyek);

  const datasets = parties.map(part => ({
    label: part,
    data: adatok.map(p => p.eredmenyek[part]),
    borderColor: randomColor(),
    fill: false,
    tension: 0.2
  }));

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: {
          display: true,
          text: "Pártpreferenciák alakulása"
        }
      }
    }
  });
}

// Betöltés és szűrés
function betolt(intezet, kor, listId, canvasId) {
  fetch("data/adatok.json")
    .then(res => res.json())
    .then(allData => {
      const szurt = allData.filter(p => p.intezet === intezet && p.kor === kor);
      if (szurt.length === 0) {
        document.getElementById(listId).innerHTML = "<p>Nincs elérhető adat.</p>";
        return;
      }
      megjelenitKutatasok(szurt, listId);
      rajzolTrendeket(szurt, canvasId);
    });
}
