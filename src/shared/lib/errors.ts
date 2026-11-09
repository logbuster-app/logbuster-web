/** Erro de integração com serviço externo, com mensagem segura para exibir ao usuário. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: "config" | "network" | "upstream" = "upstream",
    /** Status HTTP quando o erro veio de uma resposta (ausente em falhas de rede). */
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
