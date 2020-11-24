import { WithStyles } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import LinearProgress, {
  LinearProgressProps,
} from "@material-ui/core/LinearProgress";
import Link from "@material-ui/core/Link/Link";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { Corpus } from "./Api";
import WordListTable from "./WordListTable";

function LinearProgressWithLabel(
  props: LinearProgressProps & { progress: number }
) {
  const { progress, ...linearProps } = props;
  return (
    <Box display="flex" alignItems="center">
      <Box mr={1}>
        <Typography variant="body2" color="textSecondary">
          Progress
        </Typography>
      </Box>
      <Box width="50%" mr={1}>
        <LinearProgress
          variant="determinate"
          value={progress * 100}
          {...linearProps}
        />
      </Box>
    </Box>
  );
}

const styles = (theme: Theme) => createStyles({});

interface WordListDetailsProps extends WithStyles<typeof styles> {
  corpus: Corpus;
  removedWords: Set<string>;
  onWordRemovedChanged: (word: string, removed: boolean) => void;
}

interface WordListDetailsState {}

class WordListDetails extends React.Component<
  WordListDetailsProps & WithStyles<typeof styles>,
  WordListDetailsState
> {
  constructor(props: WordListDetailsProps, state: WordListDetailsState) {
    super(props);
  }

  render() {
    const mastery = this.props.corpus.words
      .map((word) => word.levelOfMastery * (word.corpusCount || 1))
      .reduce((x, y) => x + y, 0);
    const totalMastery = this.props.corpus.words
      .map((word) => word.corpusCount || 1)
      .reduce((x, y) => x + y, 0);
    return (
      <Box mt={2}>
        <Box mt={2}>
          <Typography variant="body2" color="textPrimary">
            {this.props.corpus.description
              .split("\n")
              .map((paragraph: string) => (
                <p>{paragraph}</p>
              ))}
          </Typography>
        </Box>
        {this.props.corpus.link !== undefined ? (
          <Box mt={2}>
            <Link target="_blank" href={this.props.corpus.link}>
              LEARN MORE
            </Link>
          </Box>
        ) : null}
        <Box mt={2}>
          <LinearProgressWithLabel progress={mastery / totalMastery} />
        </Box>
        <Box mt={5}>
          <WordListTable
            corpusWords={this.props.corpus.words}
            removedWords={this.props.removedWords}
            onWordRemovedChanged={this.props.onWordRemovedChanged}
          />
        </Box>
      </Box>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WordListDetails as any);
