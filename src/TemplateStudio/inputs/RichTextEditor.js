import { Editor } from 'slate-react';
import PropTypes from 'prop-types';
import React from 'react';

import schema from './schema';

import MarkdownToSlateConverter from './MarkdownToSlateConverter';
import SlateToMarkdownConverter from './SlateToMarkdownConverter';
import HoverMenu from './HoverMenu';

const defaultValue =
`# Heading

This is text.

This is __italic__ text.

This is **bold** text.

## Heading 2

This is more text.

This is \`inline code\`.

\`\`\`
This is a code block
On multiple lines.
\`\`\`

- this is a list item
- this a second item

This is text.

1. This is a numbered list item
1. Another numbered item

---

That was a page break.`;

/**
 * The auto-markdown example.
 *
 * @type {Component}
 */

class RichTextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.handleTextChange = props.handleTextChange.bind(this);
    this.editor = null;
    this.markdownToSlateConverter = new MarkdownToSlateConverter();
    this.slateToMarkdownConverter = new SlateToMarkdownConverter();
    this.menu = null;
    this.state = {};
    this.state.value = null;
    this.state.rect = null;

    // try {
    //  this.initialValue = this.markdownToSlateConverter.convert(this.props.text);
    // } catch (err) {
    this.initialValue = this.markdownToSlateConverter.convert(defaultValue);
    // }
  }

  /**
   * On update, update the menu.
   */

  componentDidMount = () => {
    this.updateMenu();
  }

  componentDidUpdate = () => {
    this.updateMenu();
  }

  /**
   * On space, if it was after an auto-markdown shortcut, convert the current
   * node into the shortcut's corresponding type.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */

  onSpace = (event, editor, next) => {
    const { value } = editor;
    const { selection } = value;
    if (selection.isExpanded) return next();

    const { startBlock } = value;
    const { start } = selection;
    const chars = startBlock.text.slice(0, start.offset).replace(/\s*/g, '');
    const type = this.getType(chars);
    if (!type) return next();
    if (type === 'list-item' && startBlock.type === 'list-item') return next();
    event.preventDefault();

    editor.setBlocks(type);

    if (type === 'list-item') {
      editor.wrapBlock('ul-list');
    }

    editor.moveFocusToStartOfNode(startBlock).delete();
    return undefined;
  }

  /**
   * On backspace, if at the start of a non-paragraph, convert it back into a
   * paragraph node.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */

  onBackspace = (event, editor, next) => {
    const { value } = editor;
    const { selection } = value;
    if (selection.isExpanded) return next();
    if (selection.start.offset !== 0) return next();

    const { startBlock } = value;
    if (startBlock.type === 'paragraph') return next();

    event.preventDefault();
    editor.setBlocks('paragraph');

    if (startBlock.type === 'list-item') {
      editor.unwrapBlock('ul-list');
    }

    return undefined;
  }

  /**
   * On return, if at the end of a node type that should not be extended,
   * create a new paragraph below it.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */

  onEnter = (event, editor, next) => {
    const { value } = editor;
    const { selection } = value;
    const { start, end, isExpanded } = selection;
    if (isExpanded) return next();

    const { startBlock } = value;
    if (start.offset === 0 && startBlock.text.length === 0) {
      return this.onBackspace(event, editor, next);
    }
    if (end.offset !== startBlock.text.length) return next();

    if (
      startBlock.type !== 'heading-one' &&
      startBlock.type !== 'heading-two' &&
      startBlock.type !== 'heading-three' &&
      startBlock.type !== 'heading-four' &&
      startBlock.type !== 'heading-five' &&
      startBlock.type !== 'heading-six' &&
      startBlock.type !== 'block-quote'
    ) {
      return next();
    }

    event.preventDefault();
    editor.splitBlock().setBlocks('paragraph');
    return undefined;
  }

  /**
   * On key down, check for our specific key shortcuts.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */

  onKeyDown = (event, editor, next) => {
    switch (event.key) {
      case ' ':
        return this.onSpace(event, editor, next);
      case 'Backspace':
        return this.onBackspace(event, editor, next);
      case 'Enter':
        return this.onEnter(event, editor, next);
      default:
        return next();
    }
  }

  /**
   * Get the block type for a series of auto-markdown shortcut `chars`.
   *
   * @param {String} chars
   * @return {String} block
   */

  getType = (chars) => {
    switch (chars) {
      case '*':
      case '-':
      case '+':
        return 'list-item';
      case '>':
        return 'block-quote';
      case '#':
        return 'heading-one';
      case '##':
        return 'heading-two';
      case '###':
        return 'heading-three';
      case '####':
        return 'heading-four';
      case '#####':
        return 'heading-five';
      case '######':
        return 'heading-six';
      default:
        return null;
    }
  }

  updateRect(oldRect, newRect) {
    const oldString = JSON.stringify(oldRect);
    const newString = JSON.stringify(newRect);

    if (oldString !== newString) {
      this.setState({ rect: newRect });
    }
  }

  /**
   * Update the menu's absolute position.
   */

  updateMenu = () => {
    const value = this.state.value;
    const oldRect = this.state.rect;

    if (!value) {
      this.updateRect(oldRect, null);
      return;
    }

    const { fragment, selection } = value;

    if (selection.isBlurred || selection.isCollapsed || fragment.text === '') {
      this.updateRect(oldRect, null);
      return;
    }

    const native = window.getSelection();
    const range = native.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    this.updateRect(oldRect, rect);

    // menu.style.opacity = 1;
    // menu.style.top = `${rect.top + (window.pageYOffset - menu.offsetHeight)}px`;
    // menu.style.left = `${rect.left + (window.pageXOffset - (menu.offsetWidth / 2)) + (rect.width / 2)}px`;
  }

  handleOnChange = ({ value }) => {
    this.setState({ value });
    // console.log('handleOnChange');
    console.log(JSON.stringify(value, null, 4));
    // console.log(this.slateToMarkdownConverter.convert(value));
    this.handleTextChange(this.slateToMarkdownConverter.convert(value));
  }

  /**
   * Render a Slate node.
   *
   * @param {Object} props
   * @param {Editor} editor
   * @param {Function} next
   * @return {Element}
   */

  renderNode = (props, editor, next) => {
    const { attributes, children, node } = props;

    switch (node.type) {
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'ul-list':
        return <ul {...attributes}>{children}</ul>;
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>;
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>;
      case 'heading-three':
        return <h3 {...attributes}>{children}</h3>;
      case 'heading-four':
        return <h4 {...attributes}>{children}</h4>;
      case 'heading-five':
        return <h5 {...attributes}>{children}</h5>;
      case 'heading-six':
        return <h6 {...attributes}>{children}</h6>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      default:
        return next();
    }
  }

  /**
   * Render the editor.
   *
   * @param {Object} props
   * @param {Function} next
   * @return {Element}
   */

  renderEditor = (props, ed, next) => {
    const { editor } = props;
    const children = next();
    return (
      <React.Fragment>
        {children}
        <HoverMenu
          innerRef={menu => (this.menu = menu)}
          editor={editor}
          rect={this.state.rect}
        />
      </React.Fragment>
    );
  }

  /**
   * Render a Slate mark.
   *
   * @param {Object} props
   * @param {Editor} editor
   * @param {Function} next
   * @return {Element}
   */

  renderMark = (props, editor, next) => {
    const { children, mark, attributes } = props;

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>;
      case 'code':
        return <code {...attributes}>{children}</code>;
      case 'italic':
        return <em {...attributes}>{children}</em>;
      case 'underlined':
        return <u {...attributes}>{children}</u>;
      default:
        return next();
    }
  }

  /**
   *
   * Render the example.
   *
   * @return {Component} component
   */

  render() {
    return (
      <div>
        <Editor
          placeholder="Write some markdown..."
          defaultValue={this.initialValue}
          onKeyDown={this.onKeyDown}
          renderNode={this.renderNode}
          onChange={this.handleOnChange}
          schema={schema}
          renderEditor={this.renderEditor}
          renderMark={this.renderMark}
        />
      </div>
    );
  }
}

RichTextEditor.propTypes = {
  handleTextChange: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

/**
 * Export.
 */

export default RichTextEditor;
