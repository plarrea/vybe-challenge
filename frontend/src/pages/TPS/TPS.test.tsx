import { describe, expect, it, vi } from "vitest"

import TPS from "./index";
import { act, render, screen } from "../../../test-utils";

import api from '../../api/solana';
vi.mock('../../api/solana');
vi.mock('react-apexcharts', () => ({
  default: () => <div>ApexChart</div>
}));

describe("TPS Tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("Loading is shown when data null", async() => {
    vi.spyOn(api, 'get').mockRejectedValue('error');
    render(<TPS />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it("Apex chart is shown when data is returned", async() => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({data:[{tps: 0, date: 0}]});
    await act(() => render(<TPS />));
    expect(screen.getByText('ApexChart')).toBeInTheDocument();
  });

  it("No Results is shown when the data is empty", async() => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({data:[]});
    await act(() => render(<TPS />));
    expect(screen.getByText('No Results')).toBeInTheDocument();
  });
});