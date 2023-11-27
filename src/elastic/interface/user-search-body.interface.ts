import { Types } from "mongoose";

export interface UserBody {
    id: Types.ObjectId;
    email: string;
    fullname: string;
    role: string;
    login_type: string;
}