import {
	Table,
	Column,
	Model,
	PrimaryKey,
	DataType,
	Unique,
	CreatedAt,
	UpdatedAt,
	DeletedAt,
	AllowNull,
} from 'sequelize-typescript';

@Table({ tableName: 'company' })
export class Company extends Model {
	@PrimaryKey
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
	declare id: string;

	@Column
	name: string;

	@Unique
	@Column
	email: string;

	@Column
	address: string;

	@Column
	service: string;

	@CreatedAt
	@Column({ defaultValue: new Date() })
	created_at: Date;

	@UpdatedAt
	@AllowNull
	@Column
	updated_at: Date;

	@DeletedAt
	@AllowNull
	@Column
	deleted_at: Date;
}
