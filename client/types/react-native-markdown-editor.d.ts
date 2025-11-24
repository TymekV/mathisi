declare module "react-native-markdown-editor" {
  import * as React from "react";
    import { StyleProp, TextStyle, ViewProps, ViewStyle } from "react-native";

  interface MarkdownEditorProps extends ViewProps {
    defaultValue?: string;
    onMarkdownChange?: (value: string) => void;
    style?: StyleProp<ViewStyle>;
    markdownStyles?: {
      text?: StyleProp<TextStyle>;
      [key: string]: any;
    };
  }

  export default class MarkdownEditor extends React.Component<MarkdownEditorProps> {}
}
