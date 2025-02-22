import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Mijoz } from './mijoz.model';

interface IUstaCreationAttr {
  user_id: number | undefined;
  user_name: string | undefined;
  first_name: string | undefined;
  last_name: string | undefined;
  lang: string | undefined;
}

@Table({ tableName: 'usta' })
export class Usta extends Model<Usta, IUstaCreationAttr> {
  @Column({
    type: DataType.BIGINT,
    unique: true,
  })
  user_id: number;

  @Column({
    type: DataType.STRING,
  })
  first_name: string;

  @Column({
    type: DataType.STRING,
  })
  last_name: string;

  @Column({
    type: DataType.STRING,
  })
  user_name: string;

  @Column({
    type: DataType.STRING,
  })
  phone_number: string;

  @Column({
    type: DataType.STRING,
  })
  kasb: string;

  @Column({
    type: DataType.STRING,
  })
  ustaxona_name: string;

  @Column({
    type: DataType.STRING,
  })
  manzili: string;

  @Column({
    type: DataType.STRING,
  })
  destination: string;

  @Column({
    type: DataType.JSON,
  })
  location: object;

  @Column({
    type: DataType.STRING,
  })
  start_work_time: string;

  @Column({
    type: DataType.STRING,
  })
  finish_work_time: string;

  @Column({
    type: DataType.STRING,
  })
  averageTimeForCustomer: string;

  @Column({
    type: DataType.STRING,
  })
  lang: string;

  @Column({
    type: DataType.STRING,
  })
  last_state: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  status: boolean;

  @Column({
    type: DataType.STRING
  })
  call_with_admin: string

  @HasMany(() => Mijoz)
  mijoz: Mijoz[]

  // @Column({
  //   type: DataType.JSON
  // })
  // mijozlar: [{name: string, mijozid: string, time: Date}]

  @Column({
    type: DataType.JSON
  })
  my_work_day: {is_band: boolean, time: Date}
}
