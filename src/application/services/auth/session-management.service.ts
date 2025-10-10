import {
  ACCESS_TOKEN_EXPIRY_SECONDS,
  MAX_DEVICE_INFO_LENGTH,
  SESSION_EXPIRY_DAYS,
} from "../../../domain/constants";
import { User } from "../../../domain/entities";
import { SessionRepository } from "../../../domain/repositories";
import { TokenHandlerProtocol } from "../../protocols";

interface SessionManagementServiceDependencies {
  sessionRepository: SessionRepository;
  tokenHandler: TokenHandlerProtocol;
}

interface SessionData {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  expiresIn: number;
}

/**
 * Serviço responsável por gerenciar o ciclo de vida de sessões de usuários.
 *
 * Responsabilidades:
 * - Criar novas sessões com tokens JWT
 * - Desativar sessões anteriores do usuário
 * - Gerar access e refresh tokens
 * - Gerenciar informações de device e IP
 */
export class SessionManagementService {
  constructor(
    private readonly dependencies: SessionManagementServiceDependencies,
  ) {}

  /**
   * Cria uma nova sessão para o usuário e gera os tokens de acesso.
   *
   * Desativa todas as sessões anteriores do usuário antes de criar a nova.
   *
   * Nota técnica: A sessão é criada com tokens placeholder porque os tokens JWT
   * precisam incluir o session.id. Após a criação, os tokens reais são gerados
   * e atualizados. Isso resulta em 3 operações no DB (1 create + 2 updates),
   * mas é arquiteturalmente necessário.
   *
   * @param user - Usuário autenticado
   * @param ipAddress - IP da requisição
   * @param userAgent - User agent do cliente
   * @param deviceInfo - Informações do dispositivo (opcional)
   * @returns Tokens de acesso e ID da sessão
   */
  public readonly createSession = async (
    user: User,
    ipAddress: string,
    userAgent: string,
    deviceInfo?: string,
  ): Promise<SessionData> => {
    const { sessionRepository } = this.dependencies;

    await sessionRepository.deactivateAllUserSessions(user.id);

    const sessionData = this.prepareSessionData(
      user.id,
      ipAddress,
      userAgent,
      deviceInfo,
    );

    const session = await sessionRepository.create(sessionData);

    const tokens = this.generateTokens(user, session.id);

    await this.updateSessionTokens(session.id, tokens);

    return {
      ...tokens,
      sessionId: session.id,
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    };
  };

  /**
   * Prepara os dados da sessão para criação.
   */
  private readonly prepareSessionData = (
    userId: string,
    ipAddress: string,
    userAgent: string,
    deviceInfo?: string,
  ) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    const finalDeviceInfo =
      deviceInfo || userAgent.substring(0, MAX_DEVICE_INFO_LENGTH);

    return {
      userId,
      token: "pending",
      refreshToken: "pending",
      deviceInfo: finalDeviceInfo,
      ipAddress,
      userAgent,
      isActive: true,
      expiresAt,
    };
  };

  /**
   * Gera tokens JWT para a sessão.
   */
  private readonly generateTokens = (user: User, sessionId: string) => {
    const { tokenHandler } = this.dependencies;

    const accessToken = tokenHandler.generateAccessToken({
      userId: user.id,
      sessionId,
      role: user.role,
      militaryId: user.militaryId,
    });

    const refreshToken = tokenHandler.generateRefreshToken({
      userId: user.id,
      sessionId,
    });

    return { accessToken, refreshToken };
  };

  /**
   * Atualiza a sessão com os tokens gerados.
   */
  private readonly updateSessionTokens = async (
    sessionId: string,
    tokens: { accessToken: string; refreshToken: string },
  ): Promise<void> => {
    const { sessionRepository } = this.dependencies;

    await sessionRepository.updateToken(sessionId, tokens.accessToken);
    await sessionRepository.updateRefreshToken(sessionId, tokens.refreshToken);
  };
}
