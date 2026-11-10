import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HighlightPicker } from "./HighlightPicker";

describe("HighlightPicker", () => {
  it("bloqueia o terceiro destaque e reabilita opções após desmarcar", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<HighlightPicker value={[]} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Trilha Sonora" }));
    rerender(
      <HighlightPicker value={["soundtrack"]} onChange={onChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Fotografia" }));
    rerender(
      <HighlightPicker
        value={["soundtrack", "cinematography"]}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("button", { name: "Roteiro" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Trilha Sonora" }));
    expect(onChange).toHaveBeenLastCalledWith(["cinematography"]);
  });
});