  // Your dynamic headlines (can come from an API or elsewhere)
  const headlines = [
    "<a href='/cikkek/250711-realpr-kutatas-fidesz-vezet.html'>Real-PR: a Fidesz vezethet és kétpárti parlament alakulhat</a>",
    "<a href='/cikkek/250705-ketparti-parlament-lehet-a-tarsadalomkutato-szerint.html'>Kétpárti parlament lehet a Társadalomkutató szerint</a>",
    "<a href='/cikkek/250703-elmult-heti-kutatasok-osszefoglalo.html'>Legutóbbi kutatások: 4-ből 3 a Tisza előnyét mutatja</a>",
    "<a href='/cikkek/250630-soha-nem-mert-elonye-lehet-a-tiszanak.html'>Soha nem mért előnyt jelez a 21 Kutatóközpont a TISZA számára</a>",
    "<a href='/cikkek/250629-zavecz-11-szazalekkal-vezet-a-tisza.html'>Závecz Research: 11 százalékkal vezet a TISZA</a>"
  ];

  // Combine headlines into one scrolling string
  const tickerContent = headlines.join(" &nbsp; • &nbsp; ");

  // Insert content into ticker div
  document.getElementById("ticker").innerHTML = tickerContent;