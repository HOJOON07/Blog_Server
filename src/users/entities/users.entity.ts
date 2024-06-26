import { ProfileModel } from 'src/profiles/entities/profiles.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolesEnum } from '../const/roles.const';

@Entity()
export class UserModel {
  @PrimaryGeneratedColumn()
  id: number;

  //이메일은 유니크한 값이어야 한다.
  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @OneToOne(() => ProfileModel, (profile) => profile.user, {
    // find() 실행 할때마다 항상 같이 가져올 relation
    eager: false,

    // 저장할 떄 relation을 한번에 같이 저장 가능
    cascade: true,
    nullable: true,
    // 관계가 삭제되었을 때,
    // no action => 아무것도 안함
    // cascase => 참조하는 로우도 삭제
    // set null => 참조하는 로우에서 참조 id를 null로 변경
    // set default => 기본 세팅으로 설정
    // restrict => 참조하고 있는 로우가 있는 경우 참조 당하는 로우 삭제 불가
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  profile: ProfileModel;

  @Column({
    type: 'enum',
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;
}
