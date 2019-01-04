import Editor from 'rich-markdown-editor';
import React from 'react';
import commonmark from 'commonmark';
import PropTypes from 'prop-types';

const exampleText = `
# Contract
This is a sample contract template. You can introduce variables, like \`[{variableA}]\` or even have lists:
- add list items
- like this

\`if variableA > 10\`
This is a conditional section.
\`endif\`

Even, loops:

\`foreach var in variableA\`
- This is \`var.name\`

\`endfor\`

## Clause

The document can contain **bold**, ~~strike~~, _italic_ text or even [links](https://clause.io).

Or numbered lists:
1. Item one
1. Item two

### Sub-sub heading

This is some code:

\`define constant PI = 4.0 * atan(1.0)\`

This is a quote:

> Look before you leap!

---
# Page Two

Even page breaks are supported!
`;

const unescape = text => text.replace(/\\([\\`*{}[\]()#+\-.!_>])/g, '$1');

/**
 * A draft.js based rich text editor that supports embedded editing of Cicero
 * clauses.
 */
export default class RichTextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);

    this.editor = null;

    this.setEditorRef = (element) => {
      this.editor = element;
    };

    this.state = {
      value: exampleText,
    };
  }

  handleChange() {
    this.props.handleTextChange(unescape(this.editor.value()));
  }

  handleSave() {
    console.log('Save!');
    const md = this.editor.value();

    const reader = new commonmark.Parser();
    const htmlWriter = new commonmark.HtmlRenderer({ safe: true });
    const xmlWriter = new commonmark.XmlRenderer({ safe: true, sourcepos: true });

    const parsed = reader.parse(md); // parsed is a 'Node' tree

    const xml = xmlWriter.render(parsed); // result is a String
    console.log(xml);

    const html = htmlWriter.render(parsed); // result is a String
    console.log(html);
  }

  render() {
    return (<div>
      <Editor
        readOnly={false}
        toc
        defaultValue={this.props.text}
        onChange={this.handleChange}
        onSave={this.handleSave}
        ref={this.setEditorRef}
      />
    </div>);
  }
}

RichTextEditor.propTypes = {
  handleTextChange: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};
