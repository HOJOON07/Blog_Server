import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from 'src/users/entities/users.entity';
import { HASH_ROUNDS, JWT_Expires_Time, JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bycrypt from 'bcrypt';
import e from 'express';
import { decode } from 'punycode';
import { sign } from 'crypto';

@Injectable()
export class AuthService {
  /**
   * 토큰을 사용하게 되는 방식
   *
   * 1) 사용자가 로그인 또는 회원가입을 진행하면
   *    accessToken과 refreshToken을 발급받는다.
   *
   * 2) 로그인 할때는 Basic 토큰과 함꼐 요청을 보낸다.
   *    Basic 토큰은 '이메일:비밀번호'를 Base64로 인코딩한 형태이다.
   *    예) {authorization: "Basic {token}"}
   *
   * 3) 아무나 접근 할 수 없는 정보를 접근 할때는 accessToken을 헤더에 추가해서 요청과 함께 보낸다.
   *    예) {authorization: "bearer {token}"} 이렇게 보낼꺼임.
   *
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보냄
   *    사용자가 누구인지 알 수 있다.
   *    예를 들어서 현재 로그인한 사용자가 작성한 포스트만 가져오려면 토큰의 sub 값에 입력돼있는 사용자의 포스트만 따로 필터링 할 수 있다.
   *    특정 사용자의 토큰이 없다면 다른 사용자의 데이터를 접근 못한다.
   *
   * 5) 모든 토큰은 만료 기간이 있다. 만료기간이 지나면 새로 토큰을 발급받아야한다.
   *    그렇지 않으면 jwtService.verify()에서 인증을 통과 할 수 없을 것이다.
   *    그러니 access토큰과 refresh토큰을 새로 발급받는 api가 필요하다
   *
   * 6) 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 엔드포인트에 요청을 해서
   *    새로운 토큰을 발급받고 새로운 토큰을 사용해서 private route에 접근한다.
   *
   */

  /**
   *
   * 헤더로 부터 토큰을 받을 때
   * {authorization: "Basic {token}"}
   * {authorization: "Bearer {token}"}
   *
   */

  extractTokenFromHeader(header: string, isBearer: boolean) {
    // 'Basic {token}'  'Bearer {token}'
    // [Basic, {token}]  [Bearer, {token}]
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }

    const token = splitToken[1];

    return token;
  }
  /**
   * Basic
   * 1) asdksahdlas => email:password
   * 2) email:pasword => [email,password]
   * 3) {email:email, password:password}
   */

  decodeBasicToken(base64string: string) {
    const decoded = Buffer.from(base64string, 'base64').toString('utf-8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }

    const email = split[0];
    const password = split[1];

    return {
      email,
      password,
    };
  }
  // 토큰 검증
  verifyToken(token: string) {
    return this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });
  }
  // 새로 발급
  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });
    // payload에는 현재 sub-> id, email, type
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException(
        '토큰 재발급은 Refresh 토큰으로만 가능합니다.!',
      );
    }

    return this.signToken(
      {
        ...decoded,
      },
      isRefreshToken,
    );
  }

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
  // 1) devName 2) sub -> 사용자의 id 3) type:"access | refresh"
  signToken(user: Pick<UserModel, 'id' | 'devName'>, isRefreshToken: boolean) {
    const payload = {
      sub: user.id,
      devName: user.devName,
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

  loginUser(user: Pick<UserModel, 'id' | 'devName'>) {
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

  async registerWithEmail(
    user: Pick<UserModel, 'email' | 'password' | 'devName'>,
  ) {
    const hashPassWord = await bycrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.userService.createUser(
      user.email,
      hashPassWord,
      user.devName,
    );

    return this.loginUser(newUser);
  }
}
