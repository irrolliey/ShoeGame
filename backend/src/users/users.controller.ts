import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'generated/prisma'; // ✅ FIXED
import { Request } from 'express';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.CUSTOMER, Role.ADMIN, Role.MANAGEMENT)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @Roles(Role.CUSTOMER, Role.ADMIN, Role.MANAGEMENT)
  getProfile(@Req() req: Request) {
    return req.user; // ✅ This will return the decoded JWT user
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGEMENT, Role.CUSTOMER)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
