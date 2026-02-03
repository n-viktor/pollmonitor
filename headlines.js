  // Your dynamic headlines (can come from an API or elsewhere)
  const headlines = [
    "<a href='/kutatok/21kutato.html'>21 KUTATÓKÖZPONT: TISZA 53% - 37% FIDESZ</a>",
    "<a href='/kutatok/publicus.html'>PUBLICUS: TISZA 48% - 40% FIDESZ</a>",
    "MINERVA: TISZA 54,3% - 36,7% FIDESZ",
    "<a href='/kutatok/republikon.html'>REPUBLIKON: TISZA 48% - 37% FIDESZ</a>",
    "XXI. SZÁZAD INTÉZET: FIDESZ 45% - 40% TISZA",
    "<a href='/kutatok/median.html'>MEDIÁN: TISZA 51% - 39% FIDESZ</a>"
  ];

  // Combine headlines into one scrolling string
  const tickerContent = headlines.join(" &nbsp; • &nbsp; ");

  // Insert content into ticker div
  document.getElementById("ticker").innerHTML = tickerContent;