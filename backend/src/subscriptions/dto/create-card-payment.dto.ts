import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCardPaymentDto {
  @IsNotEmpty({ message: 'Token do cartão é obrigatório' })
  @IsString()
  token: string;

  @IsNotEmpty({ message: 'Meio de pagamento é obrigatório' })
  @IsString()
  paymentMethodId: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsOptional()
  @IsString()
  cpf?: string;
}
