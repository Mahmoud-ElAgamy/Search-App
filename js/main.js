// Dom Elements
const form = document.getElementById("search-entry__form");
const input = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const clearBtn = document.getElementById("clear-btn");
const statsLine = document.getElementById("stats");
const searchResult = document.getElementById("search-results");
const searchIcon = document.querySelector(".fa-magnifying-glass");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  addSpinner(searchIcon);
  deleteSearchResults();
  processTheSearch();
  form.reset();
  input.focus();
  showClearBtn();
});

const deleteSearchResults = () => {
  let child = searchResult.lastElementChild;
  while (child) {
    searchResult.removeChild(child);
    child = searchResult.lastElementChild;
  }
};

const processTheSearch = async () => {
  statsLine.innerText = "";
  const searchTerm = getSearchTerm();
  const resultArray = await retrieveSearchResults(searchTerm);
  if (resultArray.length) buildSearchResults(resultArray);
  setTheStatsLine(resultArray.length);
};

const getSearchTerm = () => {
  const rawSearchTerm = input.value.trim();
  const regex = /\s{2,}/gi;
  const searchTerm = rawSearchTerm.replace(regex, " ");
  return searchTerm;
};

const retrieveSearchResults = async (searchTerm) => {
  const wikiSearchString = getWikiSearchString(searchTerm);
  const wikiSearchResults = await requestData(wikiSearchString);
  let resultArray = [];
  if (wikiSearchResults.hasOwnProperty("query")) {
    resultArray = processWikiResults(wikiSearchResults.query.pages);
  }
  return resultArray;
};

const getWikiSearchString = (searchTerm) => {
  const maxChars = getMaxChars();
  const rawSearchString = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrlimit=20&prop=pageimages|extracts&exchars=${maxChars}&exintro&explaintext&exlimit=max&format=json&origin=*`;
  const searchString = encodeURI(rawSearchString);
  return searchString;
};

const getMaxChars = () => {
  const width = innerWidth || document.body.clientWidth;
  let maxChars;
  if (width < 414) maxChars = 65;
  if (width >= 414 && width < 1400) maxChars = 100;
  if (width >= 1400) maxChars = 130;
  return maxChars;
};

const requestData = async (searchString) => {
  try {
    const response = await fetch(searchString);
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(e);
  }
};

const processWikiResults = (results) => {
  const resultArray = [];
  Object.keys(results).forEach((key) => {
    const item = {
      id: key,
      title: results[key].title,
      text: results[key].extract,
      img: results[key].hasOwnProperty("thumbnail")
        ? results[key].thumbnail.source
        : null,
    };
    resultArray.push(item);
  });
  return resultArray;
};

const buildSearchResults = (results) => {
  results.forEach((result) => {
    const resultItem = createResultItem(result);
    const resultContent = document.createElement("div");
    resultContent.classList.add("result-contents");
    resultContent.innerHTML = `${
      result.img
        ? `<div class="result-img"><img src="${result.img}" alt="${result.title}"/></div>`
        : ""
    } <div class="result-txt"><p class="result-description">${
      result.text
    }</p></div>`;
    resultItem.appendChild(resultContent);
    searchResult.appendChild(resultItem);
  });
};

const createResultItem = (result) => {
  const resultItem = document.createElement("div");
  resultItem.classList.add("result-item");
  resultItem.innerHTML = `<h3 class="result-title">
  <a href="https://en.wikipedia.org/?curid=${result.id}" target="_blank">
  ${result.title}</a></h3>`;
  return resultItem;
};

const setTheStatsLine = (resultsNumber) => {
  if (resultsNumber) {
    statsLine.innerText = `Displaying ${resultsNumber} results.`;
  } else {
    statsLine.innerText = `Sorry, no results.`;
  }
};

const addSpinner = (ele) => {
  animateBtn(ele);
  setTimeout(animateBtn, 500, ele);
};

const animateBtn = (ele) => {
  ele.classList.toggle("d-none");
  ele.nextElementSibling.classList.toggle("d-none");
};

clearBtn.addEventListener("click", () => {
  clearBtn.classList.replace("d-block", "d-none");
  input.focus();
});

const showClearBtn = () => {
  if (input.value.length) {
    clearBtn.classList.replace("d-none", "d-block");
  } else {
    clearBtn.classList.replace("d-block", "d-none");
  }
};

input.addEventListener("input", showClearBtn);
