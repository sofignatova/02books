import React from "react";
import "./SentenceWord.css";

interface SentenceWordProps {
  word: string;
  selected: boolean;
  new: boolean;
  runs?: number;
  onClick?: () => void;
}

interface SentenceWordState {}

export default class SentenceWord extends React.Component<
  SentenceWordProps,
  SentenceWordState
> {
  constructor(props: SentenceWordProps, state: SentenceWordState) {
    super(props);
  }

  handleClick() {
    if (this.props.onClick !== undefined) {
      this.props.onClick();
    }
  }

  render() {
    const isNew = <span className="new"> ●</span>;
    return (
      <button
        onClick={(e) => this.handleClick()}
        className={"SentenceWord " + (this.props.selected ? "selected" : "")}
      >
        {this.props.word}
        {this.props.new ? isNew : undefined}
      </button>
    );
  }
}
