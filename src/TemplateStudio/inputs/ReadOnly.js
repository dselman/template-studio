export default function ReadOnly(options) {
  return {
    onKeyDown(event, change, editor) {
      console.log('onKeyDown');
      console.log(event);
      console.log(change);
      console.log(editor);
    },
    onClick(event, change, editor) {
      console.log('onClick');
      console.log(event);
      console.log(change);
      console.log(editor);
    },
    onChange(change, editor) {
      console.log('onChange');
      console.log(change);
      console.log(editor);
    },
    onCommand(command, change, next) {
      console.log('onCommand');
      console.log(command);
      console.log(change);
      console.log(next);
    },
  };
}
