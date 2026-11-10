import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StarRatingInput } from "./StarRatingInput";

describe("StarRatingInput", () => {
  it("permite selecionar notas em passos de meia estrela", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StarRatingInput value={null} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "0,5 de 5 estrelas" }));
    await user.click(screen.getByRole("button", { name: "5,0 de 5 estrelas" }));

    expect(onChange).toHaveBeenNthCalledWith(1, 0.5);
    expect(onChange).toHaveBeenNthCalledWith(2, 5);
  });
});