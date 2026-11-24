import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiClient } from "./apiClient";
import { ApiError } from "./errors";

function mockFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("createApiClient", () => {
  it("monta a URL com baseUrl e query, ignorando valores nulos", async () => {
    const fetchMock = mockFetch({ ok: true });
    const api = createApiClient({ baseUrl: "http://api.test" });

    await api.request("/v1/x", { query: { a: 1, b: undefined, c: "z" } });

    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/v1/x?a=1&c=z");
  });

  it("usa caminho relativo quando não há baseUrl", async () => {
    const fetchMock = mockFetch({});
    await createApiClient().request("/api/x", { query: { q: "a b" } });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/x?q=a+b");
  });

  it("mescla headers padrão e da requisição e serializa o body como JSON", async () => {
    const fetchMock = mockFetch({});
    const api = createApiClient({ headers: { "X-App": "lb" } });

    await api.request("/x", { method: "POST", body: { type: "like" }, headers: { "X-Visitor-Id": "v1" } });

    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-App": "lb",
      "X-Visitor-Id": "v1",
    });
    expect(JSON.parse(init.body)).toEqual({ type: "like" });
  });

  it("converte falha de rede em ApiError(network)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const promise = createApiClient().request("/x", { networkMessage: "sem rede" });

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({ code: "network", message: "sem rede" });
  });

  it("propaga AbortError sem encapsular", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("x", "AbortError")));
    await expect(createApiClient().request("/x")).rejects.toMatchObject({ name: "AbortError" });
  });

  it("usa a mensagem do corpo (error/detail) e expõe o status", async () => {
    mockFetch({ detail: "Review não encontrada" }, { ok: false, status: 404 });
    await expect(createApiClient().request("/x")).rejects.toMatchObject({
      code: "upstream",
      status: 404,
      message: "Review não encontrada",
    });
  });

  it("lê a mensagem do envelope de erro padrão do LogBuster", async () => {
    mockFetch(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "A nota deve estar entre 0.5 e 5.0.",
          details: [{ field: "rating", issue: "Valor inválido" }],
        },
      },
      { ok: false, status: 422 },
    );

    await expect(createApiClient().request("/x")).rejects.toMatchObject({
      code: "upstream",
      status: 422,
      message: "A nota deve estar entre 0.5 e 5.0.",
    });
  });

  it("prefere errorMessage explícita à do corpo", async () => {
    mockFetch({ error: "interno" }, { ok: false, status: 500 });
    await expect(createApiClient().request("/x", { errorMessage: "Falhou" })).rejects.toMatchObject({
      message: "Falhou",
    });
  });

  it("avalia headers dinâmicos a cada requisição", async () => {
    const fetchMock = mockFetch({});
    let n = 0;
    const api = createApiClient({ headers: () => ({ "X-N": String(++n) }) });

    await api.request("/x");
    await api.request("/x");

    expect(fetchMock.mock.calls[0][1].headers["X-N"]).toBe("1");
    expect(fetchMock.mock.calls[1][1].headers["X-N"]).toBe("2");
  });

  it("chama onError antes de lançar (rede e HTTP)", async () => {
    const onError = vi.fn();
    const api = createApiClient({ onError });

    mockFetch({}, { ok: false, status: 429 });
    await expect(api.request("/x")).rejects.toBeInstanceOf(ApiError);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(api.request("/x")).rejects.toBeInstanceOf(ApiError);

    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError.mock.calls[0][0]).toMatchObject({ status: 429 });
    expect(onError.mock.calls[1][0]).toMatchObject({ code: "network" });
  });

  it("envia File/Blob diretamente sem JSON.stringify e preserva o Content-Type", async () => {
    const fetchMock = mockFetch({ url: "/api/v1/users/1/images/avatar/v1" });
    const api = createApiClient({ baseUrl: "http://api.test" });
    const file = new File(["conteudo-binario"], "foto.webp", { type: "image/webp" });

    await api.request("/v1/users/me/images/avatar", {
      method: "PUT",
      body: file,
      headers: { "Content-Type": "image/webp" },
    });

    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe("PUT");
    expect(init.body).toBe(file);
    expect(init.headers["Content-Type"]).toBe("image/webp");
  });

  it("infere Content-Type a partir do Blob quando o header não é informado", async () => {
    const fetchMock = mockFetch({ url: "/api/v1/users/1/images/background/v1" });
    const blob = new Blob(["bytes"], { type: "image/png" });

    await createApiClient().request("/v1/users/me/images/background", {
      method: "PUT",
      body: blob,
    });

    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBe(blob);
    expect(init.headers["Content-Type"]).toBe("image/png");
  });

  it("retorna undefined sem chamar res.json() em respostas 204 ou de corpo vazio", async () => {
    const jsonSpy = vi.fn().mockRejectedValue(new SyntaxError("Unexpected end of JSON input"));
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 204, json: jsonSpy })
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const api = createApiClient();
    await expect(api.request<void>("/v1/users/me/images/avatar", { method: "DELETE" })).resolves.toBeUndefined();
    expect(jsonSpy).not.toHaveBeenCalled();

    await expect(api.request<void>("/v1/empty")).resolves.toBeUndefined();
    await expect(api.request<{ ok: boolean }>("/v1/json")).resolves.toEqual({ ok: true });
  });
});
