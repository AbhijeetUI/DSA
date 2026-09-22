// Input: Given a nested JSON object that represents a UI tree, recursively render React elements based on the node type, props, and children. The solution should handle deeply nested structures and unknown node types gracefully. Example input: { type: "div", props: { className: "box" }, children: [{ type: "button", props: { onClick: handleClick, text: "Click me" } }] } should render a div containing a clickable button.
// Output: div with clickable button

import React from "react";

const handleClick = () => {
  alert("Button clicked!");
};

const UI_TREE = {
  type: "div",
  props: { className: "box" },
  children: [
    { type: "button", props: { onClick: handleClick, text: "Click me" } },
  ],
};

const DEEP_TREE = {
  type: "div",
  props: { className: "container" },
  children: [
    {
      type: "form",
      props: { onSubmit: () => alert("Submitted") },
      children: [
        {
          type: "label",
          props: { text: "Name" },
        },
        {
          type: "input",
          props: { type: "text", placeholder: "Enter name" },
        },
      ],
    },
  ],
};

function renderNode(node) {
  if (node === null || node === undefined) return null;
  if (typeof node === "string" || typeof node === "number") {
    return node;
  }

  if (typeof node !== "object") {
    return null;
  }

  const { type = "div", props = {}, children = [] } = node;
  const { onClick, text, ...restProps } = props;

  const childElements = Array.isArray(children) ? children.map(renderNode) : [];

  const finalChildren =
    text && childElements.length === 0 ? [text] : childElements;

  const elementProps = {
    ...restProps,
  };

  if (typeof onClick === "function") {
    elementProps.onClick = onClick;
  }

  return React.createElement(type, elementProps, ...finalChildren);
}

function RecursiveReactUI() {
  return (
    <>
      {renderNode(UI_TREE)}
      {renderNode(DEEP_TREE)}
    </>
  );
}

export default RecursiveReactUI;
