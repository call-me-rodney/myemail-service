import { Table, Column, AllowNull, PrimaryKey, CreatedAt, UpdatedAt, DeletedAt, Unique, DataType } from "sequelize-typescript";
import { DataTypes, Model } from "sequelize";
import { Roles } from "../types/enum.types";

@Table({tableName:"users"})
export class User extends Model {
    @PrimaryKey
    @Column({type: DataType.UUID, defaultValue: DataTypes.UUIDV4})
    declare id: string;

    @Column
    fname: string;

    @Column
    lname: string;

    @Column
    role: Roles;

    @Unique
    @Column
    email: string;

    @Column
    dob: Date;

    @Column
    password: string;

    @Column
    phone: string;

    @Column
    timezone: string;

    @Column({defaultValue: 50})
    dailySendLimit: number;

    @CreatedAt
    @Column
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

    @Column
    created_by: string;

    @Column({defaultValue: false})
    is_verified: boolean;

    @Column({defaultValue: true})
    is_active: boolean;

    @AllowNull
    @Column
    verified_at: Date;
}