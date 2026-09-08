(function () {
    'use strict';

    // Config for every page this script may run on.
    // filterAttr = the data-*-filter attribute used by that page's buttons.
    var PAGE_CONFIGS = [
        { gridId: 'courses-grid', emptyId: 'courses-empty', filterAttr: 'data-course-filter', searchId: 'course-search' },
        { gridId: 'tutorials-grid', emptyId: 'tutorials-empty', filterAttr: 'data-tutorial-filter', searchId: 'tutorial-search' },
        { gridId: 'films-grid', emptyId: 'films-empty', filterAttr: 'data-film-filter', searchId: null },
        { gridId: 'music-grid', emptyId: 'music-empty', filterAttr: 'data-music-filter', searchId: null }
    ];

    function normalize(str) {
        return (str || '').toString().trim().toLowerCase();
    }
    function cardMatchesFilter(card, filterValue) {
        if (!filterValue || filterValue === 'all') return true;

        var category = normalize(card.getAttribute('data-category'));
        var level = normalize(card.getAttribute('data-level'));

        if (!category && !level) {
            var tag = card.querySelector('.media-card-body .tag');
            category = tag ? normalize(tag.textContent) : '';
        }

        return filterValue === category || filterValue === level;
    }

    /** Combined, lowercased searchable text for a card (title + summary/description + tags). */
    function getCardText(card) {
        return normalize(card.textContent);
    }

    function initGallery(config) {
        var grid = document.getElementById(config.gridId);
        if (!grid) return; // this page doesn't have this gallery, skip silently

        var cards = Array.prototype.slice.call(
            grid.querySelectorAll('article.card, article[data-course-card], article[data-tutorial-card], article[data-film-card], article[data-music-card]')
        );
        if (!cards.length) return;

        var emptyState = config.emptyId ? document.getElementById(config.emptyId) : null;
        var filterButtons = Array.prototype.slice.call(
            document.querySelectorAll('[' + config.filterAttr + ']')
        );
        var searchInput = config.searchId ? document.getElementById(config.searchId) : null;

        var activeFilter = 'all';
        var activeQuery = '';

        // Pick up whichever button is already marked pressed on page load,
        // so we don't fight any pre-existing state.
        var preset = filterButtons.filter(function (btn) {
            return btn.getAttribute('aria-pressed') === 'true';
        })[0];
        if (preset) {
            activeFilter = normalize(preset.getAttribute(config.filterAttr));
        }

        function applyFilters() {
            var visibleCount = 0;

            cards.forEach(function (card) {
                var matchesFilter = cardMatchesFilter(card, activeFilter);
                var matchesSearch = !activeQuery || getCardText(card).indexOf(activeQuery) !== -1;
                var show = matchesFilter && matchesSearch;

                card.hidden = !show;
                card.style.display = show ? '' : 'none';
                if (show) visibleCount++;
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        if (filterButtons.length) {
            filterButtons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var value = normalize(btn.getAttribute(config.filterAttr));

                    activeFilter = value;

                    filterButtons.forEach(function (b) {
                        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
                    });

                    applyFilters();
                });
            });
        }

        if (searchInput) {
            var debounceTimer = null;
            searchInput.addEventListener('input', function () {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function () {
                    activeQuery = normalize(searchInput.value);
                    applyFilters();
                }, 120);
            });
        }

        // Initial paint in case markup ships with a non-"All" default.
        applyFilters();
    }

    function init() {
        PAGE_CONFIGS.forEach(initGallery);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
