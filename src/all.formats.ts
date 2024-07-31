import { RType } from "./enums";

export interface ReqUserType {
    sub: number,
    username: string,
    role: RType,
    name: string
}