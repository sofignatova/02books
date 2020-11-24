import { WithStyles } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ListIcon from "@material-ui/icons/List";
import React from "react";
import { Redirect } from "react-router-dom";
import { Corpus, UserSettings } from "./Api";
import { ApiClient } from "./ApiClient";
import { getTrainingUrlForUser } from "./users";
import WordListSettings from "./WordListSettings";

const drawerWidth = 240;

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
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerContainer: {
      overflow: "auto",
    },
  });

interface SettingsProps extends WithStyles<typeof styles> {
  apiClient: ApiClient;
  settings: UserSettings;
  onSelectedCorpusChanged: (selectedCorpusId: string) => void;
  onWordRemovedChanged: (word: string, removed: boolean) => void;
}

interface SettingsState {
  back: boolean;
  corpora?: Array<Corpus>;
}

class Settings extends React.Component<
  SettingsProps & WithStyles<typeof styles>,
  SettingsState
> {
  constructor(props: SettingsProps, state: SettingsState) {
    super(props);
    this.state = { back: false };
  }

  componentDidMount() {
    this.props.apiClient.getCorpora((c: Array<Corpus>) => {
      this.setState({ corpora: c });
    });
  }

  render() {
    if (this.state.back) {
      return <Redirect to={getTrainingUrlForUser()} />;
    }
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar variant="dense">
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={() => this.setState({ back: true })}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Settings
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <Toolbar />
          <div className={classes.drawerContainer}>
            <List>
              <ListItem button selected={true}>
                <ListItemIcon>
                  <ListIcon />
                </ListItemIcon>
                <ListItemText primary="Word List" />
              </ListItem>
            </List>
          </div>
        </Drawer>
        <WordListSettings
          corpora={this.state.corpora}
          settings={this.props.settings}
          onSelectedCorpusChanged={this.props.onSelectedCorpusChanged}
          onWordRemovedChanged={this.props.onWordRemovedChanged}
        />
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Settings as any);
