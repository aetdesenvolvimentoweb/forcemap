export interface LoginProps {
  rg: number;
  password: string;
}

export interface User {
  id: string;
  name: string;
}

export interface LoginUsecase {
  login: (props: LoginProps) => Promise<User>;
}
