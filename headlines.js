  // Your dynamic headlines (can come from an API or elsewhere)
  const headlines = [
    "MINERVA: TISZA 54,3% - 36,7% FIDESZ",
    "<a href='/kutatok/republikon.html'>REPUBLIKON: TISZA 48% - 37% FIDESZ</a>",
    "XXI. SZÁZAD INTÉZET: FIDESZ 45% - 40% TISZA",
    "<a href='/kutatok/median.html'>MEDIÁN: TISZA 51% - 39% FIDESZ</a>",
    "<a href='/kutatok/idea.html'>IDEA: TISZA 48% - 38% FIDESZ</a>",
  ];

  // Combine headlines into one scrolling string
  const tickerContent = headlines.join(" &nbsp; • &nbsp; ");

  // Insert content into ticker div
  document.getElementById("ticker").innerHTML = tickerContent;