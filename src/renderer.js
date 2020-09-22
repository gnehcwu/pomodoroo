const ProgressBar = require('progressbar.js');

const bar = new ProgressBar.Circle('.progress', {
  strokeWidth: 3,
  easing: 'linear',
  duration: 5400,
  color: '#ED6A5A',
  trailColor: '#ED6A5A33',
  trailWidth: 3,
  svgStyle: {
    "stroke-linecap": 'round'
  }
});

bar.animate(1.0);

// Events handling parts
const applyEventToElements = (eventName, elements, cls) => {
  for (const ele of elements) {
    ele.addEventListener(eventName, event => {
      event.target.classList.add(cls);

      for (const item of elements) {
        if (event.target !== item) {
          item.classList.remove(cls);
        }
      }
    })
  }
}

const controls = document.querySelectorAll('.control');
applyEventToElements('click', controls, 'hide');

const tabs = document.querySelectorAll('.tab')
applyEventToElements('click', tabs, 'selected')
