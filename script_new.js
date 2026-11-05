
/* =====================================
   GAMEHUB - MAIN JAVASCRIPT
   File: script_new.js
===================================== */

document.addEventListener("DOMContentLoaded", () => {

    // ---------- ELEMENTS ----------
    const searchInput = document.querySelector(
        "#searchInput, #gameSearch, .search-input"
    );

    const searchToggle = document.querySelector(
        "#searchToggle, .search-toggle"
    );

    const favoritesToggle = document.querySelector(
        "#favoritesToggle, #favoriteToggle, .favorites-toggle"
    );

    const menuToggle = document.querySelector(
        "#menuToggle, .menu-toggle"
    );

    const searchBox = document.querySelector(
        "#searchBox, .search-box, .search-container"
    );

    const navLinks = document.querySelector(
        ".nav-links, .main-nav, .navigation"
    );

    const gamesGrid = document.querySelector(
        "#gamesGrid, .games-grid"
    );

    const gameCards = Array.from(
        document.querySelectorAll(".game-card")
    );

    const categoryButtons = document.querySelectorAll(
        ".category-btn, [data-category]"
    );

    // ---------- SETTINGS ----------
    const STORAGE_KEY = "gamehub_favorites";

    let activeCategory = "all";
    let showFavoritesOnly = false;

    let favorites = [];

    try {
        favorites = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        ) || [];
    } catch (error) {
        favorites = [];
    }

    // ---------- CARD INFORMATION ----------
    function getCardKey(card) {
        return (
            card.dataset.id ||
            card.dataset.title ||
            card.querySelector("h2, h3, h4")?.textContent.trim() ||
            card.querySelector("a")?.getAttribute("href") ||
            ""
        ).toLowerCase();
    }

    function getCardCategory(card) {
        return (
            card.dataset.category || "all"
        ).toLowerCase();
    }

    function saveFavorites() {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(favorites)
        );
    }

    // ---------- FAVORITE BUTTONS ----------
    gameCards.forEach((card) => {

        const key = getCardKey(card);

        if (!key) return;

        let favoriteButton = card.querySelector(
            ".favorite-btn, .game-favorite"
        );

        if (!favoriteButton) {
            favoriteButton = document.createElement("button");

            favoriteButton.className = "favorite-btn";
            favoriteButton.type = "button";
            favoriteButton.setAttribute(
                "aria-label",
                "Add to favorites"
            );

            favoriteButton.innerHTML = "♡";

            card.appendChild(favoriteButton);
        }

        function updateFavoriteButton() {
            const isFavorite = favorites.includes(key);

            favoriteButton.innerHTML = isFavorite ? "♥" : "♡";

            favoriteButton.classList.toggle(
                "active",
                isFavorite
            );

            favoriteButton.setAttribute(
                "aria-pressed",
                String(isFavorite)
            );

            favoriteButton.setAttribute(
                "aria-label",
                isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"
            );
        }

        updateFavoriteButton();

        favoriteButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (favorites.includes(key)) {
                favorites = favorites.filter(
                    item => item !== key
                );
            } else {
                favorites.push(key);
            }

            saveFavorites();
            updateFavoriteButton();
            filterGames();
        });
    });

    // ---------- SEARCH ----------
    function filterGames() {

        const searchText = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        gameCards.forEach((card) => {

            const title = (
                card.dataset.title ||
                card.querySelector("h2, h3, h4")?.textContent ||
                ""
            ).toLowerCase();

            const description = (
                card.dataset.description ||
                card.textContent ||
                ""
            ).toLowerCase();

            const category = getCardCategory(card);
            const key = getCardKey(card);

            const matchesSearch =
                title.includes(searchText) ||
                description.includes(searchText);

            const matchesCategory =
                activeCategory === "all" ||
                category === activeCategory;

            const matchesFavorites =
                !showFavoritesOnly ||
                favorites.includes(key);

            const shouldShow =
                matchesSearch &&
                matchesCategory &&
                matchesFavorites;

            card.hidden = !shouldShow;
        });

        updateNoResults();
    }

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            filterGames
        );
    }

    // ---------- CATEGORY FILTER ----------
    categoryButtons.forEach((button) => {

        button.addEventListener("click", (event) => {

            const category = (
                button.dataset.category ||
                button.dataset.filter ||
                button.textContent.trim()
            ).toLowerCase();

            if (!category) return;

            activeCategory = category;

            categoryButtons.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            filterGames();
        });
    });

    // ---------- FAVORITES FILTER ----------
    if (favoritesToggle) {

        favoritesToggle.addEventListener("click", () => {

            showFavoritesOnly = !showFavoritesOnly;

            favoritesToggle.classList.toggle(
                "active",
                showFavoritesOnly
            );

            favoritesToggle.setAttribute(
                "aria-pressed",
                String(showFavoritesOnly)
            );

            filterGames();
        });
    }

    // ---------- SEARCH SHOW / HIDE ----------
    if (searchToggle) {

        searchToggle.addEventListener("click", () => {

            if (searchBox) {
                searchBox.classList.toggle("active");
                searchBox.classList.toggle("show");
            }

            if (searchInput) {
                searchInput.focus();
            }
        });
    }

    // ---------- MOBILE MENU ----------
    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            const isOpen = navLinks.classList.toggle("active");

            menuToggle.classList.toggle("active", isOpen);

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        navLinks.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                menuToggle.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            });

        });
    }

    // ---------- NO RESULTS MESSAGE ----------
    function updateNoResults() {

        if (!gamesGrid) return;

        let message = document.querySelector(
            "#noResultsMessage"
        );

        const visibleCards = gameCards.filter(
            card => !card.hidden
        );

        if (visibleCards.length === 0) {

            if (!message) {
                message = document.createElement("p");

                message.id = "noResultsMessage";
                message.className = "no-results";

                message.textContent =
                    "No games found. Try another search!";
                
                gamesGrid.appendChild(message);
            }

            message.hidden = false;

        } else if (message) {
            message.hidden = true;
        }
    }

    // ---------- CLEAR SEARCH WITH ESC ----------
    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            if (searchInput) {
                searchInput.value = "";
            }

            filterGames();

            if (searchBox) {
                searchBox.classList.remove("active", "show");
            }

            if (navLinks) {
                navLinks.classList.remove("active");
            }
        }
    });

    // ---------- SMOOTH SCROLL ----------
    document.querySelectorAll('a[href^="#"]').forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {
                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    // ---------- INITIALIZE ----------
    filterGames();

    console.log("🎮 GameHub JavaScript Loaded Successfully!");

});
