import { UserBody } from "./user-search-body.interface";

export interface UserResult {
    hits: {
        total: number;
        hits: Array<{
            _source: UserBody;
        }>;
    };
}
