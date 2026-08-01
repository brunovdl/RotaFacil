import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreatePixPaymentDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsOptional()
  @IsString()
  cpf?: string;
}
