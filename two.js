var modal = function() {}

var game = {}
var mode = "play"
var grid = null;

function getCurrentState() {
    var teams = [];
    var teams_dom = document.querySelectorAll(".team");
    for (var i = 0; i < teams_dom.length; i++) {
        var t = teams_dom[i];
        var name = t.querySelectorAll(".name")[0].textContent;
        var points = t.querySelectorAll(".points")[0].textContent;
        teams[i] = {
            name: name,
            points: points
        }
    }

    var inerts = {};
    var inert_dom = document.querySelectorAll(".grid-row-questions .inert");
    for (var i = 0; i < inert_dom.length; i++) {
        var id = inert_dom[i].getAttribute("id");
        inerts[id] = true;
    }

    return {
        "teams": teams,
        "inerts": inerts,
    }
}

function getOldState() {
    try {
        var old_state = localStorage.getItem("game-19436872")
    } catch (e) {
        return null;

    }
    if (old_state) {
        return JSON.parse(old_state);
    }
    return null;
}

function clearState() {
    try {
        localStorage.removeItem("game-19436872");
    } catch (e) {

    }
}

function resize() {
    var bbox_teams = getBoundingClientRect(document.getElementById("teams"))
    var rows = document.querySelectorAll(".grid-row").length;
    if (bbox_teams.height == 0) {
        var h = window.innerHeight;
    } else {
        var h = bbox_teams.top + ((window.innerHeight - bbox_teams.height) / (rows)) / 4
    }

    grid.style.height = h + "px";
    minirender(grid, function(g) {
        g.style.opacity = 1;
    }, .6);
}

ready(function() {
    grid = document.querySelectorAll(".grid")[0];
    window.addEventListener("resize", debounce(resize, 100, false));
    resize();
    renderState(initial_state);

    window.addEventListener("keydown", function(e) {
        var ESC = 27
        var SPACE = 32
        if (modal.is_open) {
            if (e.keyCode == ESC) {
                e.preventDefault();
                modal.hide();
            } else if (e.keyCode == SPACE) {
                e.preventDefault();
                modal.reveal();
            }
        }
    }, false);

    var debouncedSaveState = debounce(function() {
        try {
            localStorage.setItem("game-19436872", JSON.stringify(getCurrentState()))
        } catch (e) {

        }
    }, 100, false)

    on("keyup change input blur focus", "#teams .name, #teams .points", debouncedSaveState);

    on("click", "#re-init", function(e) {
        e.preventDefault();
        if (confirm("This will clear the scores and team names, and start a new game. Click OK if you want to do this")) {
            clearState();
            game.init(true);
        }
    })

    on("click", "#answer-button", function(e) {
        modal.reveal();
    })

    on("click", "#continue-button", function(e) {
        modal.hide();
    })

    on("click", ".grid-row-questions .grid-cell", function(e) {
        modal.show(this);
    });

    // prevent the buttons from being highlighted
    on("mousedown", ".minus, .plus", function(e) {
        e.preventDefault();
    });

    // handle points clicks
    on("click", ".minus, .plus", function(e) {
        var $team = closest(this, ".team");
        var $points = $team.querySelectorAll(".points")[0];
        var points = parseInt($points.innerText);
        var active_question = document.querySelectorAll(".active-question .cell-inner")[0];
        var fallback = document.querySelectorAll(".grid-row-questions .cell-inner")[0];
        var val = parseInt(active_question ? active_question.innerText : fallback.innerText);
        if (this.classList.contains("minus")) {
            val = -val;
        }
        $points.innerText = points + val;
        if (active_question) {
            document.querySelectorAll(".active-question")[0].classList.add("inert");
        }
        debouncedSaveState();
    });

});
