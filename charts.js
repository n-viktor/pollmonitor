// charts.js – Betölti a JSON adatokat és kirajzol egy trendgrafikont

// Mintaadatok (később lehet fetch-elni data/poll_data.json-ból is)
const sampleData = [
  {
    intezet: "Závecz",
    datum: "2025-05-01",
    tema: "Pártpreferencia",
    eredmenyek: {
      "Fidesz": 42,
      "DK": 16,
      "Mi Hazánk": 10,
      "Momentum": 7,
      "Egyéb": 25
    }
  },
  {
    intezet: "Závecz",
    datum: "2025-06-01",
    tema: "Pártpreferencia",
    eredmenyek: {
      "Fidesz": 40,
      "DK": 18,
      "Mi Hazánk": 9,
      "Momentum": 6,
      "Egyéb": 27
    }
  }
];

// Kirajzolja a legutóbbi eredményeket
const pollList = document.getElementById("poll-list");
sampleData.slice().reverse().forEach(poll => {
  const div = document.createElement("div");
  div.className = "poll-entry";
  div.innerHTML = `
    <strong>${poll.intezet}</strong> – ${poll.datum}<br />
    <em>${poll.tema}</em><br />
    <ul>
      ${Object.entries(poll.eredmenyek).map(([part, szazalek]) => `<li>${part}: ${szazalek}%</li>`).join("")}
    </ul>
  `;
  pollList.appendChild(div);
});

// Trendgrafikon (Chart.js)
const ctx = document.getElementById('trendCanvas').getContext('2d');
const labels = sampleData.map(p => p.datum);

const datasets = Object.keys(sampleData[0].eredmenyek).map(part => ({
  label: part,
  data: sampleData.map(p => p.eredmenyek[part]),
  fill: false,
  borderColor: randomColor(),
  tension: 0.2
}));

new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels,
    datasets: datasets
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Pártpreferenciák alakulása'
      }
    }
  }
});

function randomColor() {
  const r = () => Math.floor(Math.random() * 256);
  return `rgb(${r()}, ${r()}, ${r()})`;
}
