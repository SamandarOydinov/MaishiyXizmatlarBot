import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Usta } from './usta.model';

interface IMijozCreationAttr {
  user_id: number | undefined;
  user_name: string | undefined;
  first_name: string | undefined;
  last_name: string | undefined;
  lang: string | undefined;
}

@Table({ tableName: 'mijoz' })
export class Mijoz extends Model<Mijoz, IMijozCreationAttr> {
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
  name: string;

  @Column({
    type: DataType.STRING,
  })
  phone_number: string;

  @Column({
    type: DataType.STRING,
  })
  xizmat: string;

  @Column({
    type: DataType.JSON,
  })
  location: object;

  @Column({
    type: DataType.STRING,
  })
  lang: string;

  @ForeignKey(() => Usta)
  @Column({
    type: DataType.BIGINT,
  })
  usta_id: number;

  @BelongsTo(() => Usta)
  usta: Usta;

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
    type: DataType.STRING,
  })
  call_with_admin: string;
}