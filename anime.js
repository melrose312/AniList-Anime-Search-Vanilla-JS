// GET ANIME ID FROM URL
const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get("id");


const seriesLoading = document.querySelector(".series__loading");
const seriesWrapper = document.querySelector(".series__page--wrapper");
const backLink = document.querySelector(".back__link");
const charactersSection = document.querySelector(".characters__section");

// GRAPHQL QUERY
const animeDetailQuery = `
  query ($id: Int) {
    Media (id: $id, type: ANIME) {
      id
      title {
        romaji
        english
      }
      description(asHtml: false)
      coverImage {
        extraLarge
        large
      }
      averageScore
      genres
      seasonYear
      format
      episodes
      status
      characters (sort: ROLE, perPage: 12) {
        nodes {
          name {
            full
          }
          image {
            medium
          }
        }
      }
    }
  }
`;

const apiUrl = "https://graphql.anilist.co";

// FETCH ANIME DETAILS
async function fetchAnimeDetails() {
    if (!animeId) {
        window.location.href = "index.html";
        return;
    }

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            query: animeDetailQuery,
            variables: { id: parseInt(animeId) },
        }),
    });

    const data = await response.json();
    const anime = data.data.Media;

    if (!anime) {
        window.location.href = "index.html";
        return;
    }

    setTimeout(() => {
        seriesLoading.classList.remove("active");
        backLink.classList.add("active");
        seriesWrapper.classList.add("active");
        renderAnimeDetails(anime);
    }, 500);
}

// RENDER ANIME DETAILS
function renderAnimeDetails(anime) {

    document.title = `${anime.title.english || anime.title.romaji} — AniList`;


    const seriesPoster = document.querySelector(".series__page--img img");
    seriesPoster.src = anime.coverImage.extraLarge || anime.coverImage.large;
    seriesPoster.alt = anime.title.english || anime.title.romaji;


    document.querySelector(".series__page--title").textContent =
        anime.title.english || anime.title.romaji;


    const ratingEl = document.querySelector(".series__page--rating");
    const score = anime.averageScore;
    ratingEl.innerHTML = `<span style="color: ${getRatingColor(score)}">★ ${score ? score + "%" : "N/A"}</span>`;


    const seriesInfoWrapper = document.querySelector(".series__page--details");
    const seriesInfoBadges = [];
    if (anime.format) seriesInfoBadges.push(`<span class="detail__badge">${formatType(anime.format)}</span>`);
    if (anime.seasonYear) seriesInfoBadges.push(`<span class="detail__badge">${anime.seasonYear}</span>`);
    if (anime.episodes) seriesInfoBadges.push(`<span class="detail__badge">${anime.episodes} Episodes</span>`);
    if (anime.genres && anime.genres.length > 0) {
        anime.genres.forEach((genre) => {
            seriesInfoBadges.push(`<span class="detail__badge">${genre}</span>`);
        });
    }
    seriesInfoWrapper.innerHTML = seriesInfoBadges.join("");

    
    const seriesDesc = document.querySelector(".series__page--description");
    // Remove any unique characters in the desc
    const cleanDescription = anime.description
        ? anime.description.replace(/<[^>]*>/g, "")
        : "No description available.";
    seriesDesc.textContent = cleanDescription;

    // CHARACTERS
    const characters = anime.characters?.nodes || [];
    if (characters.length > 0) {
        charactersSection.classList.add("active");
        const charsWrapper = document.querySelector(".characters__wrapper");
        charsWrapper.innerHTML = characters
            .map((char) => {
                return `<div class="character__card">
            <div class="character__img--wrapper">
              <img class="character__img" src="${char.image?.medium || ""}" alt="${char.name.full}" />
            </div>
            <p class="character__name">${char.name.full}</p>
          </div>`;
            })
            .join("");
    }
}

// FORMAT TYPE STRINGS (TV_SHORT -> Tv Short)
function formatType(str) {
    return str
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

// RATING COLOR
function getRatingColor(rating) {
    if (rating >= 80) return "#4caf50";
    if (rating >= 65) return "#ffc107";
    return "#f44336";
}

// LOAD ON PAGE LOAD
fetchAnimeDetails();
