"use strict";

// Create an element with safe text (textContent) and optional classes.
function el(tag, text = "", className = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function badge(text, kind) {
  return el("span", text, `badge ${kind}`);
}

function actionButton(label, action, type, id, extraClass = "") {
  const button = el("button", label, `btn btn-sm ${extraClass}`.trim());
  button.type = "button";
  button.dataset.action = action;
  button.dataset.type = type;
  button.dataset.id = id;
  return button;
}

// cells: each item is a string, number, node, or an array of them.
function row(cells) {
  const tr = document.createElement("tr");
  cells.forEach((cell) => {
    const td = document.createElement("td");
    td.append(...[].concat(cell));
    tr.append(td);
  });
  return tr;
}

function fillTable(tbody, rows, colspan, emptyMessage) {
  if (rows.length === 0) {
    const tr = document.createElement("tr");
    const td = el("td", emptyMessage, "empty");
    td.colSpan = colspan;
    tr.append(td);
    rows = [tr];
  }
  tbody.replaceChildren(...rows);
}

function fillStats(container, stats) {
  container.replaceChildren(
    ...stats.map((stat) => {
      const card = el("div", "", "stat-card");
      card.append(el("h3", stat.value), el("p", stat.label));
      return card;
    })
  );
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}