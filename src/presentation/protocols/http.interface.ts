/**
 * Interface para requisições HTTP padronizadas na camada de presentation
 *
 * @interface IHttpRequest
 * @template REQ - Tipo dos dados esperados no corpo da requisição
 * @description
 * Define a estrutura padrão de uma requisição HTTP dentro da arquitetura.
 * Esta interface abstrai os detalhes específicos do framework HTTP utilizado
 * (Express, Fastify, etc.), permitindo que os controllers sejam agnósticos
 * à implementação do servidor HTTP subjacente.
 *
 * A interface utiliza generics para type safety, garantindo que os dados
 * do corpo da requisição sejam tipados corretamente em cada controller,
 * melhorando a experiência de desenvolvimento e reduzindo erros.
 *
 * @see {@link IHttpResponse} - Interface para respostas HTTP
 * @see {@link IController} - Interface para controllers que utilizam esta requisição
 */
export interface IHttpRequest<REQ = unknown> {
  /**
   * Corpo da requisição HTTP
   *
   * @description
   * Contém os dados principais enviados pelo cliente. O campo `data` é opcional
   * para permitir requisições que não precisam de corpo (GET, DELETE) ou que
   * podem ter corpo vazio. A estrutura aninhada facilita a padronização e
   * permite futuras extensões sem quebrar a compatibilidade.
   */
  body: {
    /**
     * Dados tipados da requisição
     * @type {REQ} Tipo específico definido pelo generic da interface
     */
    data?: REQ;
  };

  /**
   * Headers HTTP da requisição
   *
   * @description
   * Mapa chave-valor contendo todos os cabeçalhos HTTP enviados pelo cliente.
   * Inclui headers padrão (Content-Type, Authorization, etc.) e headers
   * customizados da aplicação. É opcional pois nem todas as requisições
   * precisam de headers específicos.
   *
   * @example
   * ```typescript
   * header: {
   *   "Content-Type": "application/json",
   *   "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs...",
   *   "X-API-Version": "v1",
   *   "User-Agent": "MyApp/1.0"
   * }
   * ```
   */
  header?: Record<string, string>;

  /**
   * Parâmetros de query string da URL
   *
   * @description
   * Contém todos os parâmetros enviados na query string da URL (?param=value).
   * Útil para filtros, paginação, ordenação e outros parâmetros opcionais.
   * Todos os valores são strings conforme especificação HTTP.
   *
   * @example
   * ```typescript
   * // URL: /users?page=2&limit=10&sort=name&active=true
   * query: {
   *   page: "2",
   *   limit: "10",
   *   sort: "name",
   *   active: "true"
   * }
   * ```
   */
  query?: Record<string, string>;

  /**
   * Parâmetros de rota da URL
   *
   * @description
   * Contém os parâmetros extraídos da rota dinâmica (path parameters).
   * Definidos no padrão da rota como /users/:id/posts/:postId e extraídos
   * automaticamente pelo roteador HTTP. Essenciais para identificar
   * recursos específicos na API RESTful.
   *
   * @example
   * ```typescript
   * // Rota: /users/:userId/posts/:postId
   * // URL: /users/123/posts/456
   * params: {
   *   userId: "123",
   *   postId: "456"
   * }
   * ```
   */
  params?: Record<string, string>;
}

/**
 * Interface para respostas HTTP padronizadas na camada de presentation
 *
 * @interface IHttpResponse
 * @template RES - Tipo dos dados retornados no corpo da resposta
 * @description
 * Define a estrutura padrão de uma resposta HTTP dentro da arquitetura.
 * Esta interface garante consistência em todas as respostas da API,
 * facilitando o consumo pelos clientes e padronizando o formato de
 * dados e erros retornados pela aplicação.
 *
 * A interface utiliza generics para type safety na resposta, permitindo
 * que cada endpoint especifique exatamente o tipo de dados que retorna,
 * melhorando a documentação automática e a experiência de desenvolvimento.
 *
 * @see {@link IHttpRequest} - Interface para requisições HTTP
 * @see {@link IHttpResponseFactory} - Factory para criar respostas padronizadas
 */
export interface IHttpResponse<RES = unknown> {
  /**
   * Corpo da resposta HTTP
   *
   * @description
   * Contém os dados ou informações de erro retornados para o cliente.
   * A estrutura é opcional para permitir respostas sem corpo (204 No Content).
   * Quando presente, pode conter dados de sucesso OU mensagem de erro,
   * nunca ambos simultaneamente, garantindo consistência na API.
   *
   */
  body?: {
    /**
     * Dados de sucesso da resposta
     * @type {RES} Tipo específico definido pelo generic da interface
     */
    data?: RES;
    /**
     * Mensagem de erro em caso de falha
     * @type {string} Mensagem descritiva do erro ocorrido
     */
    error?: string;
  };

  /**
   * Headers HTTP da resposta
   *
   * @description
   * Mapa chave-valor contendo os cabeçalhos HTTP retornados para o cliente.
   * Inclui headers padrão (Content-Type, Cache-Control, etc.) e headers
   * customizados da aplicação. Opcional pois nem todas as respostas
   * precisam de headers específicos além dos padrão do servidor.
   *
   * @example
   * ```typescript
   * headers: {
   *   "Content-Type": "application/json",
   *   "Cache-Control": "no-cache",
   *   "X-API-Version": "v1",
   *   "Location": "/users/123", // Para recursos criados
   *   "ETag": "\"123456789\"" // Para cache
   * }
   * ```
   */
  headers?: Record<string, string>;

  /**
   * Código de status HTTP da resposta
   *
   * @description
   * Código numérico padrão HTTP que indica o resultado da requisição.
   * Deve seguir as convenções HTTP: 2xx para sucesso, 4xx para erros
   * do cliente, 5xx para erros do servidor. É o único campo obrigatório
   * da interface pois toda resposta HTTP deve ter um status code.
   */
  statusCode: number;
}
