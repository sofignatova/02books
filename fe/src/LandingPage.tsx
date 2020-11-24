import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import React from "react";
import { Redirect } from "react-router-dom";
import { User } from "./Api";
import { ApiClient } from "./ApiClient";
import { getTrainingUrlForUser } from "./users";

interface LandingPageProps {
  apiClient: ApiClient;
}

interface LandingPageState {
  redirect?: string;
}

export default class LandingPage extends React.Component<
  LandingPageProps,
  LandingPageState
> {
  constructor(props: LandingPageProps, state: LandingPageState) {
    super(props);
    this.state = {};
  }

  private createUser() {
    this.props.apiClient.createUser((user: User) =>
      this.setState({ redirect: getTrainingUrlForUser(user.id) })
    );
  }

  render() {
    if (this.state.redirect !== undefined) {
      return (
        <Redirect
          to={{ pathname: this.state.redirect, state: { isNewAccount: true } }}
        />
      );
    }
    // 1920x1080
    return (
      <Box textAlign="center">
        <video loop playsInline controls style={{ width: "100%" }}>
          <source src="http://videos.ctfassets.net/oqn5qhpsy9i3/1KP0Opq4NzvOg7MzsAOH9b/89ed96bafcd387b619d6a9a07cf3c768/LyftUp_GM_15s_v7.mp4" />
        </video>
        <Button
          variant="contained"
          color="primary"
          onClick={(e) => this.createUser()}
        >
          Start Practicing!
        </Button>
      </Box>
    );
  }
}
