import { ListItemSecondaryAction } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { DeleteForever } from "@material-ui/icons";
import FiberNewIcon from "@material-ui/icons/FiberNew";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import React from "react";
import { Word } from "./Api";

interface SuggestionProps {
  word: Word;
  onWordRemovedChanged: (word: string, removed: boolean) => void;
}

interface SuggestionState {
  removed: boolean;
}

export default class Suggestion extends React.Component<
  SuggestionProps,
  SuggestionState
> {
  constructor(props: SuggestionProps, state: SuggestionState) {
    super(props);
    this.state = { removed: false };
  }

  render() {
    let color;
    let icon;

    if (this.props.word.isNew) {
      icon = <FiberNewIcon style={{ color: "blue" }}></FiberNewIcon>;
    } else {
      color =
        "hsla(120," + this.props.word.levelOfMastery * 100 + "%, 50%, 25%)";
      icon = <ThumbUpIcon style={{ color: color }}></ThumbUpIcon>;
    }

    return (
      <Collapse
        in={!this.state.removed}
        onExited={() =>
          // Trigger the removal of the word only after the collapse animation is complete
          // to avoid jank when this Component is removed.
          this.props.onWordRemovedChanged(this.props.word.word, true)
        }
      >
        <ListItem>
          <ListItemIcon>{icon}</ListItemIcon>
          {this.props.word.word}
          <ListItemSecondaryAction>
            <IconButton
              onClick={(e: any) => this.setState({ removed: true })}
              color="default"
              size="small"
              aria-label="upload picture"
              component="span"
            >
              <DeleteForever />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </Collapse>
    );
  }
}
