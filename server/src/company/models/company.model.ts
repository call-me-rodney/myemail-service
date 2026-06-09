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
	declare name: string;

	@Unique
	@Column
	declare email: string;

	@Column
	declare address: string;

	@Column
	declare service: string;

	@Column({defaultValue: true})
	declare is_active: boolean;

	@CreatedAt
	@Column({ defaultValue: new Date() })
	declare created_at: Date;

	@UpdatedAt
	@AllowNull
	@Column
	declare last_updated: Date;

	@DeletedAt
	@AllowNull
	@Column
	declare deactivated_at: Date;
}
