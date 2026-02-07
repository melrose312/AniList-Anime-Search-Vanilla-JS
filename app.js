
const searchInput = document.getElementById("search__input");
const seriesWrapper = document.querySelector(".series__wrapper");
const seriesLoading = document.querySelector(".series__loading");
const seriesHeader = document.querySelector(".series__header");
const sectionTitle = document.querySelector(".section__title");
const filterSeries = document.getElementById("filter");

let currentAnimeData = [];

function handleSearch() {
  const searchTerm = searchInput.value;
  if (searchTerm) {
    fetchAnime(searchTerm);
  }
}

searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

filterSeries.addEventListener("change", () => {
  const sortedData = filterAnime(currentAnimeData, filterSeries.value);
  renderAnime(sortedData);
});

// FETCH API
const apiUrl = "https://graphql.anilist.co";

const animeSearch = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page (page: $page, perPage: $perPage) {
      media (search: $search, type: ANIME) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        averageScore
        popularity
        genres
        seasonYear
        format
        description
      }
    }
  }
`;

const displayTrending = `
  query ($page: Int, $perPage: Int) {
    Page (page: $page, perPage: $perPage) {
      media (type: ANIME, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        averageScore
        popularity
        genres
        seasonYear
        format
        description
      }
    }
  }
`;

// FETCH TRENDING ANIME ON PAGE LOAD
async function fetchTrending() {
  seriesLoading.classList.add("active");

  const variables = {
    page: 1,
    perPage: 12,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: displayTrending,
      variables,
    }),
  });

  const data = await response.json();
  const animeData = data.data.Page.media;

  setTimeout(() => {
    seriesLoading.classList.remove("active");
    currentAnimeData = animeData;
    sectionTitle.textContent = "Trending";
    renderAnime(animeData);
  }, 500);
}

// LOAD TRENDING ON PAGE LOAD
fetchTrending();

async function fetchAnime(searchTerm) {
  // ADDED TO STOP PREVIOUS RENDER FROM FLICKERING ON NEW SEARCHES
  seriesLoading.classList.add("active");
  seriesWrapper.innerHTML = "";
  sectionTitle.textContent = "Series & Movies";


  const variables = {
    search: searchTerm,
    page: 1,
    perPage: 12,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: animeSearch,
      variables,
    }),
  });

  const data = await response.json();
  const animeData = data.data.Page.media;

  // SHOW LOADING
  setTimeout(() => {
    seriesLoading.classList.remove("active");
    currentAnimeData = animeData;
    renderAnime(animeData);
  }, 500);
}

function filterAnime(data, sortType) {
  const sorted = [...data];
  // LOCALCOMPARE USED TO HELP SORT INTERNATIONAL CHARACTERS
  if (sortType === "A-Z") {
    return sorted.sort((a, b) =>
      (a.title.english || a.title.romaji || "").localeCompare(b.title.english || b.title.romaji || ""));
  } else if (sortType === "Z-A") {
    return sorted.sort((a, b) =>
      (b.title.english || b.title.romaji || "").localeCompare(a.title.english || a.title.romaji || ""));
  } else if (sortType === "RATING") {
    return sorted.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
  } else if (sortType === "POPULAR") {
    return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  } else {
    return sorted;
  }
}

function renderAnime(animeData) {
  const animeHTML = animeData.map(anime => {
    return `<div class="series__card">
            <figure class="series__img--wrapper">
              <img class="series__img" src="${anime.coverImage.large}" alt="${anime.title.english || anime.title.romaji}" />
            </figure>
            <div class="series__title">${anime.title.english || anime.title.romaji}</div>
            <div class="series__ratings"> Rating: ${anime.averageScore || 'N/A'}</div>
          </div> `
  }).join("");

  seriesWrapper.innerHTML = animeHTML;
  seriesHeader.classList.add("active");
  searchInput.value = "";
}