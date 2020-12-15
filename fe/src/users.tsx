export function getUserId(): string {
  return window.location.pathname.substring(
    window.location.pathname.lastIndexOf("/") + 1
  );
}

export function appendUserId(url: string, user?: string): string {
  let finalUrl = url;
  if (!url.endsWith("/")) {
    finalUrl += "/";
  }
  finalUrl += user === undefined ? getUserId() : user;
  return finalUrl;
}

export function getTrainingUrlForUser(user?: string) {
  return appendUserId("/", user);
}

export function getSettingsUrlForUser(user?: string) {
  return appendUserId("/settings", user);
}

export function getHelpUrlForUser(user?: string) {
  return "https://github.com/sofignatova/02books/blob/master/help/HELP.md#02books-help";
}
