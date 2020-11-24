import Paper from "@material-ui/core/Paper";
import React from "react";
import "./Sentence.css";

interface SentenceProps {
  onChange: (s: string) => void;
}

interface SentenceState {}

export class Sentence extends React.Component<SentenceProps, SentenceState> {
  handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.props.onChange(event.target.value);
  }

  render() {
    return (
      <Paper style={{ height: "100%", boxSizing: "border-box" }}>
        <textarea
          autoFocus
          className="SentenceTextArea"
          placeholder="The cat is red"
          onChange={(e) => this.handleChange(e)}
        />
      </Paper>
    );
  }
}
