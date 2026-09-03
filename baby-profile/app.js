const studioBrand = {
  name: "Kids Smile",
  slogan: "记录每一次长大",
  logo: "./assets/kids-smile-logo.svg",
  primaryColor: "#6a4f3d",
  primaryDeepColor: "#53341d",
  primarySoftColor: "#f1e9e2"
};

function conversationalTime(hour) {
  const displayHour = hour % 12 || 12;
  let period = "上午";
  if (hour === 0) period = "半夜";
  else if (hour < 5) period = "凌晨";
  else if (hour < 7) period = "清晨";
  else if (hour < 9) period = "早上";
  else if (hour < 12) period = "上午";
  else if (hour === 12) period = "中午";
  else if (hour < 18) period = "下午";
  else if (hour < 22) period = "晚上";
  else period = "深夜";
  return `${period}${displayHour}点过`;
}

const TIME_OPTIONS = [
  ...Array.from({ length: 24 }, (_, hour) => ({
    value: `${String(hour).padStart(2, "0")}:00`,
    label: conversationalTime(hour)
  })),
  { value: null, label: "不太确定", uncertain: true }
];

const PLANNING_LABELS = {
  planned: "已经想好几个想记录的阶段了",
  thinking: "有一些想法，还没具体想好",
  "not-yet": "还没特别想过"
};

const STORAGE_KEY = "kids-smile-baby-profile-v4";

const emptyProfile = () => ({
  babyName: "",
  babyGender: "",
  birthDate: "",
  birthTimeHour: null,
  photographerNotes: "",
  messageToBaby: "",
  futurePhotoFeelings: [],
  customFeeling: "",
  growthPlanning: "",
  studioBrand,
  step: 1,
  completed: false
});

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return emptyProfile();
    return {
      ...emptyProfile(),
      ...saved,
      studioBrand,
      futurePhotoFeelings: Array.isArray(saved.futurePhotoFeelings)
        ? saved.futurePhotoFeelings
        : []
    };
  } catch {
    return emptyProfile();
  }
}

let profile = loadProfile();
let pickerIndex = 8;
let pendingPickerIndex = pickerIndex;
let pickerTimer = null;
let toastTimer = null;
let stickyTitleFrame = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  header: $("#appHeader"),
  stepCount: $("#stepCount"),
  headerContext: $("#headerContext"),
  progressTrack: $("#progressTrack"),
  progressValue: $("#progressValue"),
  backButton: $("#backButton"),
  panels: $$(".step-panel"),
  bottomBar: $("#bottomBar"),
  primaryButton: $("#primaryButton"),
  babyName: $("#babyName"),
  birthDate: $("#birthDate"),
  photographerNotes: $("#photographerNotes"),
  messageToBaby: $("#messageToBaby"),
  customFeeling: $("#customFeeling"),
  customFeelingWrap: $("#customFeelingWrap"),
  nameQuestionTitle: $("#nameQuestionTitle"),
  genderQuestionTitle: $("#genderQuestionTitle"),
  birthDateQuestionTitle: $("#birthDateQuestionTitle"),
  birthTimeQuestionTitle: $("#birthTimeQuestionTitle"),
  messageQuestionTitle: $("#messageQuestionTitle"),
  feelingsQuestionTitle: $("#feelingsQuestionTitle"),
  growthQuestionTitle: $("#growthQuestionTitle"),
  stepTitles: {
    1: $("#stepOneTitle"),
    2: $("#stepTwoTitle")
  },
  daysNote: $("#daysNote"),
  timeTrigger: $("#timeTrigger"),
  timeValue: $("#timeValue"),
  timeSheet: $("#timeSheet"),
  timePicker: $("#timePicker"),
  toast: $("#toast"),
  resetDemo: $("#resetDemo")
};

function setBrand() {
  const root = document.documentElement;
  root.style.setProperty("--brand", studioBrand.primaryColor);
  root.style.setProperty("--brand-deep", studioBrand.primaryDeepColor);
  root.style.setProperty("--brand-soft", studioBrand.primarySoftColor);
  $("#brandLogo").src = studioBrand.logo;
  $("#brandLogo").alt = studioBrand.name;
  $("#completionLogo").src = studioBrand.logo;
  $("#completionLogo").alt = studioBrand.name;
  $("#brandSlogan").textContent = studioBrand.slogan;
  document.title = `${studioBrand.name} · 先认识一下宝宝`;
}

function saveProfile() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // The prototype still works when storage is unavailable.
  }
}

function formatTimeHour(value) {
  if (!value) return "";
  if (value === "uncertain") return "不太确定";
  return TIME_OPTIONS.find((option) => option.value === value)?.label || value;
}

function daysSinceBirth(value) {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const birth = new Date(parts[0], parts[1] - 1, parts[2], 12);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const difference = Math.floor((today - birth) / 86400000);
  return difference < 0 ? null : difference + 1;
}

function ageLine() {
  const days = daysSinceBirth(profile.birthDate);
  return days ? `来到你们身边已经 ${days} 天` : "";
}

function updateDaysNote() {
  const days = daysSinceBirth(profile.birthDate);
  if (!days) {
    elements.daysNote.textContent = "";
    elements.daysNote.classList.remove("is-visible");
    return;
  }
  const name = profile.babyName.trim() || "宝宝";
  elements.daysNote.textContent = `原来${name}来到你们身边已经 ${days} 天啦`;
  elements.daysNote.classList.add("is-visible");
}

function updateStepOneQuestions() {
  const name = profile.babyName.trim();
  const displayName = name || "宝宝";
  elements.nameQuestionTitle.textContent = `拍摄时，我们应该怎么称呼${displayName}？`;
  elements.genderQuestionTitle.textContent = name ? `${name}宝宝是？` : "宝宝是？";
  elements.birthDateQuestionTitle.textContent = `${displayName}是哪天出生的？`;
  elements.birthTimeQuestionTitle.textContent = `${displayName}大概是什么时间出生的？`;
}

function updateStepTwoQuestions() {
  const name = profile.babyName.trim() || "宝宝";
  const pronoun = profile.babyGender === "boy"
    ? "他"
    : profile.babyGender === "girl"
      ? "她"
      : "TA";
  elements.messageQuestionTitle.textContent = `如果现在想对${name}说一句话，你会说什么？`;
  elements.feelingsQuestionTitle.textContent = `以后${name}再看到这些照片，你最希望${pronoun}感受到什么？`;
  elements.growthQuestionTitle.textContent = `${name}一天天长大，你有想过接下来想怎么记录${pronoun}吗？`;
}

function updateCollapsedHeader() {
  const title = elements.stepTitles[profile.step];
  if (!title || elements.header.hidden) {
    elements.headerContext.textContent = "";
    elements.headerContext.classList.remove("is-visible");
    elements.header.classList.remove("has-context");
    elements.headerContext.setAttribute("aria-hidden", "true");
    return;
  }

  const shouldShow = title.getBoundingClientRect().bottom <= elements.header.getBoundingClientRect().bottom + 1;
  elements.headerContext.textContent = shouldShow ? title.textContent : "";
  elements.headerContext.classList.toggle("is-visible", shouldShow);
  elements.header.classList.toggle("has-context", shouldShow);
  elements.headerContext.setAttribute("aria-hidden", String(!shouldShow));
}

function scheduleCollapsedHeaderUpdate() {
  if (stickyTitleFrame) return;
  stickyTitleFrame = requestAnimationFrame(() => {
    stickyTitleFrame = null;
    updateCollapsedHeader();
  });
}

function syncProfileFromInputs() {
  profile.babyName = elements.babyName.value.trim();
  profile.birthDate = elements.birthDate.value;
  profile.photographerNotes = elements.photographerNotes.value.trim();
  profile.messageToBaby = elements.messageToBaby.value.trim();
  profile.customFeeling = elements.customFeeling.value.trim();
  saveProfile();
}

function fillInputs() {
  elements.babyName.value = profile.babyName;
  elements.birthDate.value = profile.birthDate;
  elements.photographerNotes.value = profile.photographerNotes;
  elements.messageToBaby.value = profile.messageToBaby;
  elements.customFeeling.value = profile.customFeeling;
  elements.timeValue.textContent = profile.birthTimeHour
    ? formatTimeHour(profile.birthTimeHour)
    : "选一个大概时间就好";
  elements.timeTrigger.classList.toggle("has-value", Boolean(profile.birthTimeHour));
  updateDaysNote();
  updateStepOneQuestions();
  updateStepTwoQuestions();
  renderGenderChoices();
  renderFeelingChoices();
  renderPlanningChoices();
}

function clearError(questionId, errorId) {
  const question = $(questionId);
  const error = $(errorId);
  if (question) question.classList.remove("has-error");
  if (error) error.textContent = "";
}

function setError(questionId, errorId, message) {
  const question = $(questionId);
  const error = $(errorId);
  if (question) question.classList.add("has-error");
  if (error) error.textContent = message;
}

function validateStepOne() {
  syncProfileFromInputs();
  const errors = [];
  clearError("#nameQuestion", "#babyNameError");
  clearError("#genderQuestion", "#babyGenderError");
  clearError("#dateQuestion", "#birthDateError");
  clearError("#timeQuestion", "#birthTimeError");

  if (!profile.babyName) {
    setError("#nameQuestion", "#babyNameError", "还不知道怎么称呼宝宝呢");
    errors.push($("#nameQuestion"));
  }

  if (!profile.babyGender) {
    setError("#genderQuestion", "#babyGenderError", "选一下是小王子还是小公主吧");
    errors.push($("#genderQuestion"));
  }

  if (!profile.birthDate || !daysSinceBirth(profile.birthDate)) {
    setError("#dateQuestion", "#birthDateError", "告诉我们宝宝是哪天出生的");
    errors.push($("#dateQuestion"));
  }

  if (!profile.birthTimeHour) {
    setError("#timeQuestion", "#birthTimeError", "选一个大概时间就好，记不清可以选“不太确定”");
    errors.push($("#timeQuestion"));
  }

  if (errors.length) {
    errors[0].scrollIntoView({ behavior: "smooth", block: "center" });
    const firstControl = errors[0].querySelector("input, button");
    window.setTimeout(() => firstControl?.focus({ preventScroll: true }), 320);
    return false;
  }
  return true;
}

function validateStepTwo() {
  syncProfileFromInputs();
  clearError("#growthQuestion", "#growthPlanningError");
  if (!profile.growthPlanning) {
    setError("#growthQuestion", "#growthPlanningError", "选一个最接近现在想法的就好");
    $("#growthQuestion").scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }
  return true;
}

function renderFeelingChoices() {
  const selected = profile.futurePhotoFeelings;
  $$('[data-feeling]').forEach((button) => {
    const isSelected = selected.includes(button.dataset.feeling);
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
  elements.customFeelingWrap.hidden = !selected.includes("其他感受");
}

function renderGenderChoices() {
  $$('[data-gender]').forEach((button) => {
    const isSelected = profile.babyGender === button.dataset.gender;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-checked", String(isSelected));
  });
}

function renderPlanningChoices() {
  $$('[data-planning]').forEach((button) => {
    const isSelected = profile.growthPlanning === button.dataset.planning;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-checked", String(isSelected));
  });
}

function toggleFeeling(feeling) {
  const selected = profile.futurePhotoFeelings;
  if (selected.includes(feeling)) {
    profile.futurePhotoFeelings = selected.filter((item) => item !== feeling);
  } else {
    profile.futurePhotoFeelings = [...selected, feeling];
  }
  renderFeelingChoices();
  saveProfile();
  if (feeling === "其他感受" && profile.futurePhotoFeelings.includes("其他感受")) {
    window.setTimeout(() => elements.customFeeling.focus(), 120);
  }
}

function summaryFeelingText() {
  const feelings = profile.futurePhotoFeelings.map((item) => {
    if (item === "其他感受") return profile.customFeeling || "其他温暖的感受";
    return item;
  });
  return feelings.length ? feelings.join("、") : "把这次小小的模样好好留下来";
}

function renderSummary() {
  const name = profile.babyName || "宝宝";
  $("#completionTitle").textContent = `我们已经更了解${name}一点啦`;
  $("#summaryName").textContent = name;
  $("#summaryAge").textContent = ageLine();
  $("#summaryFeelings").textContent = summaryFeelingText();
  $("#summaryPlanning").textContent = PLANNING_LABELS[profile.growthPlanning] || "顺其自然地记录";
}

function showStep(step, direction = "forward") {
  const normalizedStep = Math.max(1, Math.min(3, Number(step) || 1));
  profile.step = normalizedStep;
  saveProfile();

  elements.panels.forEach((panel) => {
    const isCurrent = Number(panel.dataset.step) === normalizedStep;
    panel.hidden = !isCurrent;
    panel.classList.remove("is-active", "from-back");
    if (isCurrent) {
      requestAnimationFrame(() => {
        panel.classList.toggle("from-back", direction === "back");
        panel.classList.add("is-active");
      });
    }
  });

  const isCompletion = normalizedStep === 3;
  elements.header.hidden = isCompletion;
  elements.stepCount.textContent = `${Math.min(normalizedStep, 2)} / 2`;
  elements.headerContext.textContent = "";
  elements.headerContext.classList.remove("is-visible");
  elements.header.classList.remove("has-context");
  elements.headerContext.setAttribute("aria-hidden", "true");
  elements.progressValue.style.width = normalizedStep === 1 ? "50%" : "100%";
  elements.backButton.classList.toggle("is-visible", normalizedStep === 2);
  elements.primaryButton.textContent = normalizedStep === 1
    ? "继续"
    : normalizedStep === 2
      ? "完成填写"
      : profile.completed
        ? "已完成"
        : "完成";
  elements.primaryButton.disabled = isCompletion && profile.completed;
  elements.bottomBar.hidden = false;

  if (isCompletion) renderSummary();
  window.scrollTo({ top: 0, behavior: "auto" });
  requestAnimationFrame(updateCollapsedHeader);
}

function handlePrimaryAction() {
  if (profile.step === 1) {
    if (!validateStepOne()) return;
    showStep(2);
    return;
  }

  if (profile.step === 2) {
    if (!validateStepTwo()) return;
    showStep(3);
    return;
  }

  profile.completed = true;
  saveProfile();
  elements.primaryButton.textContent = "已完成";
  elements.primaryButton.disabled = true;
  showToast("已为拍摄组保存好啦");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2200);
}

function buildPicker() {
  elements.timePicker.innerHTML = TIME_OPTIONS.map((option, index) => {
    const label = option.label;
    return `<button class="picker-option" type="button" role="option" aria-selected="false" data-index="${index}">${label}</button>`;
  }).join("");

  $$(".picker-option").forEach((option) => {
    option.addEventListener("click", () => {
      pendingPickerIndex = Number(option.dataset.index);
      scrollPickerTo(pendingPickerIndex, true);
    });
  });
}

function selectedHourIndex() {
  if (!profile.birthTimeHour) return 8;
  if (profile.birthTimeHour === "uncertain") return TIME_OPTIONS.length - 1;
  const index = TIME_OPTIONS.findIndex((option) => option.value === profile.birthTimeHour);
  return index >= 0 ? index : 8;
}

function renderPickerSelection() {
  $$(".picker-option").forEach((option, index) => {
    const selected = index === pendingPickerIndex;
    option.classList.toggle("is-selected", selected);
    option.setAttribute("aria-selected", String(selected));
  });
}

function scrollPickerTo(index, smooth = false) {
  pendingPickerIndex = Math.max(0, Math.min(TIME_OPTIONS.length - 1, index));
  renderPickerSelection();
  elements.timePicker.scrollTo({ top: pendingPickerIndex * 50, behavior: smooth ? "smooth" : "auto" });
}

function openTimeSheet() {
  clearError("#timeQuestion", "#birthTimeError");
  pickerIndex = selectedHourIndex();
  pendingPickerIndex = pickerIndex;
  elements.timeSheet.classList.add("is-open");
  elements.timeSheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("sheet-open");
  requestAnimationFrame(() => {
    scrollPickerTo(pendingPickerIndex);
    elements.timePicker.focus({ preventScroll: true });
  });
}

function closeTimeSheet(confirm = false) {
  if (confirm) {
    pickerIndex = pendingPickerIndex;
    const selectedOption = TIME_OPTIONS[pickerIndex];
    profile.birthTimeHour = selectedOption.uncertain ? "uncertain" : selectedOption.value;
    elements.timeValue.textContent = formatTimeHour(profile.birthTimeHour);
    elements.timeTrigger.classList.add("has-value");
    saveProfile();
  }
  elements.timeSheet.classList.remove("is-open");
  elements.timeSheet.setAttribute("aria-hidden", "true");
  document.body.classList.remove("sheet-open");
  window.setTimeout(() => elements.timeTrigger.focus({ preventScroll: true }), 180);
}

function handlePickerScroll() {
  window.clearTimeout(pickerTimer);
  const index = Math.round(elements.timePicker.scrollTop / 50);
  pendingPickerIndex = Math.max(0, Math.min(TIME_OPTIONS.length - 1, index));
  renderPickerSelection();
  pickerTimer = window.setTimeout(() => scrollPickerTo(pendingPickerIndex, true), 100);
}

function autosizeTextarea(textarea) {
  textarea.style.height = "auto";
  const minHeight = textarea.id === "messageToBaby" ? 84 : 101;
  textarea.style.height = `${Math.max(minHeight, textarea.scrollHeight)}px`;
}

function keepFocusedFieldVisible(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
  window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "center" }), 320);
}

function setupVisualViewport() {
  if (!window.visualViewport) return;
  const update = () => {
    const viewport = window.visualViewport;
    const keyboardHeight = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
    document.documentElement.style.setProperty("--keyboard-offset", `${keyboardHeight}px`);
  };
  window.visualViewport.addEventListener("resize", update);
  window.visualViewport.addEventListener("scroll", update);
  update();
}

function resetPrototype() {
  profile = emptyProfile();
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* no-op */ }
  fillInputs();
  elements.primaryButton.disabled = false;
  clearError("#nameQuestion", "#babyNameError");
  clearError("#genderQuestion", "#babyGenderError");
  clearError("#dateQuestion", "#birthDateError");
  clearError("#timeQuestion", "#birthTimeError");
  clearError("#growthQuestion", "#growthPlanningError");
  showStep(1, "back");
}

function bindEvents() {
  elements.primaryButton.addEventListener("click", handlePrimaryAction);
  elements.backButton.addEventListener("click", () => {
    syncProfileFromInputs();
    showStep(1, "back");
  });

  elements.babyName.addEventListener("input", () => {
    profile.babyName = elements.babyName.value.trim();
    clearError("#nameQuestion", "#babyNameError");
    updateDaysNote();
    updateStepOneQuestions();
    updateStepTwoQuestions();
    saveProfile();
  });

  elements.birthDate.addEventListener("change", () => {
    profile.birthDate = elements.birthDate.value;
    clearError("#dateQuestion", "#birthDateError");
    updateDaysNote();
    saveProfile();
  });

  $$('[data-gender]').forEach((button) => {
    button.addEventListener("click", () => {
      profile.babyGender = button.dataset.gender;
      clearError("#genderQuestion", "#babyGenderError");
      renderGenderChoices();
      updateStepTwoQuestions();
      saveProfile();
    });
  });

  [elements.photographerNotes, elements.messageToBaby, elements.customFeeling].forEach((input) => {
    input.addEventListener("input", () => {
      if (input instanceof HTMLTextAreaElement) autosizeTextarea(input);
      syncProfileFromInputs();
    });
  });

  elements.babyName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      elements.birthDate.focus();
      if (typeof elements.birthDate.showPicker === "function") elements.birthDate.showPicker();
    }
  });

  document.addEventListener("focusin", keepFocusedFieldVisible);
  window.addEventListener("scroll", scheduleCollapsedHeaderUpdate, { passive: true });

  elements.timeTrigger.addEventListener("click", openTimeSheet);
  $("#sheetBackdrop").addEventListener("click", () => closeTimeSheet(false));
  $("#cancelTime").addEventListener("click", () => closeTimeSheet(false));
  $("#confirmTime").addEventListener("click", () => closeTimeSheet(true));
  elements.timePicker.addEventListener("scroll", handlePickerScroll, { passive: true });
  elements.timePicker.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      scrollPickerTo(pendingPickerIndex + (event.key === "ArrowDown" ? 1 : -1), true);
    }
    if (event.key === "Enter") closeTimeSheet(true);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.timeSheet.classList.contains("is-open")) closeTimeSheet(false);
  });

  $$('[data-message]').forEach((button) => {
    button.addEventListener("click", () => {
      elements.messageToBaby.value = button.dataset.message;
      profile.messageToBaby = button.dataset.message;
      autosizeTextarea(elements.messageToBaby);
      saveProfile();
    });
  });

  $("#skipMessage").addEventListener("click", () => {
    elements.messageToBaby.value = "";
    profile.messageToBaby = "";
    saveProfile();
    showToast("没关系，这一项已经留空");
  });

  $$('[data-feeling]').forEach((button) => {
    button.addEventListener("click", () => toggleFeeling(button.dataset.feeling));
  });

  $$('[data-planning]').forEach((button) => {
    button.addEventListener("click", () => {
      profile.growthPlanning = button.dataset.planning;
      clearError("#growthQuestion", "#growthPlanningError");
      renderPlanningChoices();
      saveProfile();
    });
  });

  elements.resetDemo.addEventListener("click", resetPrototype);
}

function init() {
  setBrand();
  buildPicker();
  const today = new Date();
  elements.birthDate.max = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
  fillInputs();
  [elements.photographerNotes, elements.messageToBaby].forEach(autosizeTextarea);
  bindEvents();
  setupVisualViewport();
  showStep(profile.step || 1);
}

init();
