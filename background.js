// Bulk Unlink Manager - background: opens (or focuses) the manager tab.
var managerTabId = null;

browser.runtime.onMessage.addListener(function (msg) {
  if (!msg || msg.action !== 'openManager') return undefined;
  var url = browser.runtime.getURL('manager.html');
  if (managerTabId !== null) {
    return browser.tabs.get(managerTabId).then(function (tab) {
      return browser.tabs.update(tab.id, { active: true }).then(function () { return 'focused'; });
    }).catch(function () {
      managerTabId = null;
      return browser.tabs.create({ url: url }).then(function (tab) {
        managerTabId = tab.id;
        return 'created';
      });
    });
  }
  return browser.tabs.create({ url: url }).then(function (tab) {
    managerTabId = tab.id;
    return 'created';
  });
});

browser.tabs.onRemoved.addListener(function (tabId) {
  if (tabId === managerTabId) managerTabId = null;
});
