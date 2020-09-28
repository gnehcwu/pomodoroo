const settings = require('electron-settings');
const ProgressBar = require('progressbar.js');
const path = require('path');

const store = {
  type: 'work',
  prev: '',
  settingUpdated: false
}

const initSetting = () => {
  if (!settings.getSync('work')) {
    settings.setSync('work', 0.1);
  }

  if (!settings.getSync('break')) {
    settings.setSync('break', 5);
  }
}

// Init settings
initSetting();

const getCurrentTime = () => {
  const currentType = `${['work', 'break'].find(item => item === store.type)}`;
  return settings.getSync(currentType);
}

const formatTime = (minutes) => {
  const dateObj = new Date(minutes * 60 * 1000);
  const mins = dateObj.getUTCMinutes();
  const secs = dateObj.getSeconds();

  return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
}

const leftTime = document.querySelector('.leftTime')
const setLeftTime = (minutes) => {
  leftTime.innerText = formatTime(minutes);
}

setLeftTime(getCurrentTime());

const playAudio = (name) => {
  const auddio = new Audio(path.join(__dirname, '..', 'assets', `${name}.mp3`));
  auddio.play();
}

// Section: timer progressbar
const bar = new ProgressBar.Circle('.progress', {
  strokeWidth: 3,
  easing: 'linear',
  trailColor: '#ED6A5A33',
  trailWidth: 3,
  svgStyle: {
    "stroke-linecap": 'round'
  },
  from: { color: '#F3ADA4' },
  to: { color: '#ED6A5A' },
  step: function (state, circle, attachment) {
    circle.path.setAttribute('stroke', state.color);
    const curValue = circle.value();
    setLeftTime((1 - curValue) * getCurrentTime());

    if (curValue === 1) {
      playAudio('end');
      document.querySelector('#start').classList.remove('hide');
      document.querySelector('#stop').classList.add('hide');
      document.querySelector(`#${['work', 'break'].find(item => item !== store.type)}`).click();
    }
  }
});

// Section: handling start/pause timer
const controls = document.querySelectorAll('.control');
const timeControl = document.querySelector('.timeControl');

timeControl.addEventListener('click', event => {
  const { id: targetId } = event.target
  if (!['start', 'stop'].includes(targetId)) return;

  event.target.classList.add('hide');

  for (const control of controls) {
    if (event.target !== control) {
      control.classList.remove('hide');
    }
  }

  if (targetId === 'start') {
    playAudio('start');
    bar.animate(1.0, {
      duration: getCurrentTime() * 60 * 1000,
    });
  } else if (targetId === 'stop') {
    playAudio('start');
    bar.stop();
  }
});

// Section: handling work/break mode switch
const tabs = document.querySelectorAll('.tab')
const controlArea = document.querySelector('.controlArea');
const viewport = document.querySelector('.viewport');

controlArea.addEventListener('click', event => {
  const { id: targetId } = event.target
  if (!['work', 'break', 'settings'].includes(targetId)) return;

  for (const tab of tabs) {
    tab.classList.remove('selected');
  }

  event.target.classList.add('selected');

  if (targetId === 'settings') {
    viewport.style.transform = `translate(-${viewport.clientWidth / 2}px)`;
    store.prev = 'setting';
  } else {
    viewport.style.transform = `translate(0px)`;

    if (targetId !== store.type || store.settingUpdated) {
      store.type = targetId;
      bar.set(0);
      document.querySelector('#start').classList.remove('hide');
      document.querySelector('#stop').classList.add('hide');
      setLeftTime(getCurrentTime());
    }

    store.prev = targetId;
    store.settingUpdated = false;
  }
});

// Section: settings
const setttingInputs = document.querySelectorAll('.settingItem input');
const initSettings = () => {
  const settingMap = new Map([
    ['work', (input => input.value = settings.getSync('work'))],
    ['break', (input => input.value = settings.getSync('break'))]
  ]);

  for (const input of setttingInputs) {
    settingMap.get(input.dataset.id)(input);
  }
}

initSettings();

const settingContent = document.querySelector('.settingContent');
settingContent.addEventListener('change', event => {
  store.settingUpdated = true;
  const { type, dataset: { id } } = event.target;
  if (type !== 'number') return;
  settings.setSync(`${id}`, event.target.value);
});
