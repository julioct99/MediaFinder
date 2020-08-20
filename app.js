//
// ─── UI ELEMENTS ────────────────────────────────────────────────────────────────
//


const deck = document.querySelector('#deck');
const form = document.querySelector('#search-form');
const loadingAnimation = document.querySelector('#loading');
const searchBox = document.querySelector('#search');
const messageContainer = document.querySelector('#message');
const messageContent = document.querySelector('#message-content');


//
// ─── FUNCTIONS ──────────────────────────────────────────────────────────────────
//


// Shows a message under the search box
function showMessage(message) {
    messageContainer.classList.remove('hidden');
    messageContent.textContent = message;
}


// Clears the UI elements: search box content, 'no results' message and the loading animation
function clearUI() {
    searchBox.value = '';
    messageContainer.classList.add('hidden');
    setTimeout(() => {
        loadingAnimation.classList.toggle('hidden');
    }, 1000);
}


// Returns the HTML fragment of a score (IMDB, RottenTomatoes or Metacritic)
function scoreHTML(image, score) {
    return `<div class="d-flex flex-column">
                <div class="row align-items-center mb-2">
                    <div class="col">
                        <img class="icon" src=${image} alt="Score logo">
                    </div>
                    <div class="col">
                        <span class="score">${score}</span>
                    </div>
                </div>
            </div>`;
}


// Load the ids of the items obtained from the given search query
function loadIds(query) {

    let page = 1;

    while (page < 4) {
        axios
            .get(`http://www.omdbapi.com/?s=${query}&apikey=thewdb&page=${page}`)
            .then(res => {
                let items = res.data["Search"];
                if (items) {
                    items.forEach((item, index) => {
                        loadItem(item["imdbID"]);
                    });
                } else if (page === 1) {
                    showMessage('No results found');
                }
            })
            .catch(err => {
                console.log(err);
            });
        page++;
    }
}


// Gets the item(movie, tv show, etc) data from the API given its id
function loadItem(id) {
    axios
        .get(`http://www.omdbapi.com/?i=${id}&apikey=thewdb`)
        .then(res => {
            let item = res.data;
            appendItem(item);
        })
        .catch(err => console.log(err));
}


// Appends a card to the deck
function appendItem(item) {
    let card = document.createElement('div');
    card.className = 'col-lg-4 col-sm-6 mb-4';

    // Poster
    let poster = item["Poster"];
    let posterHTML = ''; // HTML fragment for the poster of the card
    if (poster !== 'N/A') {
        posterHTML = `
            <img src="${poster}" class="card-img-top" alt="Poster">
        `;
    }

    // Imdb rating
    let imdbRating = item['imdbRating'];
    let imdbHTML = scoreHTML("img/imdb.png", imdbRating);

    // Rotten tomatoes rating
    let rtRating = 'N/A';
    let rtHTML = ''; // HTML fragment for the Rotten Tomatoes score
    if (item['Ratings'][1] !== undefined) {
        rtRating = item['Ratings'][1]['Value'];
    }
    if (rtRating !== 'N/A') {
        rtHTML = scoreHTML("img/rotten_tomatoes.png", rtRating);
    }

    // Metascore rating
    let mcRating = item['Metascore'];
    let mcHTML = ''; // HTML fragment for the Metacritic score
    if (mcRating !== 'N/A') {
        mcHTML = scoreHTML("img/metacritic.png", mcRating);
    }

    // Card element
    card.innerHTML = `
        <div class="card bg-dark mb-3">
            ${posterHTML} 
            <div class="card-body">
                <a href=https://www.imdb.com/title/${item["imdbID"]}><h5 class="card-title">${item['Title']}<span class="item-year">  (${item['Year']})</span></h5></a>
                <p>${item['imdbVotes']} IMDB votes</p>
                <div class="d-flex justify-content-center align-items-center text-center">
                    ${imdbHTML}
                    ${mcHTML} 
                    ${rtHTML}  
                </div>
            </div>
        </div>
    `;

    deck.appendChild(card);
}


//
// ─── EVENT LISTENERS ────────────────────────────────────────────────────────────
//


// Listen for the search form submit
form.addEventListener('submit', e => {

    // Clear the deck
    deck.innerHTML = '';

    // Get the query value
    const query = searchBox.value;

    // Show loading image
    loadingAnimation.classList.toggle('hidden');

    // Load the items
    loadIds(query);

    // Clear the UI
    clearUI();

    // Prevent default submit action
    e.preventDefault();
});