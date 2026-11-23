export type AuthViewer = {
  userId: string;
  displayName: string;
};

export type RegisterInput = {
  displayName: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthSession = {
  accessToken: string;
  expiresIn: number;
  viewer: AuthViewer;
};
