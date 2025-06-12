// kutatoOldal.js
// Globalis változó a Chart.js példány tárolására
let currentChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Alapértelmezett beállítások és DOM elemek lekérése
    const currentIntezet = getCurrentIntezetName(); // Segédfüggvény a kutató nevének lekéréséhez
    const diagramCimElem = document.getElementById('aktualis-diagram-cim');
    const datumValasztoKontener = document.getElementById('datum-valaszto-kontener');
    const korValasztoKontener = document.getElementById('kor-valaszto-kontener');
    const chartCanvasId = 'kutato-oszlop-diagram-canvas';

    if (!currentIntezet) {
        console.error("Nem sikerült meghatározni az intézet nevét az URL alapján.");
        // Lehet, hogy itt egy hibaüzenetet is megjelenítenénk az oldalon
        return;
    }

    // Frissítjük az oldal címét és a fejlécet
    const kutatoCimElem = document.getElementById('kutato-cim');
    if (kutatoCimElem) {
        kutatoCimElem.textContent = `${currentIntezet}`;
    }
    document.title = `PollMonitor: ${currentIntezet}`;

    let adatok = []; // Ide töltjük be az összes adatot

    try {
        // Relatív elérési út a JSON fájlhoz (ha a kutatok mappában van az oldal)
        const response = await fetch('../data/adatok.json'); 
        if (!response.ok) {
            throw new Error(`HTTP hiba! Státusz: ${response.status}`);
        }
        adatok = await response.json();
    } catch (error) {
        console.error('Hiba az adatok lekérése közben:', error);
        if (diagramCimElem) {
            diagramCimElem.textContent = 'Hiba az adatok betöltésekor.';
        }
        return;
    }

    // Szűrjük az adatokat az aktuális intézetre
    const intezetAdatok = adatok.filter(d => d.intezet === currentIntezet);

    // Dátumok gyűjtése és rendezése (legújabb elől)
    // Csak azok a dátumok, amelyekhez van adat az aktuális intézetre
    const egyediDatumok = [...new Set(intezetAdatok.map(d => d.datum))].sort((a, b) => new Date(b) - new Date(a));

    // Kor kategóriák gyűjtése (Biztos pártválasztók, Teljes népesség)
    // Fontos: a JSON fájlban kisbetűsek!
    const korKategoriak = [...new Set(intezetAdatok.map(d => d.kor))].filter(k => k === "biztos pártválasztók" || k === "teljes népesség").sort();


    let aktualisDatum = egyediDatumok[0]; // Kezdetben a legfrissebb dátum
    // Kezdetben "biztos pártválasztók" (kisbetűvel, ahogy a JSON-ban van) vagy az első elérhető
    let aktualisKor = korKategoriak.includes("biztos pártválasztók") ? "biztos pártválasztók" : korKategoriak[0]; 

    // --- Segédfüggvény a szöveg formázásához (pl. "biztos pártválasztók" -> "Biztos pártválasztók") ---
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // --- Dátumválasztó gombok generálása és eseménykezelők ---
    function renderDatumGombok() {
        datumValasztoKontener.innerHTML = ''; // Tisztítás
        egyediDatumok.forEach(datum => {
            const button = document.createElement('button');
            button.textContent = new Date(datum).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
            button.classList.add('datum-gomb');
            if (datum === aktualisDatum) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                aktualisDatum = datum;
                renderDatumGombok(); // Frissíti az aktív gombot
                rajzolOszlopDiagram();
            });
            datumValasztoKontener.appendChild(button);
        });
    }

    // --- Kor kategória váltó gombok generálása és eseménykezelők ---
    function renderKorGombok() {
        korValasztoKontener.innerHTML = ''; // Tisztítás
        korKategoriak.forEach(kor => {
            const button = document.createElement('button');
            // A gomb szövegét formázzuk a szebb megjelenés érdekében
            button.textContent = capitalizeFirstLetter(kor); 
            button.classList.add('kor-gomb');
            if (kor === aktualisKor) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                aktualisKor = kor;
                renderKorGombok(); // Frissíti az aktív gombot
                rajzolOszlopDiagram();
            });
            korValasztoKontener.appendChild(button);
        });
    }


    // --- Oszlopdiagram rajzoló függvény ---
    function rajzolOszlopDiagram() {
        const ctx = document.getElementById(chartCanvasId).getContext('2d');

        // Pusztítsa el az előző diagramot, ha létezik
        if (currentChartInstance) {
            currentChartInstance.destroy();
        }

        // Keresse meg a megfelelő adatokat a kiválasztott dátum és kor kategória alapján
        const aktualisAdat = intezetAdatok.find(d => d.datum === aktualisDatum && d.kor === aktualisKor);

        if (!aktualisAdat) {
            diagramCimElem.textContent = `Nincs adat a kiválasztott dátumhoz és kategóriához: ${new Date(aktualisDatum).toLocaleDateString('hu-HU')} - ${capitalizeFirstLetter(aktualisKor)}`;
            return;
        }

        // Cím frissítése
        diagramCimElem.textContent = `${new Date(aktualisDatum).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })} (${capitalizeFirstLetter(aktualisKor)})`;

        // Itt már az 'eredmenyek' kulcsot használjuk
        const eredmenyekObj = aktualisAdat.eredmenyek;
        
        // Konvertáljuk az eredményeket egy tömbbé a rendezéshez
        let rendezettPartAdatok = Object.keys(eredmenyekObj).map(part => ({
            nev: part,
            ertek: eredmenyekObj[part]
        }));

        // Külön kezelendő elemek
        const specialisPartok = ["Egyéb párt", "Bizonytalan/NT/NV"];
        let vegePartok = [];
        
        // Szűrjük ki a speciális pártokat a fő listából, és tároljuk őket külön
        rendezettPartAdatok = rendezettPartAdatok.filter(item => {
            if (specialisPartok.includes(item.nev)) {
                vegePartok.push(item);
                return false; // Kiszedjük a fő listából
            }
            return true; // Benne marad a fő listában
        });

        // Rendezés érték (százalék) szerint csökkenő sorrendben a fő listán
        rendezettPartAdatok.sort((a, b) => b.ertek - a.ertek);

        // A speciális pártokat a kívánt sorrendben (Egyéb párt, majd Bizonytalan) adjuk hozzá a végéhez
        // Fontos, hogy a vegePartok tömb elemeit is rendezzük, ha esetleg nem a kívánt sorrendben kerültek bele
        vegePartok.sort((a, b) => {
            if (a.nev === "Egyéb párt") return -1; // "Egyéb párt" előbb jön
            if (b.nev === "Egyéb párt") return 1;
            return 0; // Egyébként marad a sorrend
        });

        // Összefűzzük a rendezett fő listát a speciális pártokkal
        rendezettPartAdatok = rendezettPartAdatok.concat(vegePartok);

        // Kinyerjük a rendezett neveket és értékeket
        const partok = rendezettPartAdatok.map(item => item.nev);
        const ertekek = rendezettPartAdatok.map(item => item.ertek);

        // Pártnevek és hozzájuk tartozó színek frissítése a JSON alapján
        const partSzinek = {
            "Tisza": "#038f76",
            "Fidesz-KDNP": "#fa8d01",
            "DK": "#3a67a7",
            "Mi Hazánk": "#708B32",
            "MKKP": "#da0101",
            "Egyéb párt": "#979797",
            "Bizonytalan/NT/NV": "#666666"
        };

        const backgroundColors = partok.map(part => partSzinek[part] || '#CCCCCC'); // Fallback szín

        currentChartInstance = new Chart(ctx, {
            type: 'bar', // Oszlopdiagram
            data: {
                labels: partok,
                datasets: [{
                    label: 'Támogatottság (%)',
                    data: ertekek,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace(')', ', 0.8)')).map(color => color.replace('rgb', 'rgba')), // Enyhén sötétebb szegély
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 55, // Max érték 55%
                        title: {
                            display: true,
                            text: 'Támogatottság (%)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false // Eltünteti a függőleges rácsokat
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Nincs szükség legendára, ha csak egy dataset van
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + '%';
                            }
                        }
                    }
                },
                indexAxis: 'x', // Hogy függőleges oszlopok legyenek
            }
        });
    }

    // Segédfüggvény az intézet nevének lekéréséhez az URL-ből
    function getCurrentIntezetName() {
        const path = window.location.pathname;
        // Az "/kutatok/" előtagot is figyelembe vesszük
        if (path.includes('/kutatok/median.html')) return 'Medián';
        if (path.includes('/kutatok/nezopont.html')) return 'Nézőpont'; // A JSON-ban "Nézőpont"
        if (path.includes('/kutatok/zavecz.html')) return 'Závecz Research'; // A JSON-ban "Závecz Research"
        // Hozzáadjuk a többi intézetet is a JSON alapján
        if (path.includes('/kutatok/republikon.html')) return 'Republikon';
        if (path.includes('/kutatok/idea.html')) return 'IDEA';
        if (path.includes('/kutatok/publicus.html')) return 'Publicus';
        if (path.includes('/kutatok/21kutato.html')) return '21 Kutatóközpont'; // Ha van ilyen oldal
        if (path.includes('/kutatok/iranytu.html')) return 'Iránytű';
        if (path.includes('/kutatok/mtarskut.html')) return 'Magyar Társadalomkutató';
        if (path.includes('/kutatok/szazadveg.html')) return 'Századvég';
        if (path.includes('/kutatok/realpr93.html')) return 'Real-PR 93.';
        
        return null; // Ha nem talál egyezést
    }

    // Inicializálás: renderelje a gombokat és rajzolja ki az első diagramot
    renderDatumGombok();
    renderKorGombok();
    rajzolOszlopDiagram();
});