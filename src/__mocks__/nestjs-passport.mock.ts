export const AuthGuard = (_strategy: string) => {
  return class MockAuthGuard {
    canActivate(): boolean {
      return true;
    }

    handleRequest<TUser = unknown>(_err: unknown, user: TUser): TUser {
      return user;
    }
  };
};

export const PassportModule = {
  register: () => ({ module: class {} }),
  forRoot: () => ({ module: class {} }),
};
