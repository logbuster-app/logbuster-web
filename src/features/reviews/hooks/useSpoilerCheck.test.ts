import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as reviewAi from "../api/reviewAi";
import { useSpoilerCheck } from "./useSpoilerCheck";

describe("useSpoilerCheck", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("liga checking durante a análise e devolve o veredito", async () => {
    let resolveCheck: (value: "suspected") => void = () => {};
    const spy = vi.spyOn(reviewAi, "checkSpoiler").mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCheck = resolve;
      }),
    );

    const { result } = renderHook(() => useSpoilerCheck());
    expect(result.current.checking).toBe(false);

    let verdict: Promise<string> = Promise.resolve("");
    act(() => {
      verdict = result.current.check("tt0133093", "Neo morre no final.");
    });
    expect(result.current.checking).toBe(true);

    await act(async () => {
      resolveCheck("suspected");
      await verdict;
    });

    expect(result.current.checking).toBe(false);
    await expect(verdict).resolves.toBe("suspected");
    expect(spy).toHaveBeenCalledWith("tt0133093", "Neo morre no final.");
  });
});
