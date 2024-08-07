import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { TEMP_FOLDER_PATH } from './const/path.const';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { v4 as uuid } from 'uuid';
@Module({
  imports: [
    MulterModule.register({
      limits: {
        // byte 단위로 입력
        fieldSize: 10000000,
      },
      fileFilter: (req, file, cb) => {
        /**
         * cb(에러,boolean)
         *
         * 첫번째 파라미터에는 에러가 있을 경우 에러 정보를 넣어준다.
         * 두번째 파라미터는 파일을 받을지 말지 boolean을 넣어준다.
         */

        // xxx.jpg -> .jpg 확장자만 가져옴
        const ext = extname(file.originalname);
        if (
          ext !== '.jpg' &&
          ext !== '.jpeg' &&
          ext !== '.png' &&
          ext !== '.webp' &&
          ext !== '.webp2'
        ) {
          return cb(
            new BadRequestException(
              '이미지 파일 형식이 업로드가 불가능한형식입니다.',
            ),
            false,
          );
        }
        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, cb) {
          cb(null, TEMP_FOLDER_PATH);
        },
        filename: function (req, file, cb) {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
