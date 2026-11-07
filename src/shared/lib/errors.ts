/** Erro de integração com serviço externo, com mensagem segura para exibir ao usuário. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: "config" | "network" | "upstream" = "upstream",
  ) {
    super(message);
    this.name = "ApiError";
  }
}
