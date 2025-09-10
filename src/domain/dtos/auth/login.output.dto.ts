export type LoginOutputDTO = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    militaryId: string;
    role: string;
  };
  expiresIn: number;
};
