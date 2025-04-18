const r = document.documentElement;

function getCssVar(varName) {
  return getComputedStyle(r).getPropertyValue(varName);
}

function setCssVar(varName, value) {
  r.style.setProperty(varName, value);
}

const cssVariables = {
  primary: getCssVar("--original-background"),
  secondary: getCssVar("--original-text")
};

function checkInputValues(input, maxValue) {
  const value = parseInt(input.value) || 0;
  input.value = (value < 0 || value > maxValue) ? "00" : String(value).padStart(2, "0");
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

let timerInterval;
const initialTime = {
  hours: "00",
  minutes: "00",
  seconds: "15"
};

function playFeedback() {
  // Feedback háptico
  if (navigator.vibrate) {
    navigator.vibrate(200);
  }
}

function playAlarm() {
  // Reproduz som de alarme e vibração prolongada
  const alarm = document.getElementById("alarmSound");
  sendNotification();
  if (alarm) {
    alarm.play();
  }
  if (navigator.vibrate) {
    navigator.vibrate([300, 100, 300, 100, 300]);
  }
}

function startTimer() {
  const hours = parseInt(document.getElementById("hours").value);
  const minutes = parseInt(document.getElementById("minutes").value);
  const seconds = parseInt(document.getElementById("seconds").value);

  if (!timerInterval) {
    initialTime.hours = String(hours).padStart(2, "0");
    initialTime.minutes = String(minutes).padStart(2, "0");
    initialTime.seconds = String(seconds).padStart(2, "0");
    let remainingTime = hours * 3600 + minutes * 60 + seconds;

    document.getElementById("startButton").style.display = "none";
    document.getElementById("pauseButton").style.display = "block";
    playFeedback();

    timerInterval = setInterval(() => {
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        playAlarm();
        resetTimer(false);
        return;
      }

      remainingTime--;

      const displayHours = String(Math.floor(remainingTime / 3600)).padStart(2, "0");
      const displayMinutes = String(Math.floor((remainingTime % 3600) / 60)).padStart(2, "0");
      const displaySeconds = String(remainingTime % 60).padStart(2, "0");

      document.getElementById("hours").value = displayHours;
      document.getElementById("minutes").value = displayMinutes;
      document.getElementById("seconds").value = displaySeconds;

      // Feedback háptico e alteração de cores nos últimos 10 segundos
      if (remainingTime <= 10) {
        setCssVar('--background', remainingTime % 2 === 1 ? cssVariables.primary : cssVariables.secondary);
        setCssVar('--text', remainingTime % 2 === 1 ? cssVariables.secondary : cssVariables.primary);
        playFeedback();
      } else {
        setCssVar('--background', cssVariables.primary);
        setCssVar('--text', cssVariables.secondary);
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  document.getElementById("startButton").style.display = "block";
  document.getElementById("pauseButton").style.display = "none";
  playFeedback();
}

function stopTimer() {
  pauseTimer();
  document.getElementById("hours").value = initialTime.hours;
  document.getElementById("minutes").value = initialTime.minutes;
  document.getElementById("seconds").value = initialTime.seconds;
  setCssVar('--background', cssVariables.primary);
  setCssVar('--text', cssVariables.secondary);
}

function resetTimer(restart) {
  stopTimer();
  document.getElementById("hours").value = initialTime.hours;
  document.getElementById("minutes").value = initialTime.minutes;
  document.getElementById("seconds").value = initialTime.seconds;

  if (restart) startTimer();
}

document.getElementById("startButton").addEventListener("click", startTimer);
document.getElementById("pauseButton").addEventListener("click", pauseTimer);
document.getElementById("stopButton").addEventListener("click", () => resetTimer(false));
document.getElementById("resetButton").addEventListener("click", () => resetTimer(true));

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso no escopo:', registration.scope);
      })
      .catch(error => {
        console.error('Falha no registro do Service Worker:', error);
      });
  });
}
// Verifica se o navegador suporta notificações
if ('Notification' in window) {
  // Solicita permissão para enviar notificações
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log('Permissão para notificações concedida.');
    } else if (permission === 'denied') {
      console.log('Permissão para notificações negada.');
    } else {
      console.log('Permissão para notificações ignorada.');
    }
  });
}
// Função para enviar uma notificação
function sendNotification() {
  if (Notification.permission === 'granted') {
    const notification = new Notification('Alarme!', {
      body: 'Seu tempo acabou!',
      icon: 'icon.svg' // Substitua pelo caminho do seu ícone
    });
  } else {
    console.log('Permissão para notificações não concedida.');
  }
}
// Chama a função de notificação quando o tempo acabar
