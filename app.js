(function () {
  "use strict";

  var songs = [];
  var current = -1;
  var mode = "order";

  var list = document.getElementById("tbody");
  var search = document.getElementById("search");
  var audio = document.getElementById("audio");
  var playBtn = document.getElementById("play");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var range = document.getElementById("range");
  var cur = document.getElementById("cur");
  var dur = document.getElementById("dur");
  var disc = document.getElementById("disc");
  var nowTitle = document.getElementById("now-title");
  var nowArtist = document.getElementById("now-artist");
  var modeBtn = document.getElementById("mode");
  var vol = document.getElementById("vol");

  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
  }

  function render(filter) {
    var q = (filter || "").toLowerCase();
    list.innerHTML = "";
    var filtered = songs.filter(function (s) {
      if (!q) return true;
      return (s.title + " " + s.artist).toLowerCase().indexOf(q) >= 0;
    });
    filtered.forEach(function (s) {
      var realIdx = songs.indexOf(s);
      var tr = document.createElement("tr");
      if (realIdx === current) tr.classList.add("active");
      tr.innerHTML = "<td class='w-num'>" + (realIdx + 1) + "</td><td>" + s.title + "</td><td>" + s.artist + "</td><td class='w-time'>" + fmt(s.duration) + "</td>";
      tr.addEventListener("click", function () { play(realIdx); });
      list.appendChild(tr);
    });
  }

  function load() {
    fetch("songs.json", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        songs = data || [];
        render();
      })
      .catch(function () {
        songs = [];
        render();
      });
  }

  function setActive() {
    var rows = list.querySelectorAll("tr");
    rows.forEach(function (tr) {
      var realIdx = parseInt(tr.querySelector(".w-num").textContent) - 1;
      tr.classList.toggle("active", realIdx === current);
    });
  }

  function play(idx) {
    if (idx < 0 || idx >= songs.length) return;
    current = idx;
    audio.src = songs[idx].src;
    audio.currentTime = 0;
    audio.play().catch(function () {});
    nowTitle.textContent = songs[idx].title;
    nowArtist.textContent = songs[idx].artist;
    disc.classList.add("spin");
    playBtn.textContent = "⏸";
    setActive();
  }

  function toggle() {
    if (audio.paused) {
      if (audio.currentSrc) {
        audio.play().catch(function () {});
      } else if (current >= 0) {
        play(current);
      } else if (songs.length > 0) {
        play(0);
      }
      disc.classList.add("spin");
      playBtn.textContent = "⏸";
    } else {
      audio.pause();
      disc.classList.remove("spin");
      playBtn.textContent = "▶";
    }
  }

  function next() {
    if (songs.length === 0) return;
    if (mode === "shuffle") {
      var n = current;
      while (n === current && songs.length > 1) n = Math.floor(Math.random() * songs.length);
      play(n);
      return;
    }
    current = (current + 1) % songs.length;
    play(current);
  }

  function prev() {
    if (songs.length === 0) return;
    current = (current - 1 + songs.length) % songs.length;
    play(current);
  }

  audio.addEventListener("timeupdate", function () {
    cur.textContent = fmt(audio.currentTime);
    if (!isNaN(audio.duration) && audio.duration > 0) {
      range.value = (audio.currentTime / audio.duration) * 100;
    } else {
      range.value = 0;
    }
  });

  audio.addEventListener("loadedmetadata", function () {
    dur.textContent = fmt(audio.duration);
    range.value = 0;
  });

  audio.addEventListener("ended", next);

  range.addEventListener("input", function () {
    if (!isNaN(audio.duration) && audio.duration > 0) {
      audio.currentTime = (range.value / 100) * audio.duration;
    }
  });

  playBtn.addEventListener("click", toggle);
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  modeBtn.addEventListener("click", function () {
    if (mode === "order") {
      mode = "shuffle";
      modeBtn.textContent = "🔀";
      modeBtn.title = "随机播放";
    } else {
      mode = "order";
      modeBtn.textContent = "⇆";
      modeBtn.title = "顺序播放";
    }
  });

  vol.addEventListener("input", function () {
    audio.volume = parseFloat(vol.value);
  });

  search.addEventListener("input", function () {
    render(search.value);
  });

  audio.volume = parseFloat(vol.value);
  load();
})();
