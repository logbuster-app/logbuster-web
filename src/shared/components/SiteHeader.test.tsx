import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("mostra a marca LogBuster como link para a página inicial", () => {
    render(<SiteHeader />);

    const link = screen.getByRole("link", { name: "LogBuster, página inicial" });
    expect(link).toHaveAttribute("href", "/");
    expect(screen.getByAltText("LogBuster")).toBeInTheDocument();
  });

  it("mostra o acesso à conta quando não há sessão", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
  });
});
