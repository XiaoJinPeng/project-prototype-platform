(function () {
  var sourceText = new WeakMap();
  var sourceAttributes = new WeakMap();
  var catalog = {};
  var attributeNames = ['placeholder', 'title', 'aria-label', 'alt'];

  function translate(value) {
    var normalized = String(value || '').replace(/\s+/g, ' ').trim();
    return catalog[normalized] || value;
  }

  function visit(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    var node = root;
    while (node) {
      if (node.nodeType === Node.TEXT_NODE && !['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(node.parentElement && node.parentElement.tagName)) {
        if (!sourceText.has(node)) sourceText.set(node, node.nodeValue || '');
        var original = sourceText.get(node);
        var replacement = translate(original);
        if (replacement !== original) {
          var leading = (original.match(/^\s*/) || [''])[0];
          var trailing = (original.match(/\s*$/) || [''])[0];
          node.nodeValue = leading + replacement + trailing;
        } else {
          node.nodeValue = original;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (!sourceAttributes.has(node)) sourceAttributes.set(node, {});
        var originals = sourceAttributes.get(node);
        attributeNames.forEach(function (name) {
          if (!node.hasAttribute(name) && originals[name] === undefined) return;
          if (originals[name] === undefined) originals[name] = node.getAttribute(name) || '';
          node.setAttribute(name, translate(originals[name]));
        });
      }
      node = walker.nextNode();
    }
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== window.location.origin || !event.data || event.data.type !== 'prototype:set-locale') return;
    catalog = event.data.catalog || {};
    document.documentElement.lang = event.data.locale || 'zh-CN';
    visit(document.body);
  });

  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(visit);
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.parent.postMessage({ type: 'prototype:mobile-ready' }, window.location.origin);
})();
