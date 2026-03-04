import { Table, Column, Model, AllowNull, PrimaryKey, CreatedAt, UpdatedAt, DeletedAt, Unique, DataType, ForeignKey, HasOne, BelongsTo } from "sequelize-typescript";
import { roles, sendLimits } from "../types/enum.types";
import { Company } from "src/company/models/company.model";

@Table({tableName:'users'})
export class User extends Model {
    @PrimaryKey
    @Column({type: DataType.UUID, defaultValue: DataType.UUIDV4})
    declare id: string;

    @Column
    fname: string;

    @Column
    lname: string;

    @Column
    @AllowNull
    role: roles;

    @Unique
    @Column
    @AllowNull
    email: string;

    @Column
    dob: Date;

    @Column
    @AllowNull
    password: string;

    @Column
    phone: string;

    @Column
    timezone: string;

    @ForeignKey(()=> Company)
    @Column
    company: string;

    @Column({defaultValue: sendLimits.user})
    @AllowNull
    dailySendLimit: sendLimits;

    @CreatedAt
    @Column({defaultValue: new Date()})
    created_at: Date;

    @UpdatedAt
    @AllowNull
    @Column
    updated_at: Date;

    @DeletedAt
    @AllowNull
    @Column
    deleted_at: Date;

    @Column({defaultValue: new Date()})
    lastLogin: Date;

    @Column({defaultValue: false})
    is_verified: boolean;

    @Column({defaultValue: true})
    is_active: boolean;

    @AllowNull
    @Column
    verified_at: Date;

    @AllowNull
    @Column
    @ForeignKey(()=> User)
    verified_by: string;

    // associations
    @HasOne(()=> User)
    verifier: User;

    @BelongsTo(()=> Company)
    companyDetails: Company;
}