import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { Types } from 'mongoose';

export function IsValidObjectId(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isValidObjectId',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (!Types.ObjectId.isValid(value)) {
                        return false;
                    }
                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid ObjectId`;
                },
            },
        });
    };
}
