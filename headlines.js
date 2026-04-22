  // Your dynamic headlines (can come from an API or elsewhere)
  const headlines = [
    "<a href='/kutatok/median.html'>MEDIÁN: TISZA 66% - 25% FIDESZ</a>",
    "<a href='/kutatok/21kutato.html'>21 KUTATÓKÖZPONT: TISZA 55% - 38% FIDESZ</a>",
    "<a href='/kutatok/zavecz.html'>ZÁVECZ: TISZA 54% - 40% FIDESZ</a>",
    "MINERVA: TISZA 51% - 41% FIDESZ"
  ];

  // Combine headlines into one scrolling string
  const tickerContent = headlines.join(" &nbsp; • &nbsp; ");

  // Insert content into ticker div
  document.getElementById("ticker").innerHTML = tickerContent;
