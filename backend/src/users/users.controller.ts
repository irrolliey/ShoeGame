import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch, Delete } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from 'src/auth/roles.decorator'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'generated/prisma' // ✅ FIXED
import { Request } from 'express'
import { UpdateUserDto } from './dto/update-user.dto'

@Controller('users') //marks the class as a controller
@UseGuards(AuthGuard('jwt'), RolesGuard) //everyroute in this controller will require JWT authentication , and it will check user role
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //creates a new user//no role required when creating new user. new users default role is customer
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  //fetches all users and accessible to everyone now for development ,but later should be not be accessible for customer
  @Get()
  @Roles(Role.CUSTOMER, Role.ADMIN, Role.MANAGEMENT)
  findAll() {
    return this.usersService.findAll()
  }

  //returns your own user data
  @Get('me')
  @Roles(Role.CUSTOMER, Role.ADMIN, Role.MANAGEMENT)
  getProfile(@Req() req: Request) {
    return req.user // ✅ This will return the decoded JWT user
  }
  //gets a user by id
  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGEMENT, Role.CUSTOMER)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }
  /**route for updating currently logged in user
   * 1. Gets your ID from req.user.sub (decoded JWT)
   * 2. Passed the updateuserDto to the service
   * 3. if password is present, it will be hashed using bcrypt service
   */
  @Patch('me')
  @Roles(Role.CUSTOMER, Role.ADMIN, Role.MANAGEMENT)
  updateMe(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user['userId']
    return this.usersService.updateMe(userId, updateUserDto)
  }

  //deleting own user account
  @Delete('me')
  @Roles(Role.CUSTOMER, Role.ADMIN, Role.MANAGEMENT)
  async deleteMe(@Req() req) {
    const userId = req.user['userId']
    return this.usersService.deleteMe(userId)
  }
}
