import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class RejectProviderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
