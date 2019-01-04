import Editor from 'rich-markdown-editor';
import React from 'react';
import commonmark from 'commonmark';
import PropTypes from 'prop-types';

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
