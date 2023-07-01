import { describe, expect, it } from "vitest"

import Header from "./index";
import { render, screen } from "../../../test-utils";
import { MemoryRouter } from "react-router-dom";

describe("Header Tests", () => {
  it("Home link is visible with correct props", () => {
    render(<MemoryRouter initialEntries={['/']}><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  });

  it("Balances link is visible with correct props", () => {
    render(<MemoryRouter initialEntries={['/']}><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Balances' })).toHaveAttribute('href', '/balances')
  });

  it("TPS link is visible with correct props", () => {
    render(<MemoryRouter initialEntries={['/']}><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'TPS' })).toHaveAttribute('href', '/tps')
  });

  it("Market Cap link is visible with correct props", () => {
    render(<MemoryRouter initialEntries={['/']}><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Market Cap' })).toHaveAttribute('href', '/market-cap')
  });
});