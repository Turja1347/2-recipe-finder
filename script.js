// DOM elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

// Event Listeners
searchBtn.addEventListener("click", searchMeals);
mealsContainer.addEventListener("click", handleMealClick);
backBtn.addEventListener("click", () => {
  mealDetails.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMeals();
});

// Search for meals  by name
async function searchMeals() {
  const searchTerm = searchInput.value.trim();

  if (!searchTerm) {
    showError("Please enter a search term.");
    return;
  }

  try {
    resultHeading.textContent = `Searching for "${searchTerm}"...`;
    mealsContainer.innerHTML = "";
    errorContainer.classList.add("hidden");
    mealDetails.classList.add("hidden");

    const response = await fetch(`${SEARCH_URL}${searchTerm}`);
    const data = await response.json();

    if (data.meals === null) {
      showError(`No recipes found for "${searchTerm}". Try another search term!`);
      resultHeading.textContent = "";
    } else {
      resultHeading.textContent = `Search results for "${searchTerm}":`;
      displayMeals(data.meals);
      searchInput.value = "";
    }
  } catch (error) {
    showError("Something went wrong. Please try again later.");
  }
}

// Display meal cards
function displayMeals(meals) {
  mealsContainer.innerHTML = meals
    .map(
      (meal) => `
    <div class="meal" data-meal-id="${meal.idMeal}">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
      <div class="meal-info">
        <h3 class="meal-title">${meal.strMeal}</h3>
        ${
          meal.strCategory
            ? `<div class="meal-category">${meal.strCategory}</div>`
            : ""
        }
      </div>
    </div>
  `
    )
    .join("");
}

// Clicked a meal card - show detail
async function handleMealClick(e) {
  const mealEl = e.target.closest(".meal");
  if (!mealEl) return;

  const mealId = mealEl.getAttribute("data-meal-id");

  try {
    const response = await fetch(`${LOOKUP_URL}${mealId}`);
    const data = await response.json();

    if (data.meals && data.meals[0]) {
      showMealDetails(data.meals[0]);
    }
  } catch (error) {
    showError("Could not load recipe details. Please try again later.");
  }
}

// Show detailed meal info
function showMealDetails(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim() !== "") {
      ingredients.push(`${measure} ${ingredient}`);
    }
  }

  mealDetailsContent.innerHTML = `
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
    <h2 class="meal-details-title">${meal.strMeal}</h2>
    <div class="meal-details-category">
      <span>${meal.strCategory || "Uncategorized"}</span>
    </div>
    <div class="meal-details-instructions">
      <h3>Instructions</h3>
      <p>${meal.strInstructions}</p>
    </div>
    <div class="meal-details-ingredients">
      <h3>Ingredients</h3>
      <ul class="ingredients-list">
        ${ingredients
          .map(
            (item) => `<li><i class="fas fa-check-circle"></i> ${item}</li>`
          )
          .join("")}
      </ul>
    </div>
    ${
      meal.strYoutube
        ? `<a href="${meal.strYoutube}" target="_blank" class="youtube-link">
            <i class="fab fa-youtube"></i> Watch Video
          </a>`
        : ""
    }
  `;

  mealDetails.classList.remove("hidden");
  mealDetails.scrollIntoView({ behavior: "smooth" });
}

// Show error message
function showError(message) {
  errorContainer.textContent = message;
  errorContainer.classList.remove("hidden");
}
