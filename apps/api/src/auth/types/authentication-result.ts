import type { UserResponseDto } from '../dto/user-response.dto';
import type { IssuedTokens } from './issued-tokens';

export interface AuthenticationResult {
  user: UserResponseDto;
  tokens: IssuedTokens;
}
