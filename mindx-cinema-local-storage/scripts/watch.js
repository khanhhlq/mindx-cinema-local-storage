import { TMDB_API_KEY } from "./config.js";

function calculateElapsedTime(timeCreated) {
  var created = new Date(timeCreated).getTime();
  var periods = {
    year: 365 * 30 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
  };
  var diff = Date.now() - created;

  for (var key in periods) {
    if (periods.hasOwnProperty(key) && diff >= periods[key]) {
      var result = Math.floor(diff / periods[key]);
      return result + " " + (result === 1 ? key : key + "s") + " ago";
    }
  }

  return "Just now";
}

var searchQuery = new URLSearchParams(location.search);
var movieId = searchQuery.get("id");

if (!movieId) location.href = "./index.html";

var labels = ["data", "similar"];

(function() {
  Promise.all([
    fetch('https://api.themoviedb.org/3/movie/' + movieId + '?api_key=' + TMDB_API_KEY)
      .then(function(response) { return response.json(); }),
    fetch('https://api.themoviedb.org/3/movie/' + movieId + '/similar?api_key=' + TMDB_API_KEY)
      .then(function(response) { return response.json(); })
  ])
  .then(function(responses) {
    var result = responses.reduce(function(final, current, index) {
      if (labels[index] === "data") {
        final[labels[index]] = current;
      } else if (labels[index] === "similar") {
        final[labels[index]] = current.results;
      }
      return final;
    }, {});

    console.log(result);

    document.querySelector("iframe").src = 'https://www.2embed.cc/embed/' + result.data.id;
    document.querySelector("#movie-title").innerText = result.data.title || result.data.name;
    document.querySelector("#movie-description").innerText = result.data.overview;

    if (result.data.release_date) {
      document.querySelector("#release-date").innerText = 'Release Date: ' + result.data.release_date;
    }

    if (result.similar && result.similar.length > 0) {
      var similarHTML = '<h1 class="text-xl">Similar Movies</h1>';
      similarHTML += result.similar.map(function(item) {
        return '<a href="./info.html?id=' + item.id + '">' +
          '<div>' +
            '<img onload="this.style.opacity = \'1\'" alt="" src="https://image.tmdb.org/t/p/w200' + item.poster_path + '" />' +
            '<div>' +
              '<p>' + item.title + '</p>' +
            '</div>' +
          '</div>' +
        '</a>';
      }).join('');
      document.querySelector("#similar").innerHTML += similarHTML;
    }

    var user = JSON.parse(localStorage.getItem("currentUser"));

    // Comment box HTML
    var commentBoxHTML = '<form ' + (!user ? 'style="cursor: pointer" onclick="signIn()"' : '') + ' class="comment-form" autocomplete="off">';
    commentBoxHTML += '<img src="' + 
      (user 
        ? 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(user.username)
        : './assets/default-avatar.png') + 
      '" />';
    commentBoxHTML += '<div ' + (!user ? 'onclick="location.href = \'./login.html\'"' : '') + '>';
    commentBoxHTML += '<input required type="text" placeholder="' + 
      (user ? 'Comment as ' + user.username : 'Sign in to comment') + 
      '" id="comment" name="comment"' + 
      (user ? '' : ' style="pointer-events: none"') + ' />';
    commentBoxHTML += '<button type="submit"' + (user ? '' : ' style="display: none"') + '><i class="fa-solid fa-paper-plane"></i></button>';
    commentBoxHTML += '</div></form>';

    document.querySelector("#comment-box-container").innerHTML = commentBoxHTML;

    var form = document.querySelector("form");
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      var title = e.target.comment.value.trim();
      e.target.comment.value = "";

      var existingComments = JSON.parse(localStorage.getItem('comments-' + movieId) || "[]");

      existingComments.push({
        title: title,
        user: {
          username: user.username,
        },
        createdAt: Date.now(),
      });

      localStorage.setItem('comments-' + movieId, JSON.stringify(existingComments));
      renderComments();
    });

    window.renderComments = function() {
      var out = "";
      var comments = JSON.parse(localStorage.getItem('comments-' + movieId) || "[]");

      comments.forEach(function(comment) {
        out += '<div class="comment-item">' +
          '<img src="' + 
            (comment.user.photoURL || 
            'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(comment.user.username)) + 
          '" />' +
          '<div>' +
            '<div>' +
              '<strong>' + comment.user.username + '</strong>' +
              '<p>' + comment.title + '</p>' +
            '</div>' +
            '<p>' + calculateElapsedTime(comment.createdAt) + '</p>' +
          '</div>' +
        '</div>';
      });
      document.querySelector("#comments").innerHTML = out;
    };

    document.querySelector(".backdrop").classList.add("backdrop-hidden");
    renderComments();
    document.title = 'Watch ' + (result.data.title || result.data.name) + ' - MindX Cinema';
  });
})();
