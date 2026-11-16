import { UserRole } from '../../users/users.enums';

class UserInLoginDto {
  id!: number;
  email!: string;
  name!: string;
  role!: UserRole;
}

export class LoginResponseDto {
  accessToken!: string;
  user!: UserInLoginDto;
}
