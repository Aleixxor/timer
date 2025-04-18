const r = document.querySelector(':root');

function getCssVar(varName) {
  const rs = getComputedStyle(r);

  return rs.getPropertyValue(varName);
}

function setCssVar(varName, value) {
  r.style.setProperty(varName, value);
}

const cssVariables = {
  primary: getCssVar("--original-background"),
  secondary: getCssVar("--original-text"),
}

function checkInputValues(input, maxValue) {
  const parsedValue = parseInt(!!input.value ? input.value : 0);
  if (!parsedValue || (parsedValue < 0 || parsedValue > maxValue)) {
    input.value = "00";
  } else {
    input.value = String(parsedValue).padStart(2, "0");
  }
}

function addInputListeners() {
  document.getElementById("hours").addEventListener("input", function () {
    checkInputValues(this, 23);
  });
  document.getElementById("minutes").addEventListener("input", function () {
    checkInputValues(this, 59);
  });
  document.getElementById("seconds").addEventListener("input", function () {
    checkInputValues(this, 59);
  });
}

addInputListeners();

let timerInterval; // Declare timerInterval in the global scope
const initialTime = {
  hours: "00",
  minutes: "00",
  seconds: "15"
};

function startTimer() {
  const hours = parseInt(document.getElementById("hours").value);
  const minutes = parseInt(document.getElementById("minutes").value);
  const seconds = parseInt(document.getElementById("seconds").value);

  if (!timerInterval) { // Check if timerInterval is null before starting a new interval
    initialTime.hours = String(hours).padStart(2, "0");
    initialTime.minutes = String(minutes).padStart(2, "0");
    initialTime.seconds = String(seconds).padStart(2, "0");
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    let remainingTime = totalSeconds;

    document.getElementById("startButton").style.display = "none";
    document.getElementById("pauseButton").style.display = "block";

    timerInterval = setInterval(() => {
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        alert("Time's up!");
        return;
      }

      remainingTime--;

      const displayHours = String(Math.floor(remainingTime / 3600)).padStart(2, "0");
      const displayMinutes = String(Math.floor((remainingTime % 3600) / 60)).padStart(2, "0");
      const displaySeconds = String(remainingTime % 60).padStart(2, "0");

      document.getElementById("hours").value = displayHours;
      document.getElementById("minutes").value = displayMinutes;
      document.getElementById("seconds").value = displaySeconds;

      if (remainingTime <= 10) {
        setCssVar('--background', remainingTime % 2 == 1 ? cssVariables.primary : cssVariables.secondary);
        setCssVar('--text', remainingTime % 2 == 1 ? cssVariables.secondary : cssVariables.primary);
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null; // Reset timerInterval to null
  document.getElementById("startButton").style.display = "block";
  document.getElementById("pauseButton").style.display = "none";
}

function stopTimer() {
  pauseTimer(); // Pause the timer first
  document.getElementById("hours").value = initialTime.hours;
  document.getElementById("minutes").value = initialTime.minutes;
  document.getElementById("seconds").value = initialTime.seconds;
  setCssVar('--background', cssVariables.primary);
  setCssVar('--text', cssVariables.secondary);
}

function resetTimer(restart) {
  stopTimer(); // Stop the timer before resetting
  document.getElementById("hours").value = initialTime.hours;
  document.getElementById("minutes").value = initialTime.minutes;
  document.getElementById("seconds").value = initialTime.seconds;

  if (restart) startTimer(); // Restart the timer with the initial values
}

document.getElementById("startButton").addEventListener("click", startTimer);
document.getElementById("pauseButton").addEventListener("click", pauseTimer);
document.getElementById("stopButton").addEventListener("click", () => resetTimer(false));
document.getElementById("resetButton").addEventListener("click", () => resetTimer(true));