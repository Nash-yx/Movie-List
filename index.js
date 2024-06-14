const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIE_PER_PAGE = 12;

const movies = [];
let filteredMoives = [];


const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");

function renderMovieList(data) {
  let rawHTML = "";

  data.forEach((item) => {
    // title, image
    // console.log(item);
    rawHTML += `<div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src="${POSTER_URL + item.image}"
                class="card-img-top"
                alt="Movie Poster"
              />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id=${
                  item.id
                }>More</button>
                <button class="btn btn-info btn-add-favorite" data-id=${
                  item.id
                }>+</button>
              </div>
            </div>
          </div>
        </div>`;
  });

  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function getMoviesByPage(page) {
  // page 1 -> movies 0 - 11
  // page 1 -> movies 12 - 23
  // page 1 -> movies 24 - 35
  // ...
  // movies ? "movies"(80筆) : "filteredMovies"
  const data = filteredMoives.length ? filteredMoives : movies

  const startIndex = (page - 1) * MOVIE_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中");
  }

  list.push(movie);
  console.log(list);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    // console.log(event.target.dataset);
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

paginator.addEventListener('click', function onPaginatorclicked(event) {
  if (event.target.tagName !== 'A') return // <a> </a>
  // console.log(event.target.dataset.page)
  const page = Number(event.target.dataset.page);
  renderMovieList(getMoviesByPage(page));
})

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  // for-loop 作法
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMoives.push(movie);
  //   }
  // }

  // .filter 作法
  filteredMoives = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMoives.length === 0) {
    return alert("Cannot find movies with keyword: " + keyword);
  }
  renderPaginator(filteredMoives.length)
  renderMovieList(getMoviesByPage(1));
});

axios
  .get(INDEX_URL)
  .then((response) => {
    // console.log(response);
    // console.log(response.data);
    // console.log(response.data.results);

    // 1. for...of 方法
    // for (const movie of response.data.results) {
    //   movies.push(movie);
    // }

    // 2. 用 ... 展開陣列
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  })
  .catch((err) => console.log(err));

// localStorage.setItem('default_language','english')
// console.log(localStorage.getItem("default_language"));
// localStorage.removeItem("default_language");
