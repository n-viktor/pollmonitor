  // Your dynamic headlines (can come from an API or elsewhere)
  const headlines = [
    "<a href='/kutatok/zavecz.html'>ZÁVECZ: TISZA 50% - 38% FIDESZ</a>",
    "<a href='/kutatok/nezopont.html'>NÉZŐPONT: TISZA 40% - 45% FIDESZ</a>",
    "<a href='/kutatok/publicus.html'>PUBLICUS: TISZA 47% - 39% FIDESZ</a>",
    "<a href='/kutatok/median.html'>MEDIÁN: TISZA 55% - 35% FIDESZ</a>",
    "<a href='/kutatok/republikon.html'>REPUBLIKON: TISZA 47% - 39% FIDESZ</a>",
    "<a href='/kutatok/iranytu.html'>IRÁNYTŰ: TISZA 50% - 37% FIDESZ</a>",
    "<a href='/kutatok/idea.html'>IDEA: TISZA 48% - 38% FIDESZ</a>"
  ];

  // Combine headlines into one scrolling string
  const tickerContent = headlines.join(" &nbsp; • &nbsp; ");

  // Insert content into ticker div
  document.getElementById("ticker").innerHTML = tickerContent;