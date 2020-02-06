import { IsString, IsInt } from 'class-validator';

export class MessageDto {
    @IsInt()
    user: number;

    @IsString()
    message: string;
    
    opts?: any;
}