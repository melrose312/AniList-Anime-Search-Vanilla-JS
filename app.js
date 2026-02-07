// HANDLE SEARCH

const searchInput = document.getElementById("search__input");
const searchButton = document.querySelector(".search__input button");
const seriesWrapper = document.querySelector(".series__wrapper");
const seriesLoading = document.querySelector(".series__loading");

function handleSearch() {
    const searchTerm = searchInput.value;
    // console.log(searchTerm);
    if (searchTerm) {
        fetchAnime(searchTerm);
    }
}

searchButton.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        handleSearch();
    }
});

// SHOW LOADING

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
        genres
        seasonYear
        format
        description
      }
    }
  }
`;

async function fetchAnime(searchTerm) {
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
    renderAnime(animeData);
}

function renderAnime(animeData) {
    const animeHTML = animeData.map(anime => {
        return `<div class="series__card">
            <figure class="series__img--wrapper">
              <img class="series__img" src="${anime.coverImage.large}" alt="${anime.title.english || anime.title.romaji}" />
            </figure>
            <div class="series__title">${anime.title.english || anime.title.romaji}</div>
            <div class="series__ratings"> Rating: ${(anime.averageScore)}</div>
          </div> `
    }).join("");

    seriesWrapper.innerHTML = animeHTML;
    console.log(animeHTML)
}