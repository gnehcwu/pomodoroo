const settings = require('electron-settings');
const ProgressBar = require('progressbar.js');

const store = {
  type: 'work'
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

const leftTime = document.querySelector('.leftTime')
const settingLeftTime = (timeStr) => {
  leftTime.innerText = timeStr;
}

settingLeftTime(getCurrentTime());

// Section: timer progressbar
const bar = new ProgressBar.Circle('.progress', {
  strokeWidth: 3,
  easing: 'linear',
  trailColor: '#eee',
  trailWidth: 3,
  svgStyle: {
    "stroke-linecap": 'round'
  },
  from: { color: '#F3ADA4' },
  to: { color: '#ED6A5A' },
  step: function (state, circle, attachment) {
    circle.path.setAttribute('stroke', state.color);
    const curValue = circle.value();
    settingLeftTime(((1 - curValue) * getCurrentTime() * 60).toFixed());

    if (curValue === 1) {
      document.querySelector('#start').classList.remove('hide');
      document.querySelector('#stop').classList.add('hide');
      document.querySelector(`#${['work', 'break'].find(item => item !== store.type)}`).click();
    }
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
      control.classList.remove('hide');
    }
  }

  if (targetId === 'start') {
    bar.animate(1.0, {
      duration: getCurrentTime() * 60 * 1000,
    });
  } else if (targetId === 'stop') {
    bar.stop();
  }
});

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

  if (targetId === 'work') {
    store.type = 'work';
  } else {
    store.type = 'break';
  }
  bar.set(0);
});
