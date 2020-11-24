import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import * as _ from "lodash";
import React from "react";
import { Training, Word } from "./Api";
import { ApiClient } from "./ApiClient";
import SentenceWord from "./SentenceWord";
import "./SentenceWords.css";

interface SentenceWordsProps {
  apiClient: ApiClient;
  sentence: string;
  onTrainingUpdated?: () => void;
}

interface SentenceWordsState {
  rawWords: Array<string>;
  selected: Array<boolean>;
  rawWordToWord: Map<string, Word>;
}

export default class SentenceWords extends React.Component<
  SentenceWordsProps,
  SentenceWordsState
> {
  constructor(props: SentenceWordsProps, state: SentenceWordsState) {
    super(props);
    this.state = { rawWords: [], selected: [], rawWordToWord: new Map() };
  }

  static getWords(s: string): Array<string> {
    let match = s.match(/\b(\w+'?\w*)\b/g);
    return match ? match : [];
  }

  private saveTrainingResult() {
    this.props.apiClient.addTraining(
      new Training(
        this.props.sentence,
        this.state.rawWords.map((word, index) => {
          return {
            word: word,
            correct: !this.state.selected[index],
          };
        })
      ),
      () => {
        this.props.onTrainingUpdated?.();
        this.updateWordStates();
      }
    );

    this.setState({
      selected: this.state.rawWords.map(() => false),
    });
  }

  private wordClicked(index: number) {
    this.setState((state) => {
      let selected = Array.from(state.selected);
      selected[index] = !selected[index];

      return { selected: selected };
    });
  }

  static getDerivedStateFromProps(
    props: SentenceWordsProps,
    state: SentenceWordsState
  ): any {
    const newWords = SentenceWords.getWords(props.sentence);
    if (_.isEqual(state.rawWords, newWords)) {
      return {};
    }

    let newSelected = [];

    for (let i in state.rawWords) {
      if (newWords[i] === state.rawWords[i]) {
        newSelected.push(state.selected[i]);
      } else {
        break;
      }
    }

    while (newSelected.length < newWords.length) {
      newSelected.push(false);
    }

    return { rawWords: newWords, selected: newSelected };
  }

  private updateWordStates() {
    this.props.apiClient.getWords(
      Array.from(new Set(this.state.rawWords)),
      (words) => {
        let rawWordToWord = words.reduce((map, word) => {
          map.set(word.word, word);
          return map;
        }, new Map());
        this.setState({ rawWordToWord: rawWordToWord });
      }
    );
  }

  componentDidUpdate(
    prevProps: SentenceWordsProps,
    prevState: SentenceWordsState
  ) {
    if (!_.isEqual(this.state.rawWords, prevState.rawWords)) {
      this.updateWordStates();
    }
  }

  render() {
    const sentenceWords = this.state.rawWords.map((word, i) => {
      return (
        <SentenceWord
          key={i.toString() + ": " + word}
          word={word}
          new={this.state.rawWordToWord.get(word)?.isNew || false}
          selected={this.state.selected[i]}
          onClick={() => this.wordClicked(i)}
        />
      );
    });

    return (
      <Card>
        <CardContent>
          <div className="SentenceWords">{sentenceWords}</div>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => this.saveTrainingResult()}
              disabled={sentenceWords.length === 0}
            >
              Update
            </Button>
          </CardActions>
        </CardContent>
      </Card>
    );
  }
}
