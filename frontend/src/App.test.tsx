import { describe, expect, it } from "vitest"

import App from "./App";
import { render, screen } from "../test-utils";

describe("App working", () => {
  it("The home title is visible", () => {
    render(<App />);
    expect(screen.getByText('Vybe Frontend Challenge')).toBeInTheDocument();
  });
});