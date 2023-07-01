import { describe, expect, it, vi } from "vitest"

import MarketCap from "./index";
import { act, render, screen } from "../../../test-utils";

import api from '../../api/solana';
vi.mock('../../api/solana');
vi.mock('react-apexcharts', () => ({
  default: () => <div>ApexChart</div>
}));

describe("Market Cap Tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Loading is shown when data null", async() => {
    vi.spyOn(api, 'get').mockRejectedValue('error');
    render(<MarketCap />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it("Apex chart is shown when data is returned", async() => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({data:[{}]});
    await act(() => render(<MarketCap />));
    expect(screen.getByText('ApexChart')).toBeInTheDocument();
  });

  it("No Results is shown when the data is empty", async() => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({data:[]});
    await act(() => render(<MarketCap />));
    expect(screen.getByText('No Results')).toBeInTheDocument();
  });
});