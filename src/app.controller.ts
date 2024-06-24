import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
// 컨트롤러 앞에는 접두어다. -> 라우팅 주소다.
export class AppController {
  constructor(private readonly appService: AppService) {}
}
