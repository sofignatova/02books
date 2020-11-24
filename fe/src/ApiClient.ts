import { getUserId } from "./users";
import { OptionsObject } from "notistack";
import {
  Corpus,
  Training,
  User,
  UserSettings,
  UserSettingsUpdate,
  Word,
} from "./Api";

export function setWordSuggestable(
  word: string,
  suggestable: boolean,
  enqueueSnackbar: (message: React.ReactNode, options?: OptionsObject) => void,
  onSet?: () => void
) {}

export class ApiClient {
  readonly onError: (error: Error) => void;

  constructor(onError: (error: Error) => void) {
    this.onError = onError;
  }

  private dispatchError(error: Error, onError?: (o: Error) => void) {
    (onError || this.onError)(error);
  }

  private handleJsonApiError(
    message: string,
    err?: Response | any,
    onError?: (o: Error) => void
  ): void {
    const baseMessage = message + ": ";

    if (err?.json !== undefined) {
      const response = err as Response;
      response
        .json()
        .then((json) => {
          const errors = json["errors"];
          if (errors === "undefined") {
            console.log("Unexpected response:", json);
            this.dispatchError(
              new Error(baseMessage + response.statusText),
              onError
            );
            return;
          }
          if (errors.length < 1) {
            console.log("Unexpected response:", json);
            this.dispatchError(
              new Error(baseMessage + response.statusText),
              onError
            );
            return;
          }
          if (errors[0]["detail"] === undefined) {
            console.log("Unexpected response:", json);
            this.dispatchError(
              new Error(baseMessage + response.statusText),
              onError
            );
            return;
          }
          this.dispatchError(
            new Error(baseMessage + errors[0]["detail"]),
            onError
          );
        })
        .catch((e) =>
          this.dispatchError(
            new Error(baseMessage + response.statusText),
            onError
          )
        );
    } else {
      this.dispatchError(new Error(baseMessage + err), onError);
    }
  }

  private dispatch<T>(
    json: any,
    deserialize: (o: any) => T | Error,
    onGet?: (o: T) => void,
    onError?: (o: Error) => void
  ) {
    const result = deserialize(json);
    if (result instanceof Error) {
      this.dispatchError(result, onError);
    } else if (onGet !== undefined) {
      onGet(result);
    }
  }

  private get<T>(
    uri: string,
    errorBase: string,
    deserialize: (o: any) => T | Error,
    onGet: (o: T) => void,
    onError?: (o: Error) => void
  ) {
    fetch(uri, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          this.handleJsonApiError(errorBase, response, onError);
          return;
        }
        response
          .json()
          .then((json) => this.dispatch(json, deserialize, onGet, onError))
          .catch((e) => this.handleJsonApiError(errorBase, e, onError));
      })
      .catch((e) => this.handleJsonApiError(errorBase, e, onError));
  }

  private set<U, T>(
    uri: string,
    set: U,
    errorBase: string,
    deserialize: (o: any) => T | Error,
    onSet?: (o: T) => void,
    onError?: (o: Error) => void
  ) {
    fetch(uri, {
      method: "POST",
      body: JSON.stringify(set),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          this.handleJsonApiError(errorBase, response, onError);
        }
        response
          .json()
          .then((json) => this.dispatch(json, deserialize, onSet, onError))
          .catch((e) => this.handleJsonApiError(errorBase, e, onError));
      })
      .catch((e) => this.handleJsonApiError(errorBase, e, onError));
  }

  private update<U, T>(
    uri: string,
    update: U,
    errorBase: string,
    deserialize: (o: any) => T | Error,
    onSet?: (o: T) => void,
    onError?: (o: Error) => void
  ) {
    fetch(uri, {
      method: "PATCH",
      body: JSON.stringify(update),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          this.handleJsonApiError(errorBase, response, onError);
          return;
        }
        response
          .json()
          .then((json) => this.dispatch(json, deserialize, onSet, onError))
          .catch((e) => this.handleJsonApiError(errorBase, e, onError));
      })
      .catch((e) => this.handleJsonApiError(errorBase, e, onError));
  }

  createUser(onSet?: (user: User) => void, onError?: (o: Error) => void) {
    this.set(
      "/api/users",
      {},
      "Unable to create a new user",
      (o) => User.fromJSON(o["data"]),
      onSet,
      onError
    );
  }

  getCorpora(onGet: (c: Array<Corpus>) => void, onError?: (o: Error) => void) {
    function deserialize(o: any): Array<Corpus> | Error {
      return o["data"].map((c: any) => Corpus.fromJSON(c));
    }
    this.get(
      "/api/corpora?user_id=" + getUserId(),
      "Unable to load word lists",
      deserialize,
      onGet,
      onError
    );
  }

  getSettings(onGet: (c: UserSettings) => void, onError?: (o: Error) => void) {
    this.get(
      "/api/settings?user_id=" + getUserId(),
      "Unable to load settings",
      (o) => UserSettings.fromJSON(o["data"]),
      onGet,
      onError
    );
  }

  updateSettings(
    update: UserSettingsUpdate,
    onSet?: (c: UserSettings) => void,
    onError?: (o: Error) => void
  ) {
    this.update(
      "/api/settings?user_id=" + getUserId(),
      update,
      "Unable to save settings",
      (o) => UserSettings.fromJSON(o["data"]),
      onSet,
      onError
    );
  }

  getWordSuggestions(
    onGet: (c: Array<Word>) => void,
    onError?: (o: Error) => void
  ) {
    this.get(
      "/api/words?suggestions&user_id=" + getUserId(),
      "Unable to load suggestions",
      (o) => Word.arrayFromJSON(o["data"]),
      onGet,
      onError
    );
  }

  getWords(
    words: Array<string>,
    onGet: (c: Array<Word>) => void,
    onError?: (o: Error) => void
  ) {
    let parameters = new URLSearchParams();
    parameters.append("user_id", getUserId());
    for (let word of words) {
      parameters.append("word", word);
    }

    this.get(
      "/api/words?" + parameters.toString(),
      "Unable to load suggestions",
      (o) => Word.arrayFromJSON(o["data"]),
      onGet,
      onError
    );
  }

  addTraining(
    training: Training,
    onSet?: () => void,
    onError?: (o: Error) => void
  ) {
    this.set(
      "/api/trainings?user_id=" + getUserId(),
      training,
      "Unable to save practice result",
      (o: any) => {},
      onSet,
      onError
    );
  }
}
