import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("envia o texto sem espaços nas pontas ao buscar", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await userEvent.type(screen.getByLabelText("Buscar filmes"), "  matrix  ");
    await userEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSearch).toHaveBeenCalledWith("matrix");
  });

  it("não busca com texto vazio", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await userEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("mostra o valor inicial", () => {
    render(<SearchBar initialValue="alien" onSearch={vi.fn()} />);
    expect(screen.getByLabelText("Buscar filmes")).toHaveValue("alien");
  });
});
