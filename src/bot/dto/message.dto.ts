import { IsString, IsInt, IsOptional, IsObject } from 'class-validator';

export class MessageDto {
  @IsInt()
  user: number;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  opts?: unknown;
}
