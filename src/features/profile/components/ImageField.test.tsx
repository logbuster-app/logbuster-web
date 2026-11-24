import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ImageField } from "./ImageField";

const mockUpload = vi.fn();
const mockDelete = vi.fn();

vi.mock("../api/profile", () => ({
  uploadProfileImage: (...args: unknown[]) => mockUpload(...args),
  deleteProfileImage: (...args: unknown[]) => mockDelete(...args),
}));

afterEach(() => {
  mockUpload.mockReset();
  mockDelete.mockReset();
});

describe("ImageField", () => {
  it("valida formato antes de enviar e faz upload quando o arquivo é válido", async () => {
    const onChanged = vi.fn();
    mockUpload.mockResolvedValueOnce("http://localhost:8000/nova-foto.webp");

    render(<ImageField kind="avatar" currentUrl={null} onChanged={onChanged} />);

    const input = screen.getByLabelText("Foto de perfil");

    const invalidFile = new File(["gif"], "anim.gif", { type: "image/gif" });
    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Envie uma imagem nos formatos JPEG, PNG ou WebP.",
    );
    expect(mockUpload).not.toHaveBeenCalled();

    const validFile = new File(["webp"], "foto.webp", { type: "image/webp" });
    fireEvent.change(input, { target: { files: [validFile] } });

    await waitFor(() => expect(mockUpload).toHaveBeenCalledWith("avatar", validFile));
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("remove a imagem atual e exibe erro da API caso o envio ou remoção falhe", async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    mockDelete
      .mockRejectedValueOnce(new Error("Falha ao remover."))
      .mockResolvedValueOnce(undefined);

    render(
      <ImageField
        kind="background"
        currentUrl="http://localhost:8000/bg.webp"
        onChanged={onChanged}
      />,
    );

    const removeBtn = screen.getByRole("button", { name: /remover fundo/i });
    await user.click(removeBtn);

    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao remover.");
    expect(onChanged).not.toHaveBeenCalled();

    await user.click(removeBtn);
    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1));
  });
});
