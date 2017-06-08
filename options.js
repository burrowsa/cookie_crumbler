function addDomain() {
  var new_domain = document.getElementById("new_domain").value;
  if (new_domain) {
    chrome.storage.sync.get({
      domains: []
    }, function(items) {
      var domains = items.domains;
      domains.push(new_domain);
      chrome.storage.sync.set({
          domains: domains
      }, function(items) {
        document.getElementById("new_domain").value = "";
        restoreOptions();
      })
    });
  }
}

function restoreOptions() {
  var domainsCtrl = document.getElementById("domains");

  while (domainsCtrl.firstChild) {
    domainsCtrl.removeChild(domainsCtrl.firstChild);
  }

  chrome.storage.sync.get({
    domains: [],
    clear_on_start: true,
    clear_on_tab_close: true
  }, function(items) {
    document.getElementById("clear_on_start").checked = items.clear_on_start;
    document.getElementById("clear_on_tab_close").checked = items.clear_on_tab_close;
    
    for (_i = 0, _len = items.domains.length; _i < _len; _i++) {
      var option = document.createElement("option");
      option.text = items.domains[_i];
      domainsCtrl.add(option);
    }
  });
}

function removeDomain() {
  var _i, _len;

  var domainsCtrl = document.getElementById("domains");
  if (!domainsCtrl.children) {
    return;
  }

  var to_remove = [];
  for (_i = 0, _len = domainsCtrl.children.length; _i < _len; _i++) {
    if (domainsCtrl.children[_i].selected) {
      to_remove.unshift(_i);
    }
  }
  
  chrome.storage.sync.get({
    domains: []
  }, function(items) {
    var domains = items.domains;
    
    for (_i = 0, _len = to_remove.length; _i < _len; _i++) {
      domains.splice(to_remove[_i], 1);
    }
    
    chrome.storage.sync.set({
        domains: domains
    }, function(items) {
      restoreOptions();
    })
  });
}

function setClearOnStart() {
  chrome.storage.sync.set({
    clear_on_start: document.getElementById("clear_on_start").checked
  }, function(items) {
    restoreOptions();
  });
}

function setClearOnTabClose() {
  chrome.storage.sync.set({
    clear_on_tab_close: document.getElementById("clear_on_tab_close").checked
  }, function(items) {
    restoreOptions();
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('add_domain').addEventListener('click', addDomain);
document.getElementById('remove_domain').addEventListener('click', removeDomain);
document.getElementById('clear_on_start').addEventListener('click', setClearOnStart);
document.getElementById('clear_on_tab_close').addEventListener('click', setClearOnTabClose);

document.getElementById('new_domain').addEventListener("keypress", function(event) {
  if (event.keyCode == 13) {
    document.getElementById('add_domain').click();
    event.preventDefault();
  }
});
