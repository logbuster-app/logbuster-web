import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useModalBehavior } from "./useModalBehavior";

function Dialog({ onClose, canClose = true }: { onClose: () => void; canClose?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useModalBehavior(ref, { onClose, canClose });
  return (
    <div ref={ref} role="dialog">
      <button type="button">Primeiro</button>
      <button type="button">Último</button>
    </div>
  );
}

describe("useModalBehavior", () => {
  it("fecha com Escape apenas quando permitido", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(<Dialog onClose={onClose} canClose={false} />);

    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();

    rerender(<Dialog onClose={onClose} canClose />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("prende o foco com Tab dentro do diálogo", async () => {
    const user = userEvent.setup();
    render(<Dialog onClose={vi.fn()} />);

    screen.getByRole("button", { name: "Último" }).focus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Primeiro" })).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Último" })).toHaveFocus();
  });

  it("trava o scroll da página e devolve o foco ao fechar", () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();

    const { unmount } = render(<Dialog onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
    expect(opener).toHaveFocus();
    opener.remove();
  });
});
