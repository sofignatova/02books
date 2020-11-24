import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { Word } from "./Api";
import Suggestion from "./Suggestion";

interface SuggestionsProps {
  suggestions?: Array<Word>;
  onWordRemovedChanged: (word: string, removed: boolean) => void;
}

interface SuggestionsState {}

export class SuggestionList extends React.Component<
  SuggestionsProps,
  SuggestionsState
> {
  constructor(props: SuggestionsProps, state: SuggestionsState) {
    super(props);
  }

  render() {
    const sentenceWords = this.props.suggestions?.map((word, i) => (
      <Suggestion
        key={word.word.toString()}
        onWordRemovedChanged={this.props.onWordRemovedChanged}
        word={word}
      />
    ));

    return (
      <Card>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
            Suggestions
          </Typography>
          <List dense style={{ minHeight: "20em" }}>
            {sentenceWords}
          </List>
        </CardContent>
      </Card>
    );
  }
}
