import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AvatarPicker } from "./AvatarPicker";

describe("AvatarPicker", () => {
  it("renderiza os 8 avatares navegáveis por teclado e alterna seleção", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(<AvatarPicker value={null} onChange={onChange} />);

    const first = screen.getByRole("button", { name: "Avatar 1 — Claquete" });
    expect(first).toHaveAttribute("aria-pressed", "false");

    first.focus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("avatar-01");

    rerender(<AvatarPicker value="avatar-01" onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Avatar 1 — Claquete" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: /usar inicial do nome/i }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
