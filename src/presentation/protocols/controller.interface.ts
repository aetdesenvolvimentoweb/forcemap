import type { HttpRequest, HttpResponse } from "./http.interface";

/**
 * Interface contrato para controllers da camada de presentation
 *
 * @interface IController
 * @template REQ - Tipo dos dados de entrada da requisição HTTP
 * @template RES - Tipo dos dados de resposta HTTP
 * @description
 * Define o contrato padrão que todos os controllers da camada de presentation
 * devem implementar. Esta interface garante consistência na assinatura dos
 * métodos de handling de requisições HTTP, facilitando a testabilidade e
 * manutenibilidade da aplicação seguindo os princípios da Clean Architecture.
 *
 * A interface utiliza generics para type safety, permitindo que cada controller
 * especifique os tipos exatos de entrada e saída, proporcionando melhor
 * experiência de desenvolvimento e detecção de erros em tempo de compilação.
 *
 * @see {@link HttpRequest} - Interface para requisições HTTP
 * @see {@link HttpResponse} - Interface para respostas HTTP
 */
export interface Controller<REQ = unknown, RES = unknown> {
  /**
   * Método principal para handling de requisições HTTP
   *
   * @method handle
   * @async
   * @param {HttpRequest<REQ>} httpRequest - Objeto de requisição HTTP tipado
   * @returns {Promise<HttpResponse<RES>>} Promise com resposta HTTP tipada
   * @description
   * Método responsável por processar uma requisição HTTP específica e retornar
   * uma resposta apropriada. Este é o ponto de entrada principal de qualquer
   * controller na arquitetura, onde toda a lógica de coordenação entre as
   * camadas de aplicação e domínio deve ser implementada.
   *
   * O método deve:
   * - Validar os dados de entrada da requisição
   * - Coordenar chamadas para services da camada de aplicação
   * - Tratar erros e convertê-los em respostas HTTP apropriadas
   * - Retornar respostas padronizadas com status codes corretos
   * - Manter logging estruturado para observabilidade
   *
   * @throws {CustomAppError} Quando erros de negócio ocorrem
   * @throws {Error} Para erros inesperados do sistema
   */
  handle: (httpRequest: HttpRequest<REQ>) => Promise<HttpResponse<RES>>;
}
