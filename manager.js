// Bulk Unlink Manager - manager tab logic.
// Injects the unlink into each hotel tab with tabs.executeScript, so it
// works on tabs that were opened before the extension was loaded.
(function () {
  'use strict';

  // Code injected into each hotel tab. Returns:
  //   'sent:<record ID>' | 'no_checkbox' | 'no_button'
  // The button's inline onclick (return confirm('Are you sure...')) is
  // replaced at DOM level so the click submits without a dialog.
  var INJECT = '(function(){' +
    'var cb=document.querySelector(\'input[type="checkbox"][name="id_source"]\');' +
    'if(!cb) return "no_checkbox";' +
    'var ins=document.querySelectorAll(\'input[type="submit"]\');' +
    'var btn=null;' +
    'for(var i=0;i<ins.length;i++){ if(((ins[i].value||"").trim())==="New ID / Unlink"){ btn=ins[i]; break; } }' +
    'if(!btn) return "no_button";' +
    'cb.checked=true;' +
    'cb.dispatchEvent(new Event("change",{bubbles:true}));' +
    'var qid=(cb.value||"").split("|")[0];' +
    'btn.onclick=function(){return true;};' +
    'btn.click();' +
    'return "sent:"+qid;' +
    '})()';

  var countEl = document.getElementById('count');
  var goBtn = document.getElementById('go');
  var summaryEl = document.getElementById('summary');
  var logEl = document.getElementById('log');

  function refreshCount() {
    return browser.tabs.query({ url: '*://live.ql2.com/sys/hotel/*' }).then(function (tabs) {
      countEl.textContent = tabs.length + ' hotel tab(s) open.';
      return tabs;
    });
  }

  function addLog(text, cls) {
    var div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    logEl.appendChild(div);
  }

  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  goBtn.addEventListener('click', function () {
    goBtn.disabled = true;
    logEl.innerHTML = '';
    summaryEl.textContent = 'Working...';
    refreshCount().then(function (tabs) {
      var res = { sent: 0, no_checkbox: 0, no_button: 0, error: 0 };
      var chain = Promise.resolve();
      tabs.forEach(function (tab, idx) {
        chain = chain.then(function () {
          return browser.tabs.executeScript(tab.id, { code: INJECT }).then(function (out) {
            var val = out && out[0];
            if (typeof val === 'string' && val.indexOf('sent:') === 0) {
              res.sent++;
              addLog('Tab ' + (idx + 1) + ' (record ID ' + val.slice(5) + '): unlink sent', 'ok');
            } else if (val === 'no_checkbox') {
              res.no_checkbox++;
              addLog('Tab ' + (idx + 1) + ': no site-row checkbox - nothing to unlink', 'bad');
            } else if (val === 'no_button') {
              res.no_button++;
              addLog('Tab ' + (idx + 1) + ': New ID / Unlink button not found', 'bad');
            } else {
              res.error++;
              addLog('Tab ' + (idx + 1) + ': no result from page', 'bad');
            }
          }).catch(function () {
            res.error++;
            addLog('Tab ' + (idx + 1) + ': could not run in this tab (still loading or an error page)', 'bad');
          }).then(function () { return delay(150); });
        });
      });
      return chain.then(function () { return res; });
    }).then(function (res) {
      var total = res.sent + res.no_checkbox + res.no_button + res.error;
      summaryEl.textContent = 'Finished: ' + res.sent + ' of ' + total + ' tab(s) unlinked' +
        (res.no_checkbox ? ' | ' + res.no_checkbox + ' no checkbox' : '') +
        (res.no_button ? ' | ' + res.no_button + ' no button' : '') +
        (res.error ? ' | ' + res.error + ' error' : '');
      goBtn.disabled = false;
      refreshCount();
    }).catch(function (e) {
      summaryEl.textContent = 'Error: ' + e.message;
      goBtn.disabled = false;
    });
  });

  refreshCount();
})();
