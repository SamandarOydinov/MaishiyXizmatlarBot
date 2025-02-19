import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface IXizmatCreationAttr {
  name: string
}

@Table({ tableName: 'xizmatlar' })
export class Xizmat extends Model<Xizmat, IXizmatCreationAttr> {
  @Column({
    type: DataType.BIGINT,
    unique: true,
  })
  id: number;

  @Column({
    type: DataType.STRING
  })
  name: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  is_active: boolean
}