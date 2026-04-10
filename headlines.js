  // Your dynamic headlines (can come from an API or elsewhere)
  const headlines = [
    "<a href='/kutatok/publicus.html'>PUBLICUS: TISZA 52% - 39% FIDESZ</a>",
    "<a href='/kutatok/idea.html'>IDEA: TISZA 50% - 37% FIDESZ</a>",
    "<a href='/kutatok/iranytu.html'>IRÁNYTŰ: TISZA 51% - 40% FIDESZ</a>",
    "<a href='/kutatok/21kutato.html'>21 KUTATÓKÖZPONT: TISZA 56% - 37% FIDESZ</a>",
    "<a href='/kutatok/zavecz.html'>ZÁVECZ: TISZA 51% - 38% FIDESZ</a>",
    "<a href='/kutatok/republikon.html'>REPUBLIKON: TISZA 49% - 40% FIDESZ</a>",
    "<a href='/kutatok/median.html'>MEDIÁN: TISZA 58% - 35% FIDESZ</a>",
    "<a href='/kutatok/nezopont.html'>NÉZŐPONT: TISZA 40% - 46% FIDESZ</a>",
    "MINERVA: TISZA 54% - 38% FIDESZ",
    "XXI. SZÁZAD INT.: TISZA 41% - 46% FIDESZ",
  ];

  // Combine headlines into one scrolling string
  const tickerContent = headlines.join(" &nbsp; • &nbsp; ");

  // Insert content into ticker div
  document.getElementById("ticker").innerHTML = tickerContent;
