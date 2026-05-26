const builtinPhotos = [
  {
    name: "儿童影楼样片",
    src: "./assets/child-studio-photo.svg"
  },
  {
    name: "爱婴上门样片",
    src: "./assets/home-baby-photo.svg"
  },
  {
    name: "暖光亲子样片",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='1000' viewBox='0 0 1600 1000'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1'%3E%3Cstop stop-color='%23f7d7b8'/%3E%3Cstop offset='1' stop-color='%238fb8d8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1600' height='1000' fill='url(%23g)'/%3E%3Ccircle cx='610' cy='430' r='154' fill='%23ffe9d6'/%3E%3Ccircle cx='900' cy='438' r='116' fill='%23fff3e8'/%3E%3Crect x='360' y='590' width='820' height='250' rx='125' fill='%23ffffff' opacity='.76'/%3E%3Cpath d='M340 780 C550 660 740 770 930 690 S1240 700 1320 585' fill='none' stroke='%23ffffff' stroke-width='38' stroke-linecap='round' opacity='.58'/%3E%3Ctext x='800' y='920' text-anchor='middle' font-family='Arial' font-size='44' fill='%2335495c'%3ETuringArt Retouch Preview%3C/text%3E%3C/svg%3E"
  }
];

function createPhotoSet(prefix) {
  return builtinPhotos.map((photo, index) => ({
    id: `${prefix}-${index}`,
    name: photo.name,
    src: photo.src,
    type: "image",
    shotTime: Date.now() - (builtinPhotos.length - index) * 60000,
    randomRank: Math.random(),
    favorite: false,
    trashed: false,
    rotation: 0
  }));
}

const state = {
  projects: [
    { id: "project-1", name: "西湖春日亲子照", code: "TA-0524", photos: createPhotoSet("p1") },
    { id: "project-2", name: "周岁生日棚拍", code: "TA-0525", photos: createPhotoSet("p2") },
    { id: "project-3", name: "亲子外景加急单", code: "TA-0526", photos: createPhotoSet("p3") }
  ],
  projectIndex: 0,
  index: 0,
  filter: "all",
  sortMode: "time",
  sortDirection: "asc",
  slideTitle: "兰兰宝贝顺利平安",
  playbackIds: null,
  view: "gallery",
  previousView: "gallery",
  slidePlaying: true,
  slideTitleShown: false,
  slideTimer: null,
  chromeTimer: null,
  titleTimer: null,
  selectChromeTimer: null,
  selectSidebarOpen: true,
  selectPreviewOpen: false,
  selectedIds: new Set(),
  lastSelectedIndex: null,
  undoStack: []
};

const $ = (selector) => document.querySelector(selector);

function todayPassword() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function unlockApp() {
  document.body.classList.remove("auth-locked");
}

function setupAuthGate() {
  const form = $("#authForm");
  const input = $("#authPassword");
  const error = $("#authError");
  const password = todayPassword();
  const storageKey = `turingart-auth-${password}`;

  if (!form || !input || !error) {
    unlockApp();
    return;
  }

  if (localStorage.getItem(storageKey) === "ok") {
    unlockApp();
    return;
  }

  input.focus();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (input.value.trim() === password) {
      localStorage.setItem(storageKey, "ok");
      error.textContent = "";
      unlockApp();
      return;
    }
    error.textContent = "密码不正确，请输入当天 8 位日期";
    input.select();
  });
}

const el = {
  views: {
    gallery: $("#galleryView"),
    retouch: $("#retouchView"),
    slideshow: $("#slideshowView"),
    select: $("#selectView")
  },
  filePicker: $("#filePicker"),
  folderPicker: $("#folderPicker"),
  retouchFilePicker: $("#retouchFilePicker"),
  retouchFolderPicker: $("#retouchFolderPicker"),
  folderName: $("#folderName"),
  retouchFolderName: $("#retouchFolderName"),
  projectTitles: document.querySelectorAll(".project-title"),
  projectLists: document.querySelectorAll(".project-list"),
  createProjectButtons: document.querySelectorAll(".create-project"),
  projectSelects: document.querySelectorAll(".project-select"),
  modeTabs: document.querySelectorAll(".mode-tabs button[data-view-target]"),
  filterButtons: document.querySelectorAll("[data-filter]"),
  selectFilterButtons: document.querySelectorAll("[data-select-filter]"),
  galleryGrid: $("#galleryGrid"),
  galleryTotal: $("#galleryTotal"),
  galleryFavorites: $("#galleryFavorites"),
  retouchImage: $("#retouchImage"),
  retouchCount: $("#retouchCount"),
  retouchTitle: $("#retouchTitle"),
  thumbStrip: $("#thumbStrip"),
  slideImage: $("#slideImage"),
  slideVideo: $("#slideVideo"),
  slideCounter: $("#slideCounter"),
  slideshowView: $("#slideshowView"),
  slidePlayPause: $("#slidePlayPause"),
  slideCoverTitle: $("#slideCoverTitle"),
  slideSubtitle: $("#slideSubtitle"),
  slideTitleGroup: $("#slideTitleGroup"),
  slideTitleInput: $("#slideTitleInput"),
  selectImage: $("#selectImage"),
  selectVideo: $("#selectVideo"),
  selectCounter: $("#selectCounter"),
  selectView: $("#selectView"),
  selectGrid: $("#selectGrid"),
  selectSidebar: $("#selectSidebar"),
  selectProjectList: $("#selectProjectList"),
  selectProjectName: $("#selectProjectName"),
  selectSideCounter: $("#selectSideCounter"),
  selectSideFavorites: $("#selectSideFavorites"),
  selectSideTrash: $("#selectSideTrash"),
  favoriteToggle: $("#favoriteToggle"),
  deletePhoto: $("#deletePhoto"),
  openSlideshowFromSelect: $("#openSlideshowFromSelect"),
  musicPlayer: $("#musicPlayer"),
  musicSelect: $("#musicSelect"),
  musicFile: $("#musicFile"),
  musicFileWrap: $("#musicFileWrap"),
  transitionSelect: $("#transitionSelect"),
  speedRange: $("#speedRange"),
  sortSelects: document.querySelectorAll(".sort-select"),
  sortDirectionButtons: document.querySelectorAll(".sort-direction"),
  moveFileButtons: document.querySelectorAll(".move-file")
};

function projectPhotos() {
  return currentProject().photos;
}

function visiblePhotos() {
  const photos = projectPhotos();
  let filtered = photos.filter((photo) => {
    if (state.filter === "favorite") return photo.favorite && !photo.trashed;
    if (state.filter === "trash") return photo.trashed;
    return !photo.trashed;
  });
  filtered = [...filtered];
  if (state.sortMode === "manual") {
    // Keep the current project order.
  } else if (state.sortMode === "random") {
    filtered.sort((a, b) => a.randomRank - b.randomRank);
  } else if (state.sortMode === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN", { numeric: true }));
  } else {
    filtered.sort((a, b) => a.shotTime - b.shotTime || a.name.localeCompare(b.name, "zh-Hans-CN", { numeric: true }));
  }
  if (state.sortMode !== "random" && state.sortDirection === "desc") {
    filtered.reverse();
  }
  return filtered;
}

function currentList() {
  if (state.view === "retouch") return sortedProjectPhotos({ includeTrash: false, imagesOnly: true });
  if (state.view === "gallery") return sortedProjectPhotos({ includeTrash: false, imagesOnly: true });
  if (state.view === "slideshow" && state.playbackIds?.length) {
    const byId = new Map(projectPhotos().map((item) => [item.id, item]));
    return state.playbackIds.map((id) => byId.get(id)).filter(Boolean);
  }
  return visiblePhotos();
}

function sortedProjectPhotos({ includeTrash = false, imagesOnly = false } = {}) {
  let filtered = projectPhotos().filter((photo) => {
    if (!includeTrash && photo.trashed) return false;
    if (imagesOnly && isVideo(photo)) return false;
    return true;
  });
  filtered = [...filtered];
  if (state.sortMode === "manual") {
    return filtered;
  }
  if (state.sortMode === "random") {
    return filtered.sort((a, b) => a.randomRank - b.randomRank);
  }
  if (state.sortMode === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN", { numeric: true }));
  } else {
    filtered.sort((a, b) => a.shotTime - b.shotTime || a.name.localeCompare(b.name, "zh-Hans-CN", { numeric: true }));
  }
  if (state.sortDirection === "desc") filtered.reverse();
  return filtered;
}

function currentPhoto() {
  const photos = currentList();
  if (!photos.length) return null;
  state.index = Math.min(Math.max(state.index, 0), photos.length - 1);
  return photos[state.index];
}

function currentProject() {
  return state.projects[state.projectIndex];
}

function showView(view) {
  state.view = view;
  Object.entries(el.views).forEach(([name, node]) => {
    node.classList.toggle("is-active", name === view);
  });
  el.modeTabs.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewTarget === view);
  });
  render();
  if (view === "retouch") {
    requestAnimationFrame(refreshRetouchImage);
  }
}

function requestFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }
}

function exitFullScreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
  }
}

function openSlideshow() {
  state.previousView = state.view === "select" || state.view === "slideshow" ? state.previousView : state.view;
  state.slideTitleShown = false;
  if (state.view === "select") {
    const list = visiblePhotos();
    state.playbackIds = state.selectedIds.size ? [...state.selectedIds] : list.map((item) => item.id);
    const current = currentPhoto();
    const playbackIndex = current ? state.playbackIds.indexOf(current.id) : -1;
    state.index = Math.max(0, playbackIndex);
  } else {
    state.playbackIds = null;
  }
  showView("slideshow");
  requestFullScreen();
  state.slidePlaying = true;
  playMusic();
  startSlideTimer();
  showSlideChrome();
  requestAnimationFrame(showSlideTitle);
}

function closeSlideshow() {
  stopSlideTimer();
  stopChromeTimer();
  stopTitleTimer();
  pauseMusic();
  state.playbackIds = null;
  exitFullScreen();
  if (state.previousView === "select") {
    state.selectPreviewOpen = false;
  }
  showView(state.previousView || "gallery");
}

function openSelect() {
  state.previousView = state.view === "select" || state.view === "slideshow" ? state.previousView : state.view;
  stopSlideTimer();
  pauseMusic();
  state.selectPreviewOpen = false;
  showView("select");
  requestFullScreen();
  state.selectSidebarOpen = true;
  el.selectView.classList.remove("sidebar-collapsed");
  showSelectChrome();
}

function closeSelect() {
  stopSelectChromeTimer();
  exitFullScreen();
  showView(state.previousView || "gallery");
}

function handleFullscreenChange() {
  if (document.fullscreenElement) return;
  if (state.view === "slideshow") {
    stopSlideTimer();
    stopChromeTimer();
    stopTitleTimer();
    pauseMusic();
    state.playbackIds = null;
    if (state.previousView === "select") {
      state.selectPreviewOpen = false;
    }
    showView(state.previousView || "gallery");
    return;
  }
  if (state.view === "select") {
    stopSelectChromeTimer();
    if (state.selectPreviewOpen) {
      state.selectPreviewOpen = false;
      render();
      return;
    }
    showView(state.previousView || "gallery");
  }
}

function move(delta) {
  const photos = currentList();
  if (!photos.length) return;
  state.index = (state.index + delta + photos.length) % photos.length;
  render();
}

function gridColumnCount(container) {
  const firstItem = container?.querySelector("button");
  if (!container || !firstItem) return 1;
  const itemWidth = firstItem.getBoundingClientRect().width;
  const styles = getComputedStyle(container);
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
  return Math.max(1, Math.floor((container.clientWidth + gap) / (itemWidth + gap)));
}

function moveGrid(delta) {
  const photos = currentList();
  if (!photos.length) return;
  state.index = Math.min(Math.max(state.index + delta, 0), photos.length - 1);
  render();
}

function moveGridVertical(direction) {
  const container = state.view === "select" ? el.selectGrid : el.galleryGrid;
  moveGrid(gridColumnCount(container) * direction);
}

function startSlideTimer() {
  stopSlideTimer();
  if (!state.slidePlaying) return;
  state.slideTimer = window.setInterval(() => move(1), Number(el.speedRange.value) * 1000);
}

function stopSlideTimer() {
  window.clearInterval(state.slideTimer);
  state.slideTimer = null;
}

function stopChromeTimer() {
  window.clearTimeout(state.chromeTimer);
  state.chromeTimer = null;
}

function stopTitleTimer() {
  window.clearTimeout(state.titleTimer);
  state.titleTimer = null;
}

function stopSelectChromeTimer() {
  window.clearTimeout(state.selectChromeTimer);
  state.selectChromeTimer = null;
}

function showSlideChrome() {
  if (state.view !== "slideshow") return;
  el.slideshowView.classList.remove("chrome-hidden");
  stopChromeTimer();
  if (!state.slidePlaying) return;
  state.chromeTimer = window.setTimeout(() => {
    if (state.view === "slideshow" && state.slidePlaying) {
      el.slideshowView.classList.add("chrome-hidden");
    }
  }, 2200);
}

function formatToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}年${month}月${day}日`;
}

function showSlideTitle() {
  if (state.view !== "slideshow") return;
  if (state.slideTitleShown) return;
  state.slideTitleShown = true;
  stopTitleTimer();
  el.slideTitleGroup.classList.remove("is-hiding");
  void el.slideTitleGroup.offsetWidth;
  state.titleTimer = window.setTimeout(() => {
    if (state.view === "slideshow") {
      el.slideTitleGroup.classList.add("is-hiding");
    }
  }, 3000);
}

function showSelectChrome() {
  if (state.view !== "select") return;
  el.selectView.classList.remove("chrome-hidden");
  stopSelectChromeTimer();
  state.selectChromeTimer = window.setTimeout(() => {
    if (state.view === "select") {
      el.selectView.classList.add("chrome-hidden");
    }
  }, 2200);
}

function renderProjects() {
  const markup = state.projects
    .map(
      (project, index) => `
        <button class="project-item ${index === state.projectIndex ? "is-active" : ""}" data-project-index="${index}" type="button">
          <strong>${project.name}</strong>
          <span>${project.code} · ${project.photos.filter((photo) => !photo.trashed).length} 张照片</span>
        </button>
      `
    )
    .join("");
  el.projectLists.forEach((list) => {
    list.innerHTML = markup;
  });
  el.projectSelects.forEach((select) => {
    select.innerHTML = state.projects
      .map((project, index) => `<option value="${index}" ${index === state.projectIndex ? "selected" : ""}>${project.name}</option>`)
      .join("");
  });
}

function createProject() {
  const next = state.projects.length + 1;
  state.projects.push({
    id: `project-${Date.now()}`,
    name: `新拍照单 ${String(next).padStart(2, "0")}`,
    code: `TA-${String(524 + next).padStart(4, "0")}`,
    photos: createPhotoSet(`p${Date.now()}`)
  });
  state.projectIndex = state.projects.length - 1;
  state.filter = "all";
  state.index = 0;
  render();
}

function setProject(index) {
  state.projectIndex = Math.min(Math.max(index, 0), state.projects.length - 1);
  state.index = 0;
  state.selectedIds.clear();
  state.lastSelectedIndex = null;
  render();
}

function setFilter(filter) {
  state.filter = filter;
  state.index = 0;
  state.selectedIds.clear();
  state.lastSelectedIndex = null;
  render();
}

function setSortMode(sortMode) {
  state.sortMode = sortMode;
  state.index = 0;
  if (sortMode === "random") {
    projectPhotos().forEach((photo) => {
      photo.randomRank = Math.random();
    });
  }
  render();
}

function toggleSortDirection() {
  if (state.sortMode === "random") {
    projectPhotos().forEach((photo) => {
      photo.randomRank = Math.random();
    });
  } else {
    state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
  }
  state.index = 0;
  render();
}

function moveFilePosition(direction) {
  const item = currentPhoto();
  if (!item) return;
  const photos = projectPhotos();
  const from = photos.findIndex((photo) => photo.id === item.id);
  const to = Math.min(Math.max(from + direction, 0), photos.length - 1);
  if (from < 0 || from === to) return;
  const [moved] = photos.splice(from, 1);
  photos.splice(to, 0, moved);
  state.sortMode = "manual";
  state.index = visiblePhotos().findIndex((photo) => photo.id === item.id);
  render();
}

function moveFileBefore(draggedId, targetId) {
  if (!draggedId || !targetId || draggedId === targetId) return;
  const photos = projectPhotos();
  const from = photos.findIndex((photo) => photo.id === draggedId);
  const to = photos.findIndex((photo) => photo.id === targetId);
  if (from < 0 || to < 0) return;
  const [moved] = photos.splice(from, 1);
  photos.splice(to, 0, moved);
  state.sortMode = "manual";
  state.index = visiblePhotos().findIndex((photo) => photo.id === draggedId);
  render();
}

function dropTargetFromPoint(event) {
  const cards = [...el.selectGrid.querySelectorAll(".select-card:not(.is-dragging)")];
  return cards.find((card) => {
    const rect = card.getBoundingClientRect();
    const isInsideY = event.clientY >= rect.top && event.clientY <= rect.bottom;
    const beforeCenter = event.clientX < rect.left + rect.width / 2;
    return isInsideY && beforeCenter;
  }) || cards.find((card) => {
    const rect = card.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2;
  });
}

function moveFileToEnd(draggedId) {
  if (!draggedId) return;
  const photos = projectPhotos();
  const from = photos.findIndex((photo) => photo.id === draggedId);
  if (from < 0 || from === photos.length - 1) return;
  const [moved] = photos.splice(from, 1);
  photos.push(moved);
  state.sortMode = "manual";
  state.index = visiblePhotos().findIndex((photo) => photo.id === draggedId);
  render();
}

function toggleSelectPreview() {
  if (state.view !== "select") return;
  state.selectPreviewOpen = !state.selectPreviewOpen;
  render();
}

function selectItem(index, event = {}) {
  const photos = visiblePhotos();
  if (!photos[index]) return;
  state.index = index;
  const isToggle = event.ctrlKey || event.metaKey;
  if (event.shiftKey && state.lastSelectedIndex !== null) {
    const start = Math.min(state.lastSelectedIndex, index);
    const end = Math.max(state.lastSelectedIndex, index);
    for (let i = start; i <= end; i += 1) {
      state.selectedIds.add(photos[i].id);
    }
  } else if (event.shiftKey) {
    state.selectedIds.add(photos[index].id);
  } else if (isToggle) {
    if (state.selectedIds.has(photos[index].id)) {
      state.selectedIds.delete(photos[index].id);
    } else {
      state.selectedIds.add(photos[index].id);
    }
  } else {
    state.selectedIds.clear();
  }
  state.lastSelectedIndex = index;
  render();
}

function ensureActiveVisible() {
  if (state.view === "gallery") {
    el.galleryGrid.querySelector(".is-active")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  if (state.view === "select" && !state.selectPreviewOpen) {
    el.selectGrid.querySelector(".is-active")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
}

function isVideo(item) {
  return item.type === "video";
}

function setMedia(img, video, item, options = {}) {
  const rotation = `${item.rotation || 0}deg`;
  if (isVideo(item)) {
    img.removeAttribute("src");
    img.hidden = true;
    video.hidden = false;
    if (video.src !== item.src) video.src = item.src;
    video.style.setProperty("--rotation", rotation);
    video.muted = options.muted ?? true;
    if (options.play) video.play().catch(() => {});
  } else {
    video.pause();
    video.currentTime = 0;
    video.removeAttribute("src");
    video.hidden = true;
    img.hidden = false;
    img.src = item.src;
    img.alt = item.name;
    img.style.setProperty("--rotation", rotation);
  }
}

function mediaThumb(item) {
  const rotation = `--rotation: ${item.rotation || 0}deg`;
  const favoriteBadge = item.favorite ? `<span class="favorite-badge">♥</span>` : "";
  if (isVideo(item)) {
    return `<video src="${item.src}" muted playsinline preload="metadata" draggable="false" style="${rotation}"></video><span class="media-badge">视频</span>${favoriteBadge}`;
  }
  return `<img src="${item.src}" alt="" draggable="false" style="${rotation}" />${favoriteBadge}`;
}

function toggleSelectSidebar() {
  if (state.view !== "select") return;
  state.selectSidebarOpen = !state.selectSidebarOpen;
  el.selectView.classList.toggle("sidebar-collapsed", !state.selectSidebarOpen);
}

function setSlidePlaying(playing) {
  state.slidePlaying = playing;
  el.slidePlayPause.textContent = playing ? "暂停" : "播放";
  showSlideChrome();
  if (playing) {
    playMusic();
    startSlideTimer();
  } else {
    stopSlideTimer();
    stopChromeTimer();
    el.slideshowView.classList.remove("chrome-hidden");
    pauseMusic();
  }
}

function playMusic() {
  if (el.musicSelect.value === "none") return;
  el.musicPlayer.volume = 0.38;
  el.musicPlayer.play().catch(() => {});
}

function pauseMusic() {
  el.musicPlayer.pause();
}

function refreshRetouchImage() {
  const photo = currentPhoto();
  if (!photo) return;
  el.retouchImage.removeAttribute("src");
  requestAnimationFrame(() => {
    el.retouchImage.hidden = false;
    el.retouchImage.src = photo.src;
    el.retouchImage.alt = photo.name;
    el.retouchImage.style.setProperty("--rotation", `${photo.rotation || 0}deg`);
  });
}

function render() {
  const photo = currentPhoto();
  const photos = currentList();
  const visibleList = visiblePhotos();
  const project = currentProject();
  const allPhotos = projectPhotos();
  const countText = photos.length ? `${state.index + 1} / ${photos.length}` : "0 / 0";
  renderProjects();
  el.filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === state.filter);
  });
  el.selectFilterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.selectFilter === state.filter);
  });
  el.sortSelects.forEach((select) => {
    select.value = state.sortMode;
  });
  el.sortDirectionButtons.forEach((button) => {
    button.textContent = state.sortMode === "random" ? "再打乱" : state.sortDirection === "asc" ? "正序" : "倒序";
    button.disabled = state.sortMode === "manual";
  });
  el.projectTitles.forEach((title) => {
    title.textContent = project.name;
  });
  el.slideCoverTitle.textContent = state.slideTitle;
  el.slideSubtitle.textContent = formatToday();
  el.slideTitleInput.value = state.slideTitle;

  if (!photo) {
    el.galleryTotal.textContent = "0";
    el.galleryFavorites.textContent = String(allPhotos.filter((item) => item.favorite && !item.trashed).length);
    el.galleryGrid.innerHTML = "";
    el.retouchTitle.textContent = state.filter === "trash" ? "回收站为空" : "当前筛选下没有照片";
    el.retouchCount.textContent = "0 / 0";
    el.retouchImage.removeAttribute("src");
    el.thumbStrip.innerHTML = "";
    el.slideImage.removeAttribute("src");
    el.slideVideo.removeAttribute("src");
  el.selectImage.removeAttribute("src");
  el.selectVideo.removeAttribute("src");
    el.selectGrid.innerHTML = "";
    el.selectProjectName.textContent = project.name;
    el.selectSideCounter.textContent = "0 / 0";
    el.selectSideFavorites.textContent = String(allPhotos.filter((item) => item.favorite && !item.trashed).length);
    el.selectSideTrash.textContent = String(allPhotos.filter((item) => item.trashed).length);
    el.favoriteToggle.textContent = "♡";
    el.deletePhoto.textContent = state.filter === "trash" ? "↩" : "⌫";
    return;
  }

  el.galleryTotal.textContent = String(photos.length);
  el.galleryFavorites.textContent = String(allPhotos.filter((item) => item.favorite && !item.trashed).length);

  el.retouchImage.hidden = false;
  el.retouchImage.src = photo.src;
  el.retouchImage.alt = photo.name;
  el.retouchImage.style.setProperty("--rotation", `${photo.rotation || 0}deg`);
  el.retouchCount.textContent = countText;
  el.retouchTitle.textContent = photo.name;

  el.slideCounter.textContent = countText;
  el.slideshowView.dataset.transition = el.transitionSelect.value;
  setMedia(el.slideImage, el.slideVideo, photo, { play: state.view === "slideshow" });
  const slideMedia = isVideo(photo) ? el.slideVideo : el.slideImage;
  slideMedia.classList.remove("is-entering");
  void slideMedia.offsetWidth;
  slideMedia.classList.add("is-entering");

  if (state.selectPreviewOpen) {
    setMedia(el.selectImage, el.selectVideo, photo);
  } else {
    el.selectImage.hidden = true;
    el.selectVideo.hidden = true;
    el.selectVideo.pause();
  }
  el.selectCounter.textContent = countText;
  el.selectView.classList.toggle("preview-open", state.selectPreviewOpen);
  el.selectProjectName.textContent = project.name;
  el.selectSideCounter.textContent = countText;
  el.selectSideFavorites.textContent = String(allPhotos.filter((item) => item.favorite && !item.trashed).length);
  el.selectSideTrash.textContent = String(allPhotos.filter((item) => item.trashed).length);
  el.favoriteToggle.textContent = photo.favorite ? "♥" : "♡";
  el.deletePhoto.textContent = state.filter === "trash" ? "↩" : "⌫";
  el.deletePhoto.setAttribute("aria-label", state.filter === "trash" ? "恢复" : "删除");
  el.selectView.classList.toggle("is-favorite", photo.favorite);

  el.thumbStrip.innerHTML = photos
    .map(
      (item, index) => `
        <button class="thumb ${index === state.index ? "is-active" : ""}" data-index="${index}" aria-label="${item.name}">
          ${mediaThumb(item)}
        </button>
      `
    )
    .join("");

  el.galleryGrid.innerHTML = photos
    .map(
      (item, index) => `
        <button class="gallery-card ${index === state.index ? "is-active" : ""} ${state.selectedIds.has(item.id) ? "is-selected" : ""}" data-index="${index}" aria-label="${item.name}">
          ${mediaThumb(item)}
          <span>${item.favorite ? "♥ " : ""}${item.name}</span>
        </button>
      `
    )
    .join("");

  el.selectGrid.innerHTML = photos
    .map(
      (item, index) => `
        <button class="select-card ${index === state.index ? "is-active" : ""} ${state.selectedIds.has(item.id) ? "is-selected" : ""}" data-index="${index}" data-id="${item.id}" draggable="true" aria-label="${item.name}">
          <span class="drag-handle" aria-hidden="true">⋮⋮</span>
          ${mediaThumb(item)}
        </button>
      `
    )
    .join("");
  requestAnimationFrame(ensureActiveVisible);
}

function replaceFolder(files) {
  const mediaFiles = [...files].filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));
  if (!mediaFiles.length) return;

  projectPhotos().forEach((photo) => {
    if (photo.src.startsWith("blob:")) URL.revokeObjectURL(photo.src);
  });

  currentProject().photos = mediaFiles.map((file, index) => ({
    id: `${file.name}-${file.lastModified}-${index}`,
    name: file.name,
    src: URL.createObjectURL(file),
    type: file.type.startsWith("video/") ? "video" : "image",
    shotTime: file.lastModified || Date.now(),
    randomRank: Math.random(),
    favorite: false,
    trashed: false,
    rotation: 0
  }));
  state.index = 0;
  state.filter = "all";
  const folderLabel = mediaFiles[0].webkitRelativePath?.split("/")[0] || `${mediaFiles.length} 个本地文件`;
  el.folderName.textContent = folderLabel;
  el.retouchFolderName.textContent = folderLabel;
  render();
}

function toggleFavorite() {
  const photo = currentPhoto();
  if (!photo) return;
  photo.favorite = !photo.favorite;
  state.undoStack.push({ type: "favorite", id: photo.id, value: !photo.favorite });
  render();
}

function trashPhoto() {
  const photo = currentPhoto();
  if (!photo) return;
  if (state.filter === "trash") {
    photo.trashed = false;
    state.undoStack.push({ type: "restore", id: photo.id, index: state.index });
    const photos = visiblePhotos();
    state.index = Math.min(state.index, Math.max(photos.length - 1, 0));
    render();
    return;
  }
  photo.trashed = true;
  state.undoStack.push({ type: "trash", id: photo.id, index: state.index });
  const photos = visiblePhotos();
  state.index = Math.min(state.index, Math.max(photos.length - 1, 0));
  render();
}

function rotatePhoto(direction) {
  const photo = currentPhoto();
  if (!photo) return;
  const previous = photo.rotation;
  photo.rotation = (photo.rotation + direction * 90 + 360) % 360;
  state.undoStack.push({ type: "rotate", id: photo.id, value: previous });
  render();
}

function undo() {
  const action = state.undoStack.pop();
  if (!action) return;
  const photo = projectPhotos().find((item) => item.id === action.id);
  if (!photo) return;

  if (action.type === "favorite") photo.favorite = action.value;
  if (action.type === "rotate") photo.rotation = action.value;
  if (action.type === "trash") {
    photo.trashed = false;
    state.index = action.index;
  }
  if (action.type === "restore") {
    photo.trashed = true;
    state.index = action.index;
  }
  render();
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();
  const isUndo = (event.metaKey || event.ctrlKey) && key === "z";

  if (isUndo) {
    event.preventDefault();
    undo();
    return;
  }

  const isListGrid = state.view === "gallery" || (state.view === "select" && !state.selectPreviewOpen);

  if (isListGrid && event.key === "ArrowLeft") {
    event.preventDefault();
    moveGrid(-1);
  } else if (isListGrid && event.key === "ArrowRight") {
    event.preventDefault();
    moveGrid(1);
  } else if (isListGrid && event.key === "ArrowUp") {
    event.preventDefault();
    moveGridVertical(-1);
  } else if (isListGrid && event.key === "ArrowDown") {
    event.preventDefault();
    moveGridVertical(1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    move(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    move(1);
  }

  if (state.view === "slideshow") {
    if (event.key === "Escape") closeSlideshow();
    if (event.key === "Enter") openSelect();
    if (event.key === " ") {
      event.preventDefault();
      setSlidePlaying(!state.slidePlaying);
    }
  }

  if (state.view === "select") {
    if (key === "s") {
      event.preventDefault();
      toggleSelectSidebar();
      return;
    }
    if (event.key === " ") {
      event.preventDefault();
      if (state.selectPreviewOpen) {
        state.selectPreviewOpen = false;
        render();
      } else {
        state.selectPreviewOpen = true;
        render();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      if (state.selectPreviewOpen) {
        state.selectPreviewOpen = false;
        render();
        return;
      }
      closeSelect();
    }
    if (key === "d" || event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      trashPhoto();
    }
    if (key === "l") rotatePhoto(-1);
    if (key === "r") rotatePhoto(1);
    if (key === "f") toggleFavorite();
  }

  if ((state.view === "gallery" || state.view === "retouch") && key === "l") rotatePhoto(-1);
  if ((state.view === "gallery" || state.view === "retouch") && key === "r") rotatePhoto(1);

}

function bindEvents() {
  el.openSlideshowFromSelect.addEventListener("click", openSlideshow);
  $("#openSelectFromGallery").addEventListener("click", openSelect);
  $("#openSelectFromRetouch").addEventListener("click", openSelect);
  $("#exitSlideshow").addEventListener("click", closeSlideshow);
  $("#enterSelect").addEventListener("click", openSelect);
  $("#backToRetouch").addEventListener("click", closeSelect);
  el.modeTabs.forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.viewTarget));
  });

  el.createProjectButtons.forEach((button) => {
    button.addEventListener("click", createProject);
  });

  el.projectLists.forEach((list) => {
    list.addEventListener("click", (event) => {
      const button = event.target.closest(".project-item");
      if (!button) return;
      setProject(Number(button.dataset.projectIndex));
    });
  });

  el.projectSelects.forEach((select) => {
    select.addEventListener("change", () => setProject(Number(select.value)));
  });

  el.filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  el.selectFilterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.selectFilter));
  });

  el.sortSelects.forEach((select) => {
    select.addEventListener("change", () => setSortMode(select.value));
  });

  el.sortDirectionButtons.forEach((button) => {
    button.addEventListener("click", toggleSortDirection);
  });

  el.moveFileButtons.forEach((button) => {
    button.addEventListener("click", () => moveFilePosition(Number(button.dataset.move)));
  });

  $("#retouchPrev").addEventListener("click", () => move(-1));
  $("#retouchNext").addEventListener("click", () => move(1));
  $("#slidePrev").addEventListener("click", () => {
    move(-1);
    showSlideChrome();
  });
  $("#slideNext").addEventListener("click", () => {
    move(1);
    showSlideChrome();
  });
  $("#selectPrev").addEventListener("click", () => {
    move(-1);
    showSelectChrome();
  });
  $("#selectNext").addEventListener("click", () => {
    move(1);
    showSelectChrome();
  });

  el.slidePlayPause.addEventListener("click", () => setSlidePlaying(!state.slidePlaying));
  el.favoriteToggle.addEventListener("click", toggleFavorite);
  el.deletePhoto.addEventListener("click", trashPhoto);
  el.filePicker.addEventListener("change", (event) => {
    replaceFolder(event.target.files);
    event.target.value = "";
  });
  el.folderPicker.addEventListener("change", (event) => {
    replaceFolder(event.target.files);
    event.target.value = "";
  });
  el.retouchFilePicker.addEventListener("change", (event) => {
    replaceFolder(event.target.files);
    event.target.value = "";
  });
  el.retouchFolderPicker.addEventListener("change", (event) => {
    replaceFolder(event.target.files);
    event.target.value = "";
  });

  el.thumbStrip.addEventListener("click", (event) => {
    const button = event.target.closest(".thumb");
    if (!button) return;
    state.index = Number(button.dataset.index);
    render();
  });

  el.galleryGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".gallery-card");
    if (!button) return;
    selectItem(Number(button.dataset.index), event);
  });

  el.selectGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".select-card");
    if (!button) return;
    selectItem(Number(button.dataset.index), event);
  });

  el.selectGrid.addEventListener("dragstart", (event) => {
    const button = event.target.closest(".select-card");
    if (!button) return;
    button.classList.add("is-dragging");
    event.dataTransfer.setData("text/plain", button.dataset.id);
    event.dataTransfer.effectAllowed = "move";
  });

  el.selectGrid.addEventListener("dragend", () => {
    el.selectGrid.querySelectorAll(".is-dragging, .is-drop-target").forEach((node) => {
      node.classList.remove("is-dragging", "is-drop-target");
    });
  });

  el.selectGrid.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    el.selectGrid.querySelectorAll(".is-drop-target").forEach((node) => node.classList.remove("is-drop-target"));
    const target = event.target.closest(".select-card") || dropTargetFromPoint(event);
    target?.classList.add("is-drop-target");
  });

  el.selectGrid.addEventListener("drop", (event) => {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData("text/plain");
    const button = event.target.closest(".select-card") || dropTargetFromPoint(event);
    if (button) {
      moveFileBefore(draggedId, button.dataset.id);
    } else {
      moveFileToEnd(draggedId);
    }
  });

  el.musicSelect.addEventListener("change", () => {
    const selectedMusic = el.musicSelect.value;
    el.musicFileWrap.classList.toggle("is-visible", selectedMusic === "custom");
    pauseMusic();
    if (selectedMusic !== "none" && selectedMusic !== "custom") el.musicPlayer.src = selectedMusic;
    if (state.view === "slideshow" && state.slidePlaying) playMusic();
  });

  el.musicFile.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (!file) return;
    if (el.musicPlayer.src.startsWith("blob:")) URL.revokeObjectURL(el.musicPlayer.src);
    el.musicPlayer.src = URL.createObjectURL(file);
    if (state.view === "slideshow" && state.slidePlaying) playMusic();
  });

  el.transitionSelect.addEventListener("change", render);
  el.slideTitleInput.addEventListener("input", () => {
    state.slideTitle = el.slideTitleInput.value.trim() || " ";
    el.slideCoverTitle.textContent = state.slideTitle;
  });
  el.speedRange.addEventListener("input", startSlideTimer);
  el.slideshowView.addEventListener("mousemove", showSlideChrome);
  el.slideshowView.addEventListener("pointermove", showSlideChrome);
  el.selectView.addEventListener("mousemove", showSelectChrome);
  el.selectView.addEventListener("pointermove", showSelectChrome);
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("keydown", handleKeydown);
}

setupAuthGate();
bindEvents();
render();
