

// 1. Değişkenler ve Başlangıç Ayarları
let favoriFilmler = JSON.parse(localStorage.getItem("favoriler")) || [];
const filmListesi = document.querySelector("#filmListesi");
const aramaButon = document.querySelector("#araButon");
const aramaInput = document.querySelector("#filmAra");
const geceModuBtn = document.querySelector("#dark-mode-btn");

// Update favorite count and theme on page load
document.getElementById("favori-sayisi").innerText = favoriFilmler.length;
if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark-mode");
    geceModuBtn.innerHTML = "☀️ Light Mode";
} else {
    geceModuBtn.innerHTML = "🌙 Dark Mode";
}

// 2. Movie Search Function
async function filmAra(filmAdi) {
    const apiKey = "8f602a00";
    const url = `https://www.omdbapi.com/?s=${filmAdi}&apikey=${apiKey}`;

    try {
        const cevap = await fetch(url);
        const veriler = await cevap.json();
        
        filmListesi.innerHTML = ""; // Clear screen

        if (veriler.Search) {
            veriler.Search.forEach(veri => {
                const afis = veri.Poster !== "N/A" ? veri.Poster : "https://via.placeholder.com/300x450?text=Poster+Not+Found";
                const yeniDiv = document.createElement("div");
                yeniDiv.classList.add("film-kart");

                // Get details and flip card on click
                yeniDiv.onclick = () => filmDetayGetir(yeniDiv, veri.imdbID);

                yeniDiv.innerHTML = `
                    <div class="kart-ic">
                        <div class="kart-on">
                            <img src="${afis}">
                            <div class="film-baslik">${veri.Title}</div>
                        </div>
                        <div class="kart-arka">
                            <div class="detay-icerik">
                                <p id="metin-${veri.imdbID}" style="font-size: 13px;">Loading details...</p>
                                <small style="color: #ffc107;">(Click again to close)</small>
                                <button onclick="favoriyeEkle(event, '${veri.imdbID}', '${veri.Title.replace(/'/g, "\\'")}', '${afis}')" style="background:#ff4d4d; color:white; border:none; padding:8px; margin-top:10px; border-radius:5px; cursor:pointer; width:100%;">❤️ Favorite</button>
                                <button onclick="event.stopPropagation(); fragmanGoster('${veri.Title.replace(/'/g, "\\'")}')" style="background:#ffc107; color:black; border:none; padding:8px; border-radius:5px; margin-top:5px; cursor:pointer; width:100%;">🎬 Watch Trailer</button>
                            </div>
                        </div>
                    </div>
                `;
                filmListesi.appendChild(yeniDiv);
            });
        } else {
            filmListesi.innerHTML = "<p>No movies found! 🎬</p>";
        }
    } catch (hata) {
        console.error("Search error:", hata);
    }
}

// 3. Fetch Movie Details
async function filmDetayGetir(kartElementi, id) {
    kartElementi.classList.toggle('flipped');
    const detayMetni = document.querySelector(`#metin-${id}`);
    
    if (!detayMetni || detayMetni.innerText !== "Loading details...") return;

    const apiKey = "8f602a00";
    const url = `https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`;
    
    try {
        const cevap = await fetch(url);
        const detay = await cevap.json();

        detayMetni.innerHTML = `
            <strong style="color:#ffc107">Plot:</strong><br>
            ${detay.Plot.substring(0, 140)}... <br><br>
            <strong style="color:#ffc107">IMDb:</strong> ⭐${detay.imdbRating} | <strong>Year:</strong> ${detay.Year}
        `;
    } catch (hata) {
        detayMetni.innerText = "Failed to load details";
    }
}

// 4. Favorite Operations
function favoriyeEkle(event, id, baslik, afis) {
    event.stopPropagation(); 
    
    const filmIndex = favoriFilmler.findIndex(f => f.id === id);
    
    if (filmIndex === -1) {
        // Add
        favoriFilmler.push({ id, baslik, afis });
        alert(baslik + " added to favorites ✨");
    } else {
        // Remove
        favoriFilmler.splice(filmIndex, 1);
        alert(baslik + " removed from favorites! ❤️");
    }

    localStorage.setItem("favoriler", JSON.stringify(favoriFilmler));
    document.getElementById("favori-sayisi").innerText = favoriFilmler.length;

    if (window.favoriGorunumu) {
        favoriListesiniGoster();
    }
}

function favoriListesiniGoster() {
    window.favoriGorunumu = true; 
    filmListesi.innerHTML = "";

    if (favoriFilmler.length === 0) {
        filmListesi.innerHTML = `<div style="width:100%; text-align:center; padding:100px;"><h2>Your favorite list is empty ❤️</h2></div>`;
        return;
    }

    favoriFilmler.forEach(film => {
        const filmKart = document.createElement("div");
        filmKart.className = "film-kart";
        filmKart.onclick = () => filmKart.classList.toggle('flipped');

        filmKart.innerHTML = `
            <div class="kart-ic">
                <div class="kart-on">
                    <img src="${film.afis}">
                    <div class="film-baslik">${film.baslik}</div>
                </div>
                <div class="kart-arka">
                    <div class="detay-icerik">
                        <p style="font-weight:bold;">${film.baslik}</p>
                        <button onclick="favoriyeEkle(event, '${film.id}', '${film.baslik.replace(/'/g, "\\'")}', '${film.afis}')" style="background:#ff4d4d; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; width:100%;">❌ Remove</button>
                        <button onclick="event.stopPropagation(); fragmanGoster('${film.baslik.replace(/'/g, "\\'")}')" style="background:#ffc107; color:black; border:none; padding:8px; border-radius:5px; margin-top:5px; cursor:pointer; width:100%;">🎬 Watch Trailer</button>
                    </div>
                </div>
            </div>
        `;
        filmListesi.appendChild(filmKart);
    });
}

// 5. Trailer Functions
function fragmanGoster(filmBaslik) {
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(filmBaslik + " official trailer")}`;
    window.open(youtubeUrl, '_blank');
}

// 6. Event Listeners
aramaButon.addEventListener("click", () => {
    window.favoriGorunumu = false; 
    const secilenFilm = aramaInput.value;
    if (secilenFilm.trim() !== "") filmAra(secilenFilm);
});

aramaInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") aramaButon.click();
});

geceModuBtn.addEventListener("click", () => { 
    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")) {
        localStorage.setItem("tema", "dark");
        geceModuBtn.innerHTML = "☀️ Light Mode";
    } else {
        localStorage.setItem("tema", "light");
        geceModuBtn.innerHTML = "🌙 Dark Mode";
    }
});

async function rastgeleFilmOner() {
    const kelimeler = ["Batman", "Love", "War", "Space", "World", "Star", "Hero", "History", "Life", "Action"];
    const rastgeleKelime = kelimeler[Math.floor(Math.random() * kelimeler.length)];
    
    const rastgeleSayfa = Math.floor(Math.random() * 5) + 1;
    const apiKey = "8f602a00";
    const url = `https://www.omdbapi.com/?s=${rastgeleKelime}&page=${rastgeleSayfa}&apikey=${apiKey}`;

    try {
        const cevap = await fetch(url);
        const veriler = await cevap.json();
        
        if (veriler.Search) {
            const film = veriler.Search[Math.floor(Math.random() * veriler.Search.length)];
            document.getElementById("filmListesi").innerHTML = "";
            window.favoriGorunumu = false;
            filmAra(film.Title); 
            alert("I chose this for you: " + film.Title + " 🎲🍿");
        }
    } catch (hata) {
        alert("Something went wrong. Please try again! 🍿");
    }
}