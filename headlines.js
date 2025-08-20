  // Your dynamic headlines (can come from an API or elsewhere)
  const headlines = [
    "<a href='/cikkek/250820-idea-csokkent-a-tisza-elonye.html'>IDEA: Csökkent a Tisza előnye a teljes népesség körében</a>",
    "<a href='/cikkek/250812-publicus-tiz-szazalekkal-vezet-a-tisza.html'>Publicus: 10 százalékos a Tisza előnye a biztos pártválasztók körében</a>",
    "<a href='/cikkek/250801-republikon-nem-valtoztak-jelentosen-a-preferenciak.html'>Republikon: Nem változtak jelentősen a preferenciák</a>",
    "<a href='/cikkek/250712-szinte-valtozatlan-a-kulonbseg-a-republikon-szerint.html'>Republikon: 10 százalékkal vezet a Tisza</a>"
  ];

  // Combine headlines into one scrolling string
  const tickerContent = headlines.join(" &nbsp; • &nbsp; ");

  // Insert content into ticker div
  document.getElementById("ticker").innerHTML = tickerContent;