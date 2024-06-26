import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from 'src/users/entities/users.entity';
import { HASH_ROUNDS, JWT_Expires_Time, JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bycrypt from 'bcrypt';

@Injectable()
export class AuthService {
  /*
  ** 만드려는 기능 **

  1. registerWithEmail
    - email, name, password를 입력 받고 사용자를 생성한다.
    - 생성이 완료되면 accessToken과 refreshToken을 반환한다. 
    => 회원가입을 하고 바로 로그인을 하게 해주기 위해 즉, 회원가입 후 로그인을 해주세요와 같은 쓸데없는 과정을 방지하게 위해서


  2. loginWithEmail 
    - email, password를 입력하면 사용자 검증을 진행한다.
    - 검증이 완료되면 accessToken과 refreshToken을 반환한다.
    
  3. loginUser
    - 1,2에서 필요한 accessToken과 refreshToken을 반환하는 로직
  
  4. signToken 
    - 3에서 필요한 기능. accessToken과 refreshToken을 sign하는 로직
  
  5. authenticateWithEmailAndPassword
    - 2에서 로그인을 진행할 때 필요한 기본적인 검증 진행
    1) 사용자가 존재하는지.
    2) 비밀번호가 맞는지 확인
    3) 모두 통과되면 차은 사용자 정보 반환
    4) loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성
  */

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  // signToken에 들어갈 정보
  // 1) email 2) sub -> 사용자의 id 3) type:"access | refresh"
  signToken(user: Pick<UserModel, 'id'>, isRefreshToken: boolean) {
    const payload = {
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      // seconds
      expiresIn: isRefreshToken
        ? JWT_Expires_Time.refresh
        : JWT_Expires_Time.access,
    });
  }

  loginUser(user: Pick<UserModel, 'id'>) {
    return {
      acessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UserModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.userService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    const passwordOK = await bycrypt.compare(
      user.password,
      existingUser.password,
    );

    if (!passwordOK) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return existingUser;
  }

  async loginWithEmail(user: Pick<UserModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(user: Pick<UserModel, 'email' | 'password'>, name) {
    const hashPassWord = await bycrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.userService.createUser(
      user.email,
      user.password,
      name,
    );

    return this.loginUser(newUser);
  }
}
