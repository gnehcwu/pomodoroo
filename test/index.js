const Application = require('spectron').Application;
const electron = require('electron');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const path = require('path');
const setup = require('./setup');
const { expect } = require('chai');

chai.should();
chai.use(chaiAsPromised);

const timeout = process.env.CI ? 30000 : 10000;

describe('Basic integration test', function () {
  this.timeout(timeout);

  let app;

  const startApp = () => {
    app = new Application({
      path: electron,
      args: [
        path.join(__dirname, '..')
      ],
      waitTimeout: timeout
    });

    return app.start().then((ret) => {
      setup.setupApp(ret);
    });
  };

  before(() => {
    setup.removeStoredPreferences();
    return startApp();
  });

  after(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('should open a window displaying all of the contents', async function () {
    await app.client.waitUntilWindowLoaded();
    let progress = await app.client.$('.progress svg');
    expect(progress).to.not.be.null;

    let timeCtr = await app.client.$$('.timeControl img');
    expect(timeCtr.length).to.equal(2)

    let settingContent = await app.client.$('.settingContent');
    expect(settingContent).to.not.be.null;

    let githubLink = await app.client.$('.githubLink');
    expect(githubLink).to.not.be.null;

    let tabs = await app.client.$$('.controlArea svg');
    expect(tabs.length).to.equal(3);
  });

  it('should start app at work tab', async () => {
    await app.client.waitUntilWindowLoaded();
    let selectedTab = await app.client.$('.tab.selected');
    const workTab = await selectedTab.getProperty('id');
    expect(workTab).to.equal('work');
  })

  it('should switch to other tabs when clicking tab', async () => {
    let tab = await app.client.$('div#break');
    await tab.click();
    let selectedTab = await app.client.$('.tab.selected');
    let selected = await selectedTab.getProperty('id');
    expect(selected).to.equal('break');

    tab = await app.client.$('div#settings');
    await tab.click();
    selectedTab = await app.client.$('.tab.selected');
    selected = await selectedTab.getProperty('id');
    expect(selected).to.equal('settings');
  });
});
