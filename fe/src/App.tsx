import { OptionsObject, withSnackbar, WithSnackbarProps } from "notistack";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { UserSettings, Word } from "./Api";
import { ApiClient } from "./ApiClient";
import LandingPage from "./LandingPage";
import LoggedInApp from "./LoggedInApp";

interface AppProps extends WithSnackbarProps {}
interface AppState {
  apiClient: ApiClient;
  settings?: UserSettings;
  settingsError?: Error;
  suggestions?: Array<Word>;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps, state: AppState) {
    super(props);
    this.state = { apiClient: new ApiClient(this.handleError.bind(this)) };
  }

  private handleError(error: Error): void {
    const options: OptionsObject = { variant: "error" };
    this.props.enqueueSnackbar(error.message, options);
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route path="/" exact>
            <LandingPage apiClient={this.state.apiClient} />
          </Route>
          <Route path="/">
            <LoggedInApp apiClient={this.state.apiClient} />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default withSnackbar(App);
