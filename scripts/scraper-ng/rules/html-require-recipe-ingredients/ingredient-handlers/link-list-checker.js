const select = require("hast-util-select");

const utils = require("./utils.js");

/**
 * Returns true only if the given node contains a single child,
 * and the child is either an A element or a call to the jsxref macro.
 */
function containsLinkOrXRef(node) {
  if (node.children.length === 1) {
    if (node.children[0].tagName === "a") {
      return true;
    } else if (utils.isMacro(node.children[0], "jsxref")) {
      return true;
    }
  }
  return false;
}

function checkLinkList(id, tree, logger) {
  const body = select.select("body", tree);

  const heading = select.select(`h2#${id}`, body);
  // This is an optional ingredient, so if there's no `h2`,
  // assume that the page intends to omit it.
  if (heading === null) {
    return null;
  }

  const section = utils.sliceSection(heading, body);
  // The first element is always the `h2`, which we are not interested in
  const children = section.children.slice(1);

  // At the top level a link list must contain exactly one element,
  // and it must be a <dl>.
  const elements = children.filter((child) => child.type === "element");
  if (elements.length !== 1 || elements[0].tagName !== "dl") {
    logger.fail(
      body,
      "Link list must contain a single DL element and no other elements",
      "only-single-dl-element-in-link-list"
    );
    return null;
  }

  // At the top level, if a link list contains text nodes,
  // they may only contain newlines.
  const textNodes = children.filter((child) => child.type === "text");
  for (const node of textNodes) {
    const newlinesOnly = /^\n*$/;
    if (!node.value.match(newlinesOnly)) {
      logger.fail(
        node,
        "Text nodes in list of links top level may only contain newlines",
        "text-nodes-in-link-list"
      );
      return null;
    }
  }

  const dl = elements[0];

  // The link list's <dl> must contain at least one <dt>.
  const dts = select.selectAll("dt", dl);
  if (dts.length === 0) {
    logger.fail(
      body,
      "Link list dl must contain at least one dt",
      "dl-must-contain-dt"
    );
    return null;
  }

  // Each <dt> must contain only a single <a> element or a call to jsxref.
  for (const dt of dts) {
    if (!containsLinkOrXRef(dt)) {
      logger.fail(
        dt,
        "dt elements in link lists must contain a single anchor element or xref macro call",
        "only-single-anchor-element-or-xref-in-link-list-dt"
      );
      return null;
    }
  }

  // <code> elements in <dt> elements must contain only a single text node
  const dtCodeContents = select.selectAll("dt>a>code", dl);
  for (const dtCode of dtCodeContents) {
    if (dtCode.children.length !== 1 || dtCode.children[0].type !== "text") {
      logger.fail(
        dtCode,
        "code elements in dt elements in link lists must contain a single text node",
        "only-single-text-node-element-in-link-list-code"
      );
      return null;
    }
  }

  // <dt><dd> pairs must be ordered by the alphabetical order of
  // the <dt><a><code> text content
  let previousTitle = "";
  for (const dtCode of dtCodeContents) {
    if (dtCode.children[0].value.localeCompare(previousTitle, "en") <= 0) {
      logger.fail(
        dtCode,
        "Links in link lists must be listed in alphabetical order",
        "link-list-alpha-order"
      );
    }
    previousTitle = dtCode.children[0].value;
  }

  return heading;
}

module.exports = checkLinkList;
