  // Your dynamic headlines (can come from an API or elsewhere)
  const headlines = [
    "<a href='/kutatok/median.html'>MEDIÁN: TISZA 58% - 35% FIDESZ</a>",
    "<a href='/kutatok/nezopont.html'>NÉZŐPONT: TISZA 40% - 46% FIDESZ</a>",
    "MINERVA: TISZA 54% - 38% FIDESZ",
    "XXI. SZÁZAD INT.: TISZA 41% - 46% FIDESZ",
    "<a href='/kutatok/idea.html'>IDEA: TISZA 49% - 37% FIDESZ</a>",
    "<a href='/kutatok/21kutato.html'>21 KUTATÓKÖZPONT: TISZA 53% - 39% FIDESZ</a>",
    "<a href='/kutatok/zavecz.html'>ZÁVECZ: TISZA 50% - 38% FIDESZ</a>",
    "<a href='/kutatok/publicus.html'>PUBLICUS: TISZA 47% - 39% FIDESZ</a>",
    "<a href='/kutatok/republikon.html'>REPUBLIKON: TISZA 47% - 39% FIDESZ</a>",
    "<a href='/kutatok/iranytu.html'>IRÁNYTŰ: TISZA 50% - 37% FIDESZ</a>"
  ];

  // Combine headlines into one scrolling string
  const tickerContent = headlines.join(" &nbsp; • &nbsp; ");

  // Insert content into ticker div
  document.getElementById("ticker").innerHTML = tickerContent;