import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StarRating } from "./StarRating";

describe("StarRating", () => {
  it("renderiza a nota formatada e acessível", () => {
    render(<StarRating rating={4.5} />);

    expect(screen.getByLabelText(/nota: 4,5 de 5 estrelas/i)).toBeInTheDocument();
    expect(screen.getByText("4,5")).toBeInTheDocument();
    expect(screen.getByText("/ 5")).toBeInTheDocument();
  });

  it("limita a nota no intervalo de 0.5 a 5.0", () => {
    render(<StarRating rating={6.0} />);
    expect(screen.getByText("5,0")).toBeInTheDocument();
  });
});
