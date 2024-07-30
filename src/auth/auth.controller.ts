import {
  Body,
  Controller,
  Get,
  Post,
  Headers,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { BasciTokenGuard } from './guard/basic-token.guard';
import { RefreshTokenGuard } from './guard/bearer-token.guard';
import {
  RegisterGithubUserDto,
  RegisterUserDto,
} from './dto/register-user.dto';
import { GithubCodeDto } from './dto/register-github.dto';
import { IsPublic } from 'src/common/decorator/is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    // {accessToken: {token}}

    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    };
  }

  @Post('token/refresh')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    // {refreshToken: {token}}

    const newToken = this.authService.rotateToken(token, true);

    return {
      refreshToken: newToken,
    };
  }

  @Post('login/email')
  @IsPublic()
  @UseGuards(BasciTokenGuard)
  async postLoginEmail(
    @Headers('authorization') rawToken: string,
    @Request() req,
    // @Res() res: Response,
  ) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    // email:password -> base64

    // Z2h3bnMxMDdAbmF2ZXIuY29tOnF3ZXIxMjM0 이렇게 들어올 꺼임.

    const credentials = this.authService.decodeBasicToken(token);

    // 쿠키 보내기 테스트

    return await this.authService.loginWithEmail(credentials);

    // 여기서는 이메일과 패스워드를 받고 authenticateWithEmailAndPassword함수를 호출한다.
    // authenticateWithEmailAndPassword 이 함수는 이메일로 사용자 존재 여부를 체크.
    // 그래서 유저 정보를 반환하게 된다.
    // 마지막으로 반환한 유저 정보를 로그인 유저라는 함수에 담아서 보내주는데
    // 로그인 유저 함수는 액세스 토큰과 리프레쉬 토큰을 반환하게 됨.
    // 이 과정에서 jwt를 서명해주는데 id, devName, email을 가지고 서명해서 만든다.
    // 최종적으로는 액세스 토큰과 리프레쉬 토큰을 가지고 있을거다.
  }

  @Post('register/email')
  @IsPublic()
  postRegisterEmail(@Body() body: RegisterUserDto) {
    return this.authService.registerWithEmail(body);
  }

  @Post('/github')
  @IsPublic()
  postRegisterGithub(@Body() body: RegisterGithubUserDto) {
    return this.authService.loginWithGithubOAuth(body);
  }

  @Post('/callback/github')
  @IsPublic()
  async postOauthGithubLogin(@Body() githubCode: GithubCodeDto) {
    const userInfo = await this.authService.OAuthGithubLogin(githubCode);

    return {
      status: 200,
      message: '깃허브 유저 정보를 조회했습니다',
      userInfo,
    };
  }
}
/**
 * 1. 유저가 가입
 * 2. registerWithEmail로 비밀번호 검증, 암호화해서 DB에 유저 데이터 생성후 저장.
 * 3. 이 과정에서 이메일, 데브월드 닉네임 중복을 검증한다.
 * 4. 그다음에 로그인 시킴
 * 5. 로그인 할때는 토큰에 서명한다.
 * 6. 토큰에는 user.id, debName, email, 토큰 타입을 넣어준다.
 * 7. 그리고 토큰을 클라이언트에 리턴 해준다.
 */
