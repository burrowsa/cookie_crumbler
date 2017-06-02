function erase(domain) {
  chrome.cookies.getAll({
    domain: domain
  }, function(cookies) {
    var cookie, _i, _len;
    for (_i = 0, _len = cookies.length; _i < _len; _i++) {
      cookie = cookies[_i];
      var cookie_url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
      chrome.cookies.remove({
        url: cookie_url,
        name: cookie.name,
        storeId: cookie.storeId
      }, function() {
        console.log("[Cookie Crumbler] removed " + cookie.name + " from " + cookie_url);
      });
    }
  });
};

function clearOnStart() {
  chrome.storage.sync.get({
    domains: [],
    clear_on_start: true
  }, function(items) {
    if (items.clear_on_start) {
      for (_i = 0, _len = items.domains.length; _i < _len; _i++) {
        erase(items.domains[_i]);
      }
    }
  });
}

function getDomain(url){
  return url.split("//")[1].split("?")[0].split("/")[0];
}

var urls = [];

function rememberTabURLWhenCreated(tab) {
  if (tab.url) {
    urls[tab.id] = tab.url;
  }
}

function rememberTabURLAfterChange(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    urls[tabId] = changeInfo.url;
  }
}

function clearOnLastClosedTab(tabId, removeInfo) {  
  if (!(tabId in urls)) {
    return;
  }
  
  var domain = getDomain(urls[tabId]);  
  
  chrome.storage.sync.get({
    domains: [],
    clear_on_tab_close: true
  }, function(items) {
    if (items.clear_on_tab_close && items.domains.indexOf(domain)>-1) {
      chrome.tabs.query({
        url: "*://" + domain + "/*"
      }, function(tabs) {
        if (tabs.length < 1) {
          erase(domain);
        }
      });
    }
  });
}

function clearCookiesForTab(tab) {
  erase(getDomain(tab.url));
}

chrome.tabs.onCreated.addListener(rememberTabURLWhenCreated);
chrome.tabs.onUpdated.addListener(rememberTabURLAfterChange);
chrome.browserAction.onClicked.addListener(clearCookiesForTab);
chrome.tabs.onRemoved.addListener(clearOnLastClosedTab);
clearOnStart();
