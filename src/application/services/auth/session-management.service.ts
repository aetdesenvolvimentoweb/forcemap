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
    const { sessionRepository, tokenHandler } = this.dependencies;

    // Desativa todas as sessões anteriores do usuário
    await sessionRepository.deactivateAllUserSessions(user.id);

    // Calcula data de expiração da sessão
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

    // Prepara informações do device
    const finalDeviceInfo =
      deviceInfo || `${userAgent.substring(0, MAX_DEVICE_INFO_LENGTH)}`;

    // Cria sessão temporária (tokens serão atualizados em seguida)
    const session = await sessionRepository.create({
      userId: user.id,
      token: "temp",
      refreshToken: "temp",
      deviceInfo: finalDeviceInfo,
      ipAddress,
      userAgent,
      isActive: true,
      expiresAt,
    });

    // Gera tokens JWT
    const accessToken = tokenHandler.generateAccessToken({
      userId: user.id,
      sessionId: session.id,
      role: user.role,
      militaryId: user.militaryId,
    });

    const refreshToken = tokenHandler.generateRefreshToken({
      userId: user.id,
      sessionId: session.id,
    });

    // Atualiza sessão com os tokens reais
    await sessionRepository.updateToken(session.id, accessToken);
    await sessionRepository.updateRefreshToken(session.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    };
  };
}
