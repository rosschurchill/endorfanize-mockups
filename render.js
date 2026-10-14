// Tiny renderer for the mockup pages: fills {{holes}} and expands <sc-for> loops
// from the page's Component.renderVals(), so the Claude Design markup runs as plain HTML.
class DCLogic {
  constructor() { this.props = {}; this.state = {}; }
  setState(s) { Object.assign(this.state, s); }
}

function dcGet(ctx, path) {
  path = path.trim();
  if (path === 'true') return true;
  if (path === 'false') return false;
  return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, ctx);
}

function dcFill(str, ctx) {
  return str.replace(/\{\{\s*([^}]+?)\s*\}\}/g, function (m, p) {
    var v = dcGet(ctx, p);
    return v == null ? '' : String(v);
  });
}

function dcExpand(node, ctx) {
  Array.prototype.slice.call(node.childNodes).forEach(function (child) {
    if (child.nodeType === 3) {
      if (child.textContent.indexOf('{{') !== -1) child.textContent = dcFill(child.textContent, ctx);
      return;
    }
    if (child.nodeType !== 1) return;
    if (child.tagName === 'SC-FOR') {
      var list = dcGet(ctx, child.getAttribute('list').replace(/[{}]/g, '')) || [];
      var as = child.getAttribute('as');
      var frag = document.createDocumentFragment();
      list.forEach(function (item, i) {
        var scope = Object.assign({}, ctx);
        scope[as] = item;
        scope.$index = i;
        var wrap = document.createElement('div');
        Array.prototype.forEach.call(child.childNodes, function (t) { wrap.appendChild(t.cloneNode(true)); });
        dcExpand(wrap, scope);
        while (wrap.firstChild) frag.appendChild(wrap.firstChild);
      });
      child.replaceWith(frag);
      return;
    }
    Array.prototype.slice.call(child.attributes).forEach(function (a) {
      if (a.value.indexOf('{{') !== -1) child.setAttribute(a.name, dcFill(a.value, ctx));
    });
    dcExpand(child, ctx);
  });
}

function dcRender() {
  var tpl = document.getElementById('dc-template');
  var root = document.createElement('div');
  root.appendChild(tpl.content.cloneNode(true));
  dcExpand(root, new Component().renderVals());
  while (root.firstChild) document.body.appendChild(root.firstChild);
}

document.addEventListener('DOMContentLoaded', dcRender);
