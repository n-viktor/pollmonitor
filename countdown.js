document.addEventListener('DOMContentLoaded', () => {
    // --- Közös beállítások ---
    const targetDate = new Date('2026-04-12T00:00:00').getTime(); // Cél dátum

    // --- Referenciák az EREDETI (STATIKUS) visszaszámlálóhoz (ha megtartod) ---
    const staticDaysSpan = document.getElementById('days');
    const staticHoursSpan = document.getElementById('hours');
    const staticMinutesSpan = document.getElementById('minutes');
    const staticSecondsSpan = document.getElementById('seconds');
    const staticCountdownMessage = document.getElementById('countdown-message');
    const staticCountdownTimerContainer = document.getElementById('countdown-timer');

    // --- Referenciák a LEBEGŐ visszaszámlálóhoz ---
    const floatingCountdownContainer = document.getElementById('floating-countdown-container');
    const closeCountdownBtn = document.getElementById('close-countdown-btn');
    const floatingDaysSpan = document.getElementById('floating-days');
    const floatingHoursSpan = document.getElementById('floating-hours');
    const floatingMinutesSpan = document.getElementById('floating-minutes');
    const floatingSecondsSpan = document.getElementById('floating-seconds');
    const floatingCountdownMessage = document.getElementById('floating-countdown-message');
    const floatingCountdownTimerContainer = document.getElementById('floating-countdown-timer');

    // Objektum, ami tárolja az előző értékeket az animációhoz
    // Külön objektum a lebegőhöz, ha külön akarod animálni őket
    const previousStaticValues = { days: -1, hours: -1, minutes: -1, seconds: -1 };
    const previousFloatingValues = { days: -1, hours: -1, minutes: -1, seconds: -1 };


    // --- Animációs függvény ---
    function animateNumberChange(element, newValue, unit, prevValuesObj) {
        if (element && prevValuesObj[unit] !== newValue) {
            element.classList.add('animate-out');
            setTimeout(() => {
                element.textContent = String(newValue).padStart(2, '0');
                element.classList.remove('animate-out');
                element.classList.add('animate-in');
                setTimeout(() => {
                    element.classList.remove('animate-in');
                }, 200); // Megegyezik a CSS transition időtartamával
            }, 200); // Megegyezik a CSS transition időtartamával
            prevValuesObj[unit] = newValue;
        }
    }

    // --- Visszaszámlálás frissítő függvény ---
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Kezeljük az idő lejártát mindkét visszaszámlálónál (ha mindkettő aktív)
        if (distance < 0) {
            clearInterval(countdownInterval); // Leállítja a visszaszámlálást

            // Statikus visszaszámláló frissítése
            if (staticCountdownTimerContainer) staticCountdownTimerContainer.innerHTML = '';
            if (staticCountdownMessage) staticCountdownMessage.textContent = "A következő választások már zajlanak vagy lezajlottak!";

            // Lebegő visszaszámláló frissítése
            if (floatingCountdownTimerContainer) floatingCountdownTimerContainer.innerHTML = '';
            if (floatingCountdownMessage) floatingCountdownMessage.textContent = "A következő választások már zajlanak vagy lezajlottak!";
            if (floatingCountdownContainer) floatingCountdownContainer.classList.remove('show'); // Elrejti, ha lejárt az idő
            return; // Kilép a függvényből, ha lejárt az idő
        }

        // Frissítjük a statikus visszaszámlálót (ha létezik)
        animateNumberChange(staticDaysSpan, days, 'days', previousStaticValues);
        animateNumberChange(staticHoursSpan, hours, 'hours', previousStaticValues);
        animateNumberChange(staticMinutesSpan, minutes, 'minutes', previousStaticValues);
        animateNumberChange(staticSecondsSpan, seconds, 'seconds', previousStaticValues);

        // Frissítjük a lebegő visszaszámlálót (ha látható)
        if (floatingCountdownContainer && floatingCountdownContainer.classList.contains('show')) {
            animateNumberChange(floatingDaysSpan, days, 'days', previousFloatingValues);
            animateNumberChange(floatingHoursSpan, hours, 'hours', previousFloatingValues);
            animateNumberChange(floatingMinutesSpan, minutes, 'minutes', previousFloatingValues);
            animateNumberChange(floatingSecondsSpan, seconds, 'seconds', previousFloatingValues);
        }
    }

    // --- Lebegő visszaszámláló logikája ---
    const showFloatingCountdown = () => {
        // Nincs localStorage ellenőrzés, így mindig megjelenik, ha meghívják
        if (floatingCountdownContainer) {
            floatingCountdownContainer.classList.add('show');
        }
    };

    const hideFloatingCountdown = () => {
        if (floatingCountdownContainer) {
            floatingCountdownContainer.classList.remove('show');
            // Törölve: localStorage.setItem('countdownClosed', 'true');
        }
    };

    // Esoményfigyelő a bezáró gombra
    if (closeCountdownBtn) {
        closeCountdownBtn.addEventListener('click', hideFloatingCountdown);
    }

    // --- Időzítés a lebegő visszaszámláló megjelenítésére ---
    // Pl. 5 másodperc múlva jelenjen meg
    setTimeout(showFloatingCountdown, 5000); // 5000ms = 5 másodperc

    // --- Indítsuk el a visszaszámlálást ---
    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Első futtatás azonnal
});