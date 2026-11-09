import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReviewSortSelector } from "./ReviewSortSelector";

describe("ReviewSortSelector", () => {
  it("renderiza opções de ordenação e dispara onChange ao selecionar", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<ReviewSortSelector value="well_argued" onChange={handleChange} />);

    const select = screen.getByLabelText("Ordenar por:");
    expect(select).toHaveValue("well_argued");

    await user.selectOptions(select, "newest");
    expect(handleChange).toHaveBeenCalledWith("newest");
  });
});
