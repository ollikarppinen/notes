import * as React from "react";
import ReactMde from "react-mde";
import ReactDOM from "react-dom";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import './styles.scss';
import { useAuth } from "./../../util/auth.js";

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});

converter.setFlavor('github');

export default function EditorPage(props) {
  const auth = useAuth();
  const userUid = auth && auth.user && auth.user.uid

  const [value, setValue] = React.useState("**Hello world!!!**");
  const [selectedTab, setSelectedTab] = React.useState("write");
  return (
    <div className="editor-page container">
      <ReactMde
        value={value}
        onChange={setValue}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={markdown =>
          Promise.resolve(converter.makeHtml(markdown))
        }
        minEditorHeight='calc(100% - 65px)'
      />
    </div>
  );
}