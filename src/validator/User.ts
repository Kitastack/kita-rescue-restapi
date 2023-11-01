import {
  IsString,
  IsNotEmpty,
  validate,
  MinLength,
  Matches,
  IsOptional,
} from "class-validator";
import { Request } from "express";

const message = {
  required: "tidak boleh kosong",
  string: "harus string",
};

class UserSchema {
  @IsNotEmpty({
    message: message.required,
  })
  @IsString({
    message: message.string,
  })
  username?: string;

  @IsNotEmpty({
    message: message.required,
  })
  @IsString({
    message: message.string,
  })
  @MinLength(8, {
    message: "minimal terdiri dari 8 karakter",
  })
  password?: string;

  @IsNotEmpty({
    message: message.required,
  })
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: "email tidak valid",
  })
  email?: string;

  // @IsOptional()
  // @IsArray({
  //   message: "Roles harus berupa array dari string",
  // })
  // roles?: Array<any>;

  @IsOptional()
  @IsString({
    message: "Role harus berupa string",
  })
  roles?: Array<any>;
}

export default async function User(req: Request): Promise<[any]> {
  let user: UserSchema = new UserSchema();
  user.username = req.body.username;
  user.email = req.body.email;
  user.password = req.body.password;
  user.roles = req.body.roles;
  return await validate(user, { validationError: { target: false } }).then(
    (errors) => {
      if (errors.length > 0) {
        return Object.assign(
          {},
          ...errors?.map((it) => ({
            [it.property]:
              (it.constraints && Object.values(it.constraints)) || [],
          }))
        );
      }
      return [];
    }
  );
}
