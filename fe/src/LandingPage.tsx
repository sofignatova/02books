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

    // For suggested video formats, see:
    // https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs
    return (
      <Box textAlign="center">
        <video
          loop
          playsInline
          controls
          poster={process.env.PUBLIC_URL + "landing-poster.jpg"}
          style={{ width: "100%", maxHeight: "90vh" }}
        >
          <source src={process.env.PUBLIC_URL + "landing.webm"} />
          <source src={process.env.PUBLIC_URL + "landing.mp4"} />
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
