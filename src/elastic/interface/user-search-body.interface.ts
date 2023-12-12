import { Types } from "mongoose";

export interface UserBody {
    _id: Types.ObjectId,
    fullname: string,
    email: string,
    role: string,
    login_type: string,
    avatar: string,
    is_ban: boolean,
    classes: {
        class_id: string;
        class_name: string;
        class_description: string;
    }[]
}