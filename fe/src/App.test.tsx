import { render } from "@testing-library/react";
import { SnackbarProvider } from "notistack";
import React from "react";
import App from "./App";

test("load landing page", () => {
  const { getByText, getByRole } = render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );
  const startButton = getByText("Start Practicing!");
  expect(startButton).toBeInTheDocument();
});
