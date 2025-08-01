  // Your dynamic headlines (can come from an API or elsewhere)
  const headlines = [
    "<a href='/cikkek/250801-republikon-nem-valtoztak-jelentosen-a-preferenciak.html'>Republikon: Nem változtak jelentősen a preferenciák</a>",
    "<a href='/cikkek/250712-szinte-valtozatlan-a-kulonbseg-a-republikon-szerint.html'>Republikon: 10 százalékkal vezet a Tisza</a>",
    "<a href='/cikkek/250711-realpr-kutatas-fidesz-vezet.html'>Real-PR: a Fidesz vezethet és kétpárti parlament alakulhat</a>",
    "<a href='/cikkek/250705-ketparti-parlament-lehet-a-tarsadalomkutato-szerint.html'>Kétpárti parlament lehet a Társadalomkutató szerint</a>",
    "<a href='/cikkek/250703-elmult-heti-kutatasok-osszefoglalo.html'>Legutóbbi kutatások: 4-ből 3 a Tisza előnyét mutatja</a>"
  ];

  // Combine headlines into one scrolling string
  const tickerContent = headlines.join(" &nbsp; • &nbsp; ");

  // Insert content into ticker div
  document.getElementById("ticker").innerHTML = tickerContent;