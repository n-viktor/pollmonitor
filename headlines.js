  // Your dynamic headlines (can come from an API or elsewhere)
  const headlines = [
    "<a href='/cikkek/250630-soha-nem-mert-elonye-lehet-a-tiszanak.html'>Soha nem mért előnyt jelez a 21 Kutatóközpont a TISZA számára</a>",
    "<a href='/cikkek/250629-zavecz-11-szazalekkal-vezet-a-tisza.html'>Závecz Research: 11 százalékkal vezet a TISZA</a>",
    "<a href='/cikkek/3-honap-utan-publikalt-a-nezopont-250627.html'>3 hónap után új kutatással rukkolt elő a Nézőpont</a>",
    "<a href='/cikkek/median-nagyon-vezet-a-tisza-250618.html'>Medián: Nagyon vezet a Tisza</a>",
    "<a href='/cikkek/republikon-a-tisza-vezet-250611.html'>Republikon: A Tisza vezet a biztos pártválasztók és a teljes népesség körében</a>"
  ];

  // Combine headlines into one scrolling string
  const tickerContent = headlines.join(" &nbsp; • &nbsp; ");

  // Insert content into ticker div
  document.getElementById("ticker").innerHTML = tickerContent;