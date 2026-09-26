import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useFetchSharable from "./useFetchSharable";

describe("useFetchSharable", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ users: [{ id: 1, name: "Ada" }] }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shares one in-flight request across consumers and supports invalidation", async () => {
    const fetchMock = vi.mocked(globalThis.fetch);

    const first = renderHook(({ url }) => useFetchSharable(url), {
      initialProps: { url: "/users" },
    });

    const second = renderHook(({ url }) => useFetchSharable(url), {
      initialProps: { url: "/users" },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(first.result.current.data).toEqual({
        users: [{ id: 1, name: "Ada" }],
      });
      expect(second.result.current.data).toEqual({
        users: [{ id: 1, name: "Ada" }],
      });
    });

    act(() => {
      second.result.current.invalidate();
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
