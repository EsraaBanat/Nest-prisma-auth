import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { jwtSecret } from 'src/utils/constatnts';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async signup(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, phone, role } = createUserDto;
    await this.isUserExist(email, 'signup', 'Email already exists');
    const hashedPassword = await this.hashPassword(password);
    return await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
      },
    });
  }

  async signin(authDto: AuthDto, req: Request, res: Response) {
    const { email, password } = authDto;
    const foundUser = await this.isUserExist(
      email,
      'signin',
      'Wrong Credentials',
    );
    const isMatch = await this.comparePassword({
      password,
      hash: foundUser.password,
    });
    if (!isMatch) throw new BadRequestException('Wrong Credentials');
    const token = await this.signToken({
      id: foundUser.id,
      email: foundUser.email,
    });

    if (!token) throw new ForbiddenException();
    res.cookie('token', token);
    return res.send({ message: 'Logged in successfully', token });
  }

  async signout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.send({ message: 'Logged out successfully' });
  }

  async isUserExist(email: string, route: string, errorMessage: string) {
    const foundUser = await this.prisma.user.findUnique({ where: { email } });
    const condition = route == 'signup' ? foundUser : !foundUser;
    if (condition) {
      throw new BadRequestException(errorMessage);
    }
    return foundUser;
  }

  async hashPassword(password: string) {
    const saltOrRounds = 10;
    const hasedPassword = await bcrypt.hash(password, saltOrRounds);
    return hasedPassword;
  }

  async comparePassword(args: { password: string; hash: string }) {
    return await bcrypt.compare(args.password, args.hash);
  }

  async signToken(args: { id: string; email: string }) {
    const payload = args;
    return this.jwt.signAsync(payload, { secret: jwtSecret });
  }
}
