// Bulk Unlink Manager - tiny opener button on hotel pages.
// All the real work happens in the manager tab, which INJECTS the unlink
// code into each tab on demand, so tabs never need a reload for this.
(function () {
  'use strict';
  function addButton() {
    if (document.getElementById('ql2-unlink-manager-open')) return;
    var btn = document.createElement('button');
    btn.id = 'ql2-unlink-manager-open';
    btn.type = 'button';
    btn.textContent = 'Open Unlink Manager';
    btn.style.cssText = 'position:fixed;top:110px;right:14px;z-index:99999;' +
      'background:#1a5276;color:#fff;font:bold 14px tahoma,verdana,sans-serif;' +
      'border:2px solid #0e2f44;border-radius:6px;padding:10px 14px;cursor:pointer;' +
      'box-shadow:0 2px 6px rgba(0,0,0,.35);';
    btn.addEventListener('click', function () {
      btn.textContent = 'Opening manager...';
      browser.runtime.sendMessage({ action: 'openManager' }).then(function () {
        btn.textContent = 'Open Unlink Manager';
      }).catch(function () {
        btn.textContent = 'Open Unlink Manager';
      });
    });
    document.body.appendChild(btn);
  }
  addButton();
  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    addButton();
    if (document.getElementById('ql2-unlink-manager-open') || tries > 10) clearInterval(iv);
  }, 500);
})();
