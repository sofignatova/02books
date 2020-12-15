import {
  AppBar,
  Collapse,
  createStyles,
  CssBaseline,
  IconButton,
  Theme,
  Toolbar,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CloseIcon from "@material-ui/icons/Close";
import HelpIcon from "@material-ui/icons/Help";
import SettingsIcon from "@material-ui/icons/Settings";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import React from "react";
import { Redirect, RouteComponentProps, withRouter } from "react-router-dom";
import { Word } from "./Api";
import { ApiClient } from "./ApiClient";
import { Sentence } from "./Sentence";
import SentenceWords from "./SentenceWords";
import { SuggestionList } from "./SuggestionList";
import { getHelpUrlForUser, getSettingsUrlForUser } from "./users";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(1),
    },
  });

interface TrainerProps
  extends WithStyles<typeof styles>,
    RouteComponentProps<{}> {
  apiClient: ApiClient;
  suggestions?: Array<Word>;
  onWordRemovedChanged: (word: string, removed: boolean) => void;
  onTrainingUpdated: () => void;
}

interface TrainerState {
  sentence: string;
  toSettings: boolean;
  dismissedBookmarkWarning: boolean;
}

class Trainer extends React.Component<
  TrainerProps & WithStyles<typeof styles> & RouteComponentProps<{}>,
  TrainerState
> {
  constructor(props: TrainerProps, state: TrainerState) {
    super(props);
    this.state = {
      sentence: "",
      toSettings: false,
      dismissedBookmarkWarning: false,
    };
  }

  handleChange(s: string) {
    this.setState({ sentence: s });
  }

  render() {
    const { classes } = this.props;
    const isNewAccount: boolean =
      (this.props.location.state as {
        isNewAccount?: boolean;
      })?.isNewAccount === true;

    if (this.state.toSettings) {
      return <Redirect to={getSettingsUrlForUser()} />;
    }

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="absolute" className={classes.appBar}>
          <Toolbar variant="dense">
            <Typography variant="h6" className={classes.title}>
              02Books
            </Typography>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={() => this.setState({ toSettings: true })}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={() => window.open(getHelpUrlForUser(), "_blank")}
            >
              <HelpIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <main className={classes.content}>
          <Toolbar variant="dense" />
          {isNewAccount ? (
            <Collapse in={!this.state.dismissedBookmarkWarning}>
              <Alert
                severity="warning"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      this.setState({ dismissedBookmarkWarning: true });
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                <AlertTitle>Bookmark this page</AlertTitle>
                Did you notice that you didn't have to enter your email address
                or select a password to use 02Books?{" "}
                <p>
                  That's because all of the training information is associated
                  with the web address. So please bookmark this page so your
                  practice information won't be lost!
                </p>
              </Alert>
            </Collapse>
          ) : undefined}
          <Grid
            container
            direction="row"
            justify="flex-start"
            wrap="nowrap"
            alignItems="stretch"
            style={{
              margin: 0,
              width: "100%",
            }}
            spacing={2}
          >
            <Grid item xs={10}>
              <Sentence onChange={this.handleChange.bind(this)} />
            </Grid>
            <Grid
              item
              xs={3}
              container
              direction="column"
              justify="space-evenly"
              alignItems="stretch"
              spacing={2}
            >
              <Grid item>
                <SentenceWords
                  apiClient={this.props.apiClient}
                  onTrainingUpdated={this.props.onTrainingUpdated}
                  sentence={this.state.sentence}
                />
              </Grid>
              <Grid item>
                <SuggestionList
                  onWordRemovedChanged={this.props.onWordRemovedChanged}
                  suggestions={this.props.suggestions}
                />
              </Grid>
            </Grid>
          </Grid>
        </main>
      </div>
    );
  }
}
/*
export default withRouter(
  withStyles(styles, { withTheme: true })(Trainer as any) as any
);
*/
export default withStyles(styles, { withTheme: true })(withRouter(Trainer));
