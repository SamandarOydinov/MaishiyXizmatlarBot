import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface IBotCreationAttr {
  user_id: number | undefined;
  user_name: string | undefined;
  first_name: string | undefined;
  last_name: string | undefined;
  lang: string | undefined;
}

@Table({ tableName: 'bot' })
export class Bot extends Model<Bot, IBotCreationAttr> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
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
    type: DataType.JSON
  })
  services: object
}
