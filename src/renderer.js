const settings = require('electron-settings');
const ProgressBar = require('progressbar.js');
const Timer = require('timer.js');

const initSetting = () => {
  if (!settings.getSync('workTime')) {
    settings.setSync('workTime', 0.1);
  }

  if (!settings.getSync('breakTIme')) {
    settings.setSync('breakTIme', 5);
  }
}

// Init settings
initSetting();

const getWorkTime = () => {
  return settings.getSync('workTime') || 0.1;
}

const getBreakTIme = () => {
  return settings.getSync('breakTime');
}

// Section: timer progressbar
const bar = new ProgressBar.Circle('.progress', {
  strokeWidth: 3,
  easing: 'linear',
  duration: getWorkTime() * 60 * 1000,
  color: '#ED6A5A',
  trailColor: '#ED6A5A33',
  trailWidth: 3,
  svgStyle: {
    "stroke-linecap": 'round'
  }
});

// Section: handling start/pause timer
const controls = document.querySelectorAll('.control');
const timeControl = document.querySelector('.timeControl')
timeControl.addEventListener('click', event => {
  const { id: targetId } = event.target
  if (!['start', 'stop'].includes(targetId)) return;

  event.target.classList.add('hide');

  for (const control of controls) {
    if (event.target !== control) {
      control.classList.remove('hide')
    }
  }

  if (targetId === 'start') {
    bar.animate(1.0);
    const timer = createTimer();
    timer.start(settings.getSync('workTime') * 60)
  } else if (targetId === 'stop') {
    bar.stop();
  }
});

// Section: setting time count
const leftTime = document.querySelector('.leftTime')
const settingLeftTime = (timeStr) => {
  leftTime.innerText = timeStr;
}

const createTimer = () => {
  return new Timer({
    tick: 1,
    ontick: (ms) => { console.log(1111, ms) },
    onend: function () {
      alert('timer end')
    }
  });
}

// Section: handling work/break mode switch
const tabs = document.querySelectorAll('.tab')
const controlArea = document.querySelector('.controlArea');
controlArea.addEventListener('click', event => {
  const { id: targetId } = event.target
  if (!['work', 'break'].includes(targetId)) return;

  event.target.classList.add('selected');

  for (const tab of tabs) {
    if (event.target !== tab) {
      tab.classList.remove('selected')
    }
  }
});
