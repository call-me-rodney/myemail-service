import { Table, Column, Model, AllowNull, PrimaryKey, CreatedAt, UpdatedAt, DeletedAt, Unique, DataType, ForeignKey, HasOne, BelongsTo } from "sequelize-typescript";
import { roles, sendLimits } from "../types/enum.types";
import { Company } from "src/company/models/company.model";

@Table({tableName:'users'})
export class User extends Model {
    @PrimaryKey
    @Column({type: DataType.UUID, defaultValue: DataType.UUIDV4})
    declare id: string;

    @Column
    declare fname: string;

    @Column
    declare lname: string;

    @AllowNull
    @Column
    declare role: string;

    @Unique
    @AllowNull
    @Column
    declare email: string;

    @Column
    declare dob: Date;

    @AllowNull
    @Column
    declare password: string;

    @Column
    declare phone: string;

    @Column
    declare timezone: string;

    @ForeignKey(()=> Company)
    @Column
    declare company: string;
    
    @AllowNull
    @Column({defaultValue: sendLimits.user})
    declare dailySendLimit: sendLimits;

    @CreatedAt
    @Column({defaultValue: new Date()})
    declare created_at: Date;

    @UpdatedAt
    @AllowNull
    @Column
    declare updated_at: Date;

    @DeletedAt
    @AllowNull
    @Column
    declare deleted_at: Date;

    @Column({defaultValue: new Date()})
    declare lastLogin: Date;

    @Column({defaultValue: false})
    declare is_verified: boolean;

    @Column({defaultValue: true})
    declare is_active: boolean;

    @AllowNull
    @Column
    declare verified_at: Date;

    @AllowNull
    @ForeignKey(()=> User)
    @Column
    declare verified_by: string;

    // associations
    @HasOne(()=> User)
    declare verifier: User;

    @BelongsTo(()=> Company)
    declare companyDetails: Company;
}