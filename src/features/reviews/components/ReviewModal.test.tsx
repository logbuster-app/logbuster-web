import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createReviewMock = vi.hoisted(() => vi.fn());
vi.mock("../api/reviews", () => ({ createReview: createReviewMock }));

const checkSpoilerMock = vi.hoisted(() => vi.fn());
vi.mock("../api/reviewAi", () => ({ checkSpoiler: checkSpoilerMock }));

import type { Review } from "../types";
import { ReviewModal } from "./ReviewModal";

const createdReview: Review = {
  id: "review-1",
  movieId: "tt0133093",
  authorName: "Thyago",
  rating: 4.5,
  content: "Uma análise suficientemente longa para publicação.",
  isSpoiler: true,
  highlights: ["direction", "visual_effects"],
  counts: { like: 0, spoiler: 0, wellArgued: 0 },
  viewerInteractions: [],
  createdAt: "2026-11-09T12:00:00Z",
};

describe("ReviewModal", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    checkSpoilerMock.mockResolvedValue("clear");
  });

  async function fillValidForm() {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "4,5 de 5 estrelas" }));
    await user.click(screen.getByRole("button", { name: "Direção" }));
    await user.click(screen.getByRole("button", { name: "Efeitos Especiais" }));
    await user.type(screen.getByLabelText(/nome \/ apelido/i), "Thyago");
    await user.type(
      screen.getByLabelText(/sua análise/i),
      "Uma análise suficientemente longa para publicação.",
    );
    await user.click(screen.getByRole("checkbox", { name: /contém spoilers/i }));
    return user;
  }

  it("valida campos obrigatórios e não tenta publicar uma nota vazia", async () => {
    const user = userEvent.setup();
    render(<ReviewModal movieId="tt0133093" onClose={vi.fn()} onCreated={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Selecione uma nota");
    expect(createReviewMock).not.toHaveBeenCalled();
  });

  it("mantém o conteúdo e as seleções após falha do adapter", async () => {
    createReviewMock.mockRejectedValueOnce(new Error("Falha simulada"));
    render(<ReviewModal movieId="tt0133093" onClose={vi.fn()} onCreated={vi.fn()} />);
    const user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Falha simulada");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/nome \/ apelido/i)).toHaveValue("Thyago");
    expect(screen.getByLabelText(/sua análise/i)).toHaveValue(
      "Uma análise suficientemente longa para publicação.",
    );
    expect(screen.getByRole("button", { name: "Direção" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("checkbox", { name: /contém spoilers/i })).toBeChecked();
  });

  it("publica os campos normalizados, persiste o nome e notifica sucesso", async () => {
    createReviewMock.mockResolvedValueOnce(createdReview);
    const onCreated = vi.fn();
    render(<ReviewModal movieId="tt0133093" onClose={vi.fn()} onCreated={onCreated} />);
    const user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    await waitFor(() => {
      expect(createReviewMock).toHaveBeenCalledWith({
        movieId: "tt0133093",
        authorName: "Thyago",
        rating: 4.5,
        content: "Uma análise suficientemente longa para publicação.",
        isSpoiler: true,
        highlights: ["direction", "visual_effects"],
      });
      expect(onCreated).toHaveBeenCalledWith(createdReview);
    });
    expect(window.localStorage.getItem("logbuster:review_author_name")).toBe("Thyago");
  });

  it("pede confirmação antes de descartar um texto digitado", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ReviewModal movieId="tt0133093" onClose={onClose} onCreated={vi.fn()} />);

    await user.type(screen.getByLabelText(/sua análise/i), "Um argumento que não pode se perder.");
    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("Descartar sua análise?")).toBeInTheDocument();

    // Esc de novo volta a escrever e preserva o texto.
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Descartar sua análise?")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/sua análise/i)).toHaveValue("Um argumento que não pode se perder.");

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await user.click(screen.getByRole("button", { name: "Descartar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("fecha com Escape e com Cancelar quando não está enviando", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ReviewModal movieId="tt0133093" onClose={onClose} onCreated={vi.fn()} />);

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("não fecha ao clicar fora, para não perder o texto digitado", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ReviewModal movieId="tt0133093" onClose={onClose} onCreated={vi.fn()} />);

    await user.type(screen.getByLabelText(/sua análise/i), "Texto em andamento");
    await user.click(screen.getByRole("dialog").parentElement as HTMLElement);

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/sua análise/i)).toHaveValue("Texto em andamento");
  });

  it("preenche o nome salvo da última publicação", () => {
    window.localStorage.setItem("logbuster:review_author_name", "Thyago");
    render(<ReviewModal movieId="tt0133093" onClose={vi.fn()} onCreated={vi.fn()} />);

    expect(screen.getByLabelText(/nome \/ apelido/i)).toHaveValue("Thyago");
  });

  it("fecha com Escape e mantém o modal aberto enquanto envia", async () => {
    const onClose = vi.fn();
    createReviewMock.mockReturnValueOnce(new Promise(() => {}));
    render(<ReviewModal movieId="tt0133093" onClose={onClose} onCreated={vi.fn()} />);
    const formUser = await fillValidForm();

    await formUser.click(screen.getByRole("button", { name: "Publicar avaliação" }));
    await formUser.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("ReviewModal: sugestão de spoiler", () => {
  const CONTENT = "No final, o protagonista descobre que tudo era uma simulação.";
  const PROMPT = "Seu texto parece conter spoiler. Quer marcar como spoiler?";

  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    createReviewMock.mockResolvedValue(createdReview);
  });

  async function fillFormWithoutSpoilerFlag(content = CONTENT) {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "4,5 de 5 estrelas" }));
    await user.type(screen.getByLabelText(/nome \/ apelido/i), "Thyago");
    await user.type(screen.getByLabelText(/sua análise/i), content);
    return user;
  }

  function renderModal(onCreated = vi.fn()) {
    render(<ReviewModal movieId="tt0133093" onClose={vi.fn()} onCreated={onCreated} />);
    return onCreated;
  }

  it("chama a verificação ao publicar, com o texto já validado", async () => {
    checkSpoilerMock.mockResolvedValueOnce("clear");
    renderModal();
    const user = await fillFormWithoutSpoilerFlag(`  ${CONTENT}  `);

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    await waitFor(() => expect(createReviewMock).toHaveBeenCalledTimes(1));
    expect(checkSpoilerMock).toHaveBeenCalledWith("tt0133093", CONTENT);
  });

  it("não verifica quando a avaliação é inválida", async () => {
    renderModal();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Selecione uma nota");
    expect(checkSpoilerMock).not.toHaveBeenCalled();
  });

  it("não verifica quando o autor já marcou spoiler", async () => {
    renderModal();
    const user = await fillFormWithoutSpoilerFlag();
    await user.click(screen.getByRole("checkbox", { name: /contém spoilers/i }));

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    await waitFor(() => expect(createReviewMock).toHaveBeenCalledTimes(1));
    expect(checkSpoilerMock).not.toHaveBeenCalled();
    expect(createReviewMock.mock.calls[0][0]).toMatchObject({ isSpoiler: true });
  });

  it("mostra 'Verificando...' e bloqueia o fechamento enquanto a IA analisa", async () => {
    let resolveCheck: (value: string) => void = () => {};
    checkSpoilerMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCheck = resolve;
      }),
    );
    const onClose = vi.fn();
    render(<ReviewModal movieId="tt0133093" onClose={onClose} onCreated={vi.fn()} />);
    const user = await fillFormWithoutSpoilerFlag();

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    expect(screen.getByRole("button", { name: "Verificando..." })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByText("Descartar sua análise?")).not.toBeInTheDocument();

    resolveCheck("clear");
    await waitFor(() => expect(createReviewMock).toHaveBeenCalledTimes(1));
  });

  it("publica direto, sem aviso, quando a IA diz 'clear'", async () => {
    checkSpoilerMock.mockResolvedValueOnce("clear");
    const onCreated = renderModal();
    const user = await fillFormWithoutSpoilerFlag();

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(createdReview));
    expect(screen.queryByText(PROMPT)).not.toBeInTheDocument();
    expect(createReviewMock.mock.calls[0][0]).toMatchObject({ isSpoiler: false });
  });

  it("publica direto, sem aviso, quando a IA está 'unavailable' (inclui timeout)", async () => {
    checkSpoilerMock.mockResolvedValueOnce("unavailable");
    const onCreated = renderModal();
    const user = await fillFormWithoutSpoilerFlag();

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(createdReview));
    expect(screen.queryByText(PROMPT)).not.toBeInTheDocument();
  });

  it("'suspected' mostra o aviso e ainda não publica", async () => {
    checkSpoilerMock.mockResolvedValueOnce("suspected");
    renderModal();
    const user = await fillFormWithoutSpoilerFlag();

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    expect(await screen.findByText(PROMPT)).toBeInTheDocument();
    expect(createReviewMock).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Publicar avaliação" })).toBeDisabled();
  });

  it("'Marcar como spoiler' publica com is_spoiler: true", async () => {
    checkSpoilerMock.mockResolvedValueOnce("suspected");
    const onCreated = renderModal();
    const user = await fillFormWithoutSpoilerFlag();
    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    await user.click(await screen.findByRole("button", { name: "Marcar como spoiler" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(createdReview));
    expect(createReviewMock).toHaveBeenCalledWith(
      expect.objectContaining({ content: CONTENT, isSpoiler: true }),
    );
  });

  it("'Publicar assim mesmo' publica com is_spoiler: false", async () => {
    checkSpoilerMock.mockResolvedValueOnce("suspected");
    const onCreated = renderModal();
    const user = await fillFormWithoutSpoilerFlag();
    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    await user.click(await screen.findByRole("button", { name: "Publicar assim mesmo" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(createdReview));
    expect(createReviewMock).toHaveBeenCalledWith(
      expect.objectContaining({ content: CONTENT, isSpoiler: false }),
    );
  });

  it("não pergunta de novo sobre o mesmo texto se a publicação falhar e o autor tentar outra vez", async () => {
    checkSpoilerMock.mockResolvedValueOnce("suspected");
    createReviewMock.mockRejectedValueOnce(new Error("Falha simulada"));
    const onCreated = renderModal();
    const user = await fillFormWithoutSpoilerFlag();
    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));
    await user.click(await screen.findByRole("button", { name: "Publicar assim mesmo" }));
    expect(await screen.findByText("Falha simulada")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(createdReview));
    expect(checkSpoilerMock).toHaveBeenCalledTimes(1);
  });

  it("após marcar como spoiler e falhar, o checkbox continua marcado", async () => {
    checkSpoilerMock.mockResolvedValueOnce("suspected");
    createReviewMock.mockRejectedValueOnce(new Error("Falha simulada"));
    renderModal();
    const user = await fillFormWithoutSpoilerFlag();
    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    await user.click(await screen.findByRole("button", { name: "Marcar como spoiler" }));

    expect(await screen.findByText("Falha simulada")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /contém spoilers/i })).toBeChecked();
  });

  it("'Voltar e editar' e Escape fecham o aviso sem publicar nem fechar o modal", async () => {
    checkSpoilerMock.mockResolvedValue("suspected");
    const onClose = vi.fn();
    render(<ReviewModal movieId="tt0133093" onClose={onClose} onCreated={vi.fn()} />);
    const user = await fillFormWithoutSpoilerFlag();

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));
    await user.click(await screen.findByRole("button", { name: "Voltar e editar" }));
    expect(screen.queryByText(PROMPT)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));
    expect(await screen.findByText(PROMPT)).toBeInTheDocument();
    await user.keyboard("{Escape}");

    expect(screen.queryByText(PROMPT)).not.toBeInTheDocument();
    expect(screen.queryByText("Descartar sua análise?")).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(createReviewMock).not.toHaveBeenCalled();
  });

  it("com o aviso aberto, os campos ficam bloqueados; 'Voltar e editar' libera e devolve o foco ao texto", async () => {
    checkSpoilerMock.mockResolvedValueOnce("suspected");
    renderModal();
    const user = await fillFormWithoutSpoilerFlag();
    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));
    expect(await screen.findByText(PROMPT)).toBeInTheDocument();

    expect(screen.getByLabelText(/sua análise/i)).toBeDisabled();
    expect(screen.getByLabelText(/nome \/ apelido/i)).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: /contém spoilers/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Voltar e editar" }));

    const textarea = screen.getByLabelText(/sua análise/i);
    expect(textarea).toBeEnabled();
    expect(textarea).toHaveFocus();
  });

  it("bloqueia os campos enquanto a IA analisa, para o texto não mudar durante a verificação", async () => {
    let resolveCheck: (value: string) => void = () => {};
    checkSpoilerMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCheck = resolve;
      }),
    );
    renderModal();
    const user = await fillFormWithoutSpoilerFlag();

    await user.click(screen.getByRole("button", { name: "Publicar avaliação" }));

    expect(screen.getByLabelText(/sua análise/i)).toBeDisabled();

    resolveCheck("clear");
    await waitFor(() => expect(createReviewMock).toHaveBeenCalledTimes(1));
  });
});
