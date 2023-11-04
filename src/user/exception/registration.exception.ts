import { HttpException } from "@nestjs/common";

export class RegistrationException extends HttpException {
    http_code: number;
    is_success: boolean;
    constructor(message, http_code, is_success) {
        super(message, http_code, is_success);
        this.http_code = http_code;
        this.is_success = is_success;
    }
}