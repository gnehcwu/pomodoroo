const { shell, ipcRenderer } = require('electron');
const settings = require('electron-settings');
const ProgressBar = require('progressbar.js');
const Timer = require('timer.js');
const path = require('path');

const store = {
  type: 'work',
  prev: '',
  settingUpdated: false,
  gone: 0
};

const initSetting = () => {
  if (!settings.getSync('work')) {
    settings.setSync('work', 25);
  }

  if (!settings.getSync('break')) {
    settings.setSync('break', 5);
  }
};

// Init settings
initSetting();

const getCurrentTime = () => {
  const currentType = ['work', 'break'].find(t => t === store.type);
  return settings.getSync(currentType);
};

const formatTime = (minutes) => {
  const dateObj = new Date(minutes * 60 * 1000);
  const mins = dateObj.getUTCMinutes();
  const secs = dateObj.getSeconds();
  const padding = (time) => time.toString().padStart(2, '0');

  return `${padding(mins)}:${padding(secs)}`;
};

const leftTimeCtl = document.querySelector('.leftTime');
const setLeftTime = (minutes) => {
  leftTimeCtl.innerText = formatTime(minutes);
};

// Set left time when rendering for the first time
setLeftTime(getCurrentTime());

// Play audio when start/pause/end timer
const playAudio = (name) => {
  const auddio = new Audio(path.join(__dirname, '..', 'assets', `${name}.mp3`));
  auddio.play();
};

// Switch start/pause controls
const switchStartPauseCtl = () => {
  document.querySelector('#start').classList.remove('hide');
  document.querySelector('#stop').classList.add('hide');
};

const startWork = () => {
  document.querySelector('#work').click();
  document.querySelector('#start').click();
}

const startRest = () => {
  document.querySelector('#break').click();
  document.querySelector('#start').click();
}

const notification = async ({ title, body, actionText, onaction }) => {
  let res;
  try {
    res = await ipcRenderer.invoke('notification', {
      title,
      body,
      actions: [{ text: actionText, type: 'button' }],
    })
  } catch (err) {
    return;
  }
  res.event === 'action' && onaction();
}

const fireNotification = () => {
  if (process.platform === 'darwin') {
    const data = {
      work: {
        title: '☕',
        body: 'Time to take a break!',
        actionText: 'Rest',
        onaction: startRest
      },
      break: {
        title: '🖥️',
        body: 'Time to work!',
        actionText: 'Start',
        onaction: startWork
      }
    };
    notification(data[store.type]);
  }
}

// Section: timer progressbar
const bar = new ProgressBar.Circle('.progress', {
  strokeWidth: 4,
  easing: 'linear',
  trailColor: '#ED6A5A33',
  trailWidth: 4,
  svgStyle: {
    "stroke-linecap": 'round'
  },
  from: { color: '#F99689' },
  to: { color: '#ED6A5A' },
  step: (state, circle) => {
    circle.path.setAttribute('stroke', state.color);

    const curValue = circle.value();
    setLeftTime((1 - curValue) * getCurrentTime());
    store.gone = curValue;
  }
});

const timer = new Timer({
  tick: 1,
  onend: () => {
    store.gone = 0;
    playAudio('ring');
    switchStartPauseCtl();
    fireNotification();
    document.querySelector(`#${['work', 'break'].find(item => item !== store.type)}`).click();
  }
})

// Section: handling start/pause timer
const controls = document.querySelectorAll('.control');
const timeControl = document.querySelector('.timeControl');

const setCtlState = (target) => {
  for (const control of controls) {
    control.classList.remove('hide');
  }

  target.classList.add('hide');
}

timeControl.addEventListener('click', event => {
  const { id: targetId } = event.target;
  if (!['start', 'stop'].includes(targetId)) return;

  setCtlState(event.target);

  if (targetId === 'start') {
    playAudio('tick');
    const left = (1 - store.gone) * getCurrentTime() * 60;
    bar.animate(1.0, {
      duration: left * 1000,
    });
    timer.start(left);
  } else if (targetId === 'stop') {
    playAudio('tick');
    bar.stop();
    timer.pause();
  }
});

// Section: handling work/break mode switch
const tabs = document.querySelectorAll('.tab');
const controlArea = document.querySelector('.controlArea');
const viewport = document.querySelector('.viewport');

const setTabState = (target) => {
  for (const tab of tabs) {
    tab.classList.remove('selected');
  }

  target.classList.add('selected');
}

controlArea.addEventListener('click', event => {
  const { id: targetId } = event.target;
  if (!['work', 'break', 'settings'].includes(targetId)) return;

  setTabState(event.target);

  if (targetId === 'settings') {
    viewport.style.transform = `translate(-${viewport.clientWidth / 2}px)`;
    store.prev = 'setting';
  } else {
    viewport.style.transform = `translate(0)`;

    if (targetId !== store.type || store.settingUpdated) {
      store.type = targetId;
      bar.set(0);
      switchStartPauseCtl();
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
};

// Init values for setting page
initSettings();

const settingContent = document.querySelector('.settingContent');
settingContent.addEventListener('change', event => {
  store.settingUpdated = true;
  const { type, dataset: { id } } = event.target;
  if (type !== 'number') return;

  settings.setSync(`${id}`, event.target.value);
});


// Section: link to github repo
document.querySelector('.githubLink svg').addEventListener('click', async (event) => {
  event.preventDefault();
  await shell.openExternal('https://github.com/gnehcwu/pomodoroo');
});
