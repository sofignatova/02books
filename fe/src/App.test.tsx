import { render } from "@testing-library/react";
import { SnackbarProvider } from "notistack";
import React from "react";
import App from "./App";

test("load settings", () => {
  const { getByText, getByRole } = render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );
  const loading = getByRole("progressbar");
  expect(loading).toBeInTheDocument();
});
