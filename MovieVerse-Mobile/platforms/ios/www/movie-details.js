const search = document.getElementById("search");
const searchButton = document.getElementById("button-search");
const form = document.getElementById("form");
const SEARCHPATH = "https://api.themoviedb.org/3/search/movie?&api_key=c5a20c861acf7bb8d9e987dcc7f1b558&query=";
const main = document.getElementById("main");
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const favoriteButton = document.getElementById("favorite-btn");
const searchTitle = document.getElementById("search-title");

function getClassByRate(vote){
    if (vote >= 8) {
        return 'green';
    }
    else if (vote >= 5) {
        return 'orange';
    }
    else {
        return 'red';
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = search.value.trim();

    if (searchTerm) {
        getMovies(SEARCHPATH + searchTerm);
        searchTitle.innerHTML = 'Search Results for: ' + searchTerm;
        otherTitle.innerHTML = 'Check out other movies:';
        search.value = '';
    }
    else {
        searchTitle.innerHTML = 'Please enter a search term.';
    }
});

searchButton.addEventListener('click', (e) => {
    e.preventDefault();
    const searchTerm = search.value;

    if (searchTerm) {
        getMovies(SEARCHPATH + searchTerm);
        searchTitle.innerHTML = 'Search Results for: ' + searchTerm;
        otherTitle.innerHTML = 'Check out other movies:';
        search.value = '';
    }
    else {
        searchTitle.innerHTML = 'Please enter a search term.';
    }
});

function calculateMoviesToDisplay() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 689.9) return 10;
    if (screenWidth <= 1021.24) return 20;
    if (screenWidth <= 1353.74) return 21;
    if (screenWidth <= 1684.9) return 20;
    if (screenWidth <= 2017.49) return 20;
    if (screenWidth <= 2349.99) return 18;
    if (screenWidth <= 2681.99) return 21;
    if (screenWidth <= 3014.49) return 24;
    if (screenWidth <= 3345.99) return 27;
    if (screenWidth <= 3677.99) return 20;
    if (screenWidth <= 4009.99) return 22;
    if (screenWidth <= 4340.99) return 24;
    if (screenWidth <= 4673.49) return 26;
    if (screenWidth <= 5005.99) return 28;
    if (screenWidth <= 5337.99) return 30;
    if (screenWidth <= 5669.99) return 32;
    if (screenWidth <= 6001.99) return 34;
    if (screenWidth <= 6333.99) return 36;
    if (screenWidth <= 6665.99) return 38;
    if (screenWidth <= 6997.99) return 40;
    if (screenWidth <= 7329.99) return 42;
    if (screenWidth <= 7661.99) return 44;
    if (screenWidth <= 7993.99) return 46;
    if (screenWidth <= 8325.99) return 48;
    return 20;
}

async function getMovies(url) {
    clearMovieDetails();
    const numberOfMovies = calculateMoviesToDisplay();
    const pagesToFetch = numberOfMovies <= 20 ? 1 : 2;
    let allMovies = [];

    for (let page = 1; page <= pagesToFetch; page++) {
        const response = await fetch(`${url}&page=${page}`);
        const data = await response.json();
        allMovies = allMovies.concat(data.results);
    }

    // Sort movies by vote_average in descending order
    allMovies.sort((a, b) => b.vote_average - a.vote_average);

    // Display the sorted movies
    if (allMovies.length > 0) {
        showMovies(allMovies.slice(0, numberOfMovies));
    }
    else {
        main.innerHTML = `<p>No movie with the specified search term found. Please try again.</p>`;
    }
}

function clearMovieDetails() {
    const movieDetailsContainer = document.getElementById('movie-details-container');
    if (movieDetailsContainer) {
        movieDetailsContainer.innerHTML = '';
    }
}

function showMovies(movies){
    main.innerHTML = '';
    movies.forEach((movie) => {
        const { id, poster_path, title, vote_average, overview } = movie;
        const movieE1 = document.createElement('div');
        const voteAverage = vote_average.toFixed(1);
        movieE1.classList.add('movie');

        const movieImage = poster_path
            ? `<img src="${IMGPATH + poster_path}" alt="${title}" style="cursor: pointer;" />`
            : `<div class="no-image" style="text-align: center; padding: 20px;">Image Not Available</div>`;

        movieE1.innerHTML = `
            ${movieImage} 
            <div class="movie-info" style="cursor: pointer;">
                <h3>${title}</h3>
                <span class="${getClassByRate(vote_average)}">${voteAverage}</span>
            </div>
            <div class="overview" style="cursor: pointer;">
                <h4>Movie Overview: </h4>
                ${overview}
            </div>`;

        movieE1.addEventListener('click', () => {
            localStorage.setItem('selectedMovieId', id); // Store the movie ID
            window.location.href = 'movie-details.html';
        });

        main.appendChild(movieE1);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const movieId = localStorage.getItem('selectedMovieId');
    if (movieId) {
        fetchMovieDetails(movieId);
    }
    else {
        document.getElementById('movie-details-container').innerHTML = '<p>Movie details not found.</p>';
    }
});

async function fetchMovieDetails(movieId) {
    const code = 'c5a20c861acf7bb8d9e987dcc7f1b558';
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${code}&append_to_response=credits,keywords,similar`;
    const url2 = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${code}&append_to_response=videos`;

    try {
        // Fetch the movie details
        const response = await fetch(url);
        const movie = await response.json();
        const response2 = await fetch(url2);
        const movie2 = await response2.json();
        populateMovieDetails(movie);
        // Fetch and display the trailer
        const trailers = movie2.videos.results.filter(video => video.type === 'Trailer');
        if (trailers.length > 0) {
            const trailerUrl = `https://www.youtube.com/watch?v=${trailers[0].key}`;
            createTrailerButton(trailerUrl);
        }
    }
    catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

function createTrailerButton(trailerUrl) {
    const trailerButton = document.createElement('button');
    trailerButton.textContent = 'Watch Trailer';
    trailerButton.onclick = () => window.open(trailerUrl, '_blank');
    trailerButton.classList.add('trailer-button'); // Add a class for styling

    // Find the element to insert the button after
    const movieRating = document.getElementById('movie-rating');
    movieRating.parentNode.insertBefore(trailerButton, movieRating.nextSibling);
}


function toggleFavorite(movie) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.includes(movie.id)) {
        favorites = favorites.filter(favId => favId !== movie.id);
    }
    else {
        favorites.push(movie.id);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButton(movie.id);
}

function updateFavoriteButton(movieId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoriteButton = document.getElementById('favorite-btn');
    if (favorites.includes(movieId)) {
        favoriteButton.classList.add('favorited');
    }
    else {
        favoriteButton.classList.remove('favorited');
    }
}

function populateMovieDetails(movie) {
    const movieRating = movie.vote_average.toFixed(1);
    document.getElementById('movie-image').src = `https://image.tmdb.org/t/p/w1280${movie.poster_path}`;
    document.getElementById('movie-title').textContent = movie.title;
    // document.getElementById('movie-description').textContent = movie.overview;
    document.getElementById('movie-rating').textContent = `IMDB Rating: ${movieRating}`;
    document.title = movie.title + " - Movie Details";

    const movieImage = document.getElementById('movie-image');
    const movieTitle = document.getElementById('movie-title');
    const movieDescription = document.getElementById('movie-description');

    if (movie.poster_path) {
        movieImage.src = IMGPATH + movie.poster_path;
        movieImage.alt = movie.title;
    }
    else {
        // Hide the image element and show a message
        movieImage.style.display = 'none';
        const noImageText = document.createElement('h2');
        noImageText.textContent = 'Image Not Available';
        noImageText.style.textAlign = 'center';
        document.querySelector('.movie-left').appendChild(noImageText); // Append this message in the left section
    }

    const overview = movie.overview;
    const genres = movie.genres.map(genre => genre.name).join(', ');
    const releaseDate = movie.release_date;
    const runtime = movie.runtime + ' minutes';
    const budget = movie.budget === 0 ? 'Unknown' : `$${movie.budget.toLocaleString()}`;
    const revenue = movie.revenue === 0 ? 'Unknown' : `$${movie.revenue.toLocaleString()}`;
    const productionCompanies = movie.production_companies.map(pc => pc.name).join(', ');
    const tagline = movie.tagline ? movie.tagline : 'No tagline found';
    const languages = movie.spoken_languages.map(lang => lang.name).join(', ');
    const countries = movie.production_countries.map(country => country.name).join(', ');
    const originalLanguage = movie.original_language.toUpperCase();
    const popularityScore = movie.popularity.toFixed(2);
    const status = movie.status;
    const userScore = movie.vote_average;
    const voteCount = movie.vote_count.toLocaleString();
    let keywords = movie.keywords ? movie.keywords.keywords.map(kw => kw.name).join(', ') : 'None Available';
    const similarTitles = movie.similar ? movie.similar.results.map(m => m.title).join(', ') : 'None Available';

    if (keywords.length === 0) {
        keywords = 'None Available';
    }

    document.getElementById('movie-description').innerHTML += `
        <p><strong>Description: </strong>${overview}</p>
        <p><strong>Genres:</strong> ${genres}</p>
        <p><strong>Release Date:</strong> ${releaseDate}</p>
        <p><strong>Runtime:</strong> ${runtime}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Revenue:</strong> ${revenue}</p>
        <p><strong>Production Companies:</strong> ${productionCompanies}</p>
        <p><strong>Tagline:</strong> ${tagline}</p>
        <p><strong>Languages:</strong> ${languages}</p>
        <p><strong>Countries of Production:</strong> ${countries}</p>
        <p><strong>Original Language:</strong> ${originalLanguage}</p>
        <p><strong>Popularity Score:</strong> ${popularityScore}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>User Score:</strong> ${userScore} (based on ${voteCount} votes)</p>
    `;

    if (movie.credits && movie.credits.crew) {
        const director = movie.credits.crew.find(member => member.job === 'Director');
        if (director) {
            const directorAge = director.birthday ? calculateAge(director.birthday) : 'N/A';
            const directorElement = document.createElement('p');
            directorElement.innerHTML = `<strong>Director:</strong> <a href="director-details.html" class="director-link">${director.name}</a>`;
            directorElement.querySelector('.director-link').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.setItem('selectedDirectorId', director.id);
                document.title = `${director.name} - Director's Details`;
                window.location.href = 'director-details.html';
            });
            document.getElementById('movie-description').appendChild(directorElement);
        }
    }

    // Display the cast
    const castHeading = document.createElement('p');
    castHeading.innerHTML = '<strong>Cast:</strong> ';
    document.getElementById('movie-description').appendChild(castHeading);

    if (movie.credits && movie.credits.cast.length > 0) {
        const topTenCast = movie.credits.cast.slice(0, 10); // Get only the first 10 actors
        topTenCast.forEach((actor, index) => {
            const actorLink = document.createElement('span');
            actorLink.textContent = actor.name;
            actorLink.classList.add('actor-link'); // Add class for styling
            actorLink.addEventListener('click', () => {
                localStorage.setItem('selectedActorId', actor.id);
                window.location.href = 'actor-details.html';
            });

            castHeading.appendChild(actorLink);

            // Add a comma after each actor name except the last one
            if (index < topTenCast.length - 1) {
                castHeading.appendChild(document.createTextNode(', '));
            }
        });
    }
    else {
        castHeading.appendChild(document.createTextNode('None available.'));
    }

    const similarMoviesHeading = document.createElement('p');
    similarMoviesHeading.innerHTML = '<strong>Similar Movies:</strong> ';
    document.getElementById('movie-description').appendChild(similarMoviesHeading);

    if (movie.similar && movie.similar.results.length > 0) {
        movie.similar.results.forEach((similarMovie, index) => {
            const movieLink = document.createElement('span');
            movieLink.textContent = similarMovie.title;
            movieLink.style.cursor = 'pointer';
            movieLink.style.textDecoration = 'underline';
            movieLink.addEventListener('mouseenter', () => {
                movieLink.style.color = '#f509d9';
            });
            movieLink.addEventListener('mouseleave', () => {
                movieLink.style.color = 'white';
            });
            movieLink.addEventListener('click', () => {
                localStorage.setItem('selectedMovieId', similarMovie.id); // Store the clicked movie's ID
                window.location.href = 'movie-details.html'; // Redirect to the details page
            });

            // Append the clickable movie link
            similarMoviesHeading.appendChild(movieLink);

            // If not the last movie, add a comma and space
            if (index < movie.similar.results.length - 1) {
                similarMoviesHeading.appendChild(document.createTextNode(', '));
            }
        });
    }
    else {
        similarMoviesHeading.appendChild(document.createTextNode('None available.'));
    }
    // Keywords
    const keywordsElement = document.createElement('p');
    keywordsElement.innerHTML = `<strong>Keywords:</strong> ${keywords}`;
    movieDescription.appendChild(keywordsElement);
    updateFavoriteButton(movie.id);
    favoriteButton.addEventListener('click', () => toggleFavorite(movie));
}

async function showMovieOfTheDay(){
    const year = new Date().getFullYear();
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=c5a20c861acf7bb8d9e987dcc7f1b558&sort_by=vote_average.desc&vote_count.gte=100&primary_release_year=${year}&vote_average.gte=7`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const movies = data.results;
        const randomMovie = movies[Math.floor(Math.random() * movies.length)];

        // Store the selected movie ID in localStorage and redirect to movie-details page
        localStorage.setItem('selectedMovieId', randomMovie.id);
        window.location.href = 'movie-details.html';
    }
    catch (error) {
        console.error('Error fetching movie:', error);
        alert('Failed to fetch the movie of the day. Please try again later.');
    }
}