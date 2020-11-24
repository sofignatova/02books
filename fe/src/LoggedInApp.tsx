import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle/AlertTitle";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { UserSettings, Word } from "./Api";
import { ApiClient } from "./ApiClient";
import Settings from "./Settings";
import Trainer from "./Trainer";

interface LoggedInAppProps {
  apiClient: ApiClient;
}

interface LoggedInAppState {
  settings?: UserSettings;
  settingsError?: Error;
  suggestions?: Array<Word>;
}

export default class LoggedInApp extends React.Component<
  LoggedInAppProps,
  LoggedInAppState
> {
  constructor(props: LoggedInAppProps, state: LoggedInAppState) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.loadSettings();
    this.loadSuggestions();
  }

  private loadSettings() {
    this.setState({ settings: undefined, settingsError: undefined });
    this.props.apiClient.getSettings(
      this.handleSettingsLoaded.bind(this),
      this.handleSettingsError.bind(this)
    );
  }

  private loadSuggestions() {
    this.props.apiClient.getWordSuggestions(
      this.handleSuggestionsLoaded.bind(this)
    );
  }

  private handleSettingsLoaded(settings: UserSettings) {
    this.setState({ settings: settings, settingsError: undefined });
  }

  private handleSuggestionsLoaded(suggestions: Array<Word>) {
    this.setState({ suggestions: suggestions });
  }

  private handleSettingsError(error: Error) {
    this.setState({ settings: undefined, settingsError: error });
  }

  private handleSelectedCorpusChanged(selectedCorpusId: string) {
    if (this.state.settings !== undefined) {
      const [settings, update] = this.state.settings.update({
        selectedCorpusId: selectedCorpusId,
      });

      this.setState({ settings: settings });
      this.props.apiClient.updateSettings(update, (settings: UserSettings) => {
        this.handleSettingsLoaded(settings);
        this.loadSuggestions();
      });
    }
  }

  private handleWordRemovedChanged(word: string, removed: boolean) {
    if (this.state.settings !== undefined) {
      const [settings, update] = this.state.settings.update({
        updatedWords: [{ word: word, removed: removed }],
      });

      this.setState({
        settings: settings,
        suggestions: this.state.suggestions?.filter((w) => w.word !== word),
      });
      this.props.apiClient.updateSettings(update, () => this.loadSuggestions());
    }
  }

  private handleTrainingUpdated() {
    this.loadSuggestions();
  }

  render() {
    if (this.state.settingsError !== undefined) {
      return (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={(e) => this.loadSettings()}
            >
              RETRY
            </Button>
          }
        >
          <AlertTitle>Error loading settings</AlertTitle>
          {this.state.settingsError.message}
        </Alert>
      );
    }
    if (this.state.settings === undefined) {
      return <CircularProgress />;
    }
    return (
      <Router>
        <Switch>
          <Route path="/settings">
            <Settings
              apiClient={this.props.apiClient}
              settings={this.state.settings}
              onSelectedCorpusChanged={this.handleSelectedCorpusChanged.bind(
                this
              )}
              onWordRemovedChanged={this.handleWordRemovedChanged.bind(this)}
            />
          </Route>
          <Route path="/">
            <Trainer
              apiClient={this.props.apiClient}
              suggestions={this.state.suggestions}
              onWordRemovedChanged={this.handleWordRemovedChanged.bind(this)}
              onTrainingUpdated={this.handleTrainingUpdated.bind(this)}
            />
          </Route>
        </Switch>
      </Router>
    );
  }
}
