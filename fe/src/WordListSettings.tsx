import { WithStyles } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import React, { ChangeEvent } from "react";
import { Corpus, CorpusSource, UserSettings } from "./Api";
import WordListDetails from "./WordListDetails";

const styles = (theme: Theme) =>
  createStyles({
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
    select: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
  });

interface WordListSettingsProps extends WithStyles<typeof styles> {
  corpora: Array<Corpus>;
  settings: UserSettings;
  onSelectedCorpusChanged: (selectedCorpusId: string) => void;
  onWordRemovedChanged: (word: string, removed: boolean) => void;
}

interface WordListSettingsState {}

class WordListSettings extends React.Component<
  WordListSettingsProps & WithStyles<typeof styles>,
  WordListSettingsState
> {
  constructor(props: WordListSettingsProps, state: WordListSettingsState) {
    super(props);
    this.state = {};
  }

  private onChange(event: ChangeEvent<{ value: unknown }>) {
    this.props.onSelectedCorpusChanged(event.target.value as string);
  }

  private formatCorpusMenuItem(corpus: Corpus) {
    let level = "";
    if (corpus?.readerLevel !== undefined) {
      level =
        String.fromCodePoint(
          ("❶".codePointAt(0) as number) + corpus?.readerLevel - 1
        ) + " ";
    }

    let source = "";
    switch (corpus?.source) {
      case CorpusSource.Book:
        source = "📖 ";
        break;
      case CorpusSource.WordList:
        source = "👩‍🔬 ";
        break;
    }

    return (
      <MenuItem value={corpus.id}>
        {source}
        {level}
        {corpus.name}
      </MenuItem>
    );
  }

  private static cmpCorpora(c1: Corpus, c2: Corpus): number {
    // Sort by source, level (for books) and then by name.
    if (c1.source !== c2.source) {
      // Order word lists first.
      if (c1.source === CorpusSource.WordList) {
        return -1;
      }
      return 1;
    }
    if (c1.readerLevel !== c2.readerLevel) {
      if (c2.readerLevel === undefined) {
        return -1;
      }
      if (c1.readerLevel === undefined) {
        return 1;
      }
      if (c1.readerLevel < c2.readerLevel) {
        return -1;
      }
      return 1;
    }

    let name1 = c1.name.toLowerCase();
    let name2 = c2.name.toLowerCase();

    if (name1 < name2) {
      return -1;
    }
    if (name2 > name1) {
      return 1;
    }
    return 0;
  }

  render() {
    const { classes } = this.props;
    if (this.props.corpora === undefined || this.props.settings === undefined) {
      return (
        <main className={classes.content}>
          <Toolbar />
          <CircularProgress />
        </main>
      );
    }
    const selectedCorpusId = this.props.settings.selectedCorpusId;
    const corpus = this.props.corpora.find((c) => c.id === selectedCorpusId);

    let corporaSorted = Array.from(this.props.corpora);
    corporaSorted.sort(WordListSettings.cmpCorpora);

    return (
      <main className={classes.content}>
        <Toolbar variant="dense" />
        <Select
          className={classes.select}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={selectedCorpusId}
          onChange={(e) => this.onChange(e)}
        >
          {corporaSorted.map((corpus) => this.formatCorpusMenuItem(corpus))}
        </Select>
        <WordListDetails
          corpus={corpus}
          removedWords={this.props.settings.removedWords}
          onWordRemovedChanged={this.props.onWordRemovedChanged}
        />
      </main>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WordListSettings as any);
