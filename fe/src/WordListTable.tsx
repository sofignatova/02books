import Checkbox from "@material-ui/core/Checkbox";
import LinearProgress from "@material-ui/core/LinearProgress";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import FiberNewIcon from "@material-ui/icons/FiberNew";
import React from "react";
import { Word } from "./Api";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

interface WordListTableProps {
  corpusWords: Array<Word>;
  removedWords: Set<string>;
  onWordRemovedChanged: (word: string, removed: boolean) => void;
}

export default function WordListTable(props: WordListTableProps) {
  const classes = useStyles();
  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Word</TableCell>
            <TableCell>Frequency</TableCell>
            <TableCell>Mastery</TableCell>
            <TableCell>Removed</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.corpusWords.map((corpusWord) => (
            <TableRow key={corpusWord.word}>
              <TableCell component="th" scope="row">
                {corpusWord.word}
              </TableCell>
              <TableCell>{corpusWord.corpusCount}</TableCell>
              <TableCell>
                {corpusWord.isNew ? (
                  <FiberNewIcon style={{ color: "blue" }} />
                ) : (
                  <LinearProgress
                    variant="determinate"
                    value={Math.max(corpusWord.levelOfMastery, 0) * 100}
                  />
                )}
              </TableCell>
              <TableCell>
                <Checkbox
                  defaultChecked={props.removedWords.has(corpusWord.word)}
                  onChange={(e) =>
                    props.onWordRemovedChanged(
                      corpusWord.word,
                      e.target.checked
                    )
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
