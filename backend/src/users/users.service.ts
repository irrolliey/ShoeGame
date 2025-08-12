import { Injectable, ConflictException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import * as bcrypt from 'bcrypt'
import { UpdateUserDto } from './dto/update-user.dto'
import { Role } from 'generated/prisma'
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  /**
   * Create a new user with hashed password
   * default role is customer unless provided
   * Handles prisma unique contraint errors for email
   *
   */
  async create(data: CreateUserDto) {
    try {
      //we hash user password before storing
      const hashedPassword = await bcrypt.hash(data.password, 10)
      //create user in db
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role || Role.CUSTOMER, //default role is customer
        },
      })
      //we prevent exposing the hashed password, and the password in the reponse
      const { password, ...result } = user
      return result
    } catch (error) {
      //Handle duplicate email error (P2002=unique constraint fail)
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new ConflictException('Email is already in use')
      }
      throw error //throw other errors
    }
  }

  /**
   * Get all users
   * Always exlude passwords for security
   */
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  /**
   * Get a single user by ID
   * always exclude password for security
   */

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  //looks up the user during login, compares hashed password and sign JWT-has to include password for login checks
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
      },
    })
  }
  /**
   * update the currently logged-in user's profile
   * if password is being updated ,hash it first
   * handles duplicate email error gracefully
   */

  async updateMe(userId: string, updateUserDto: UpdateUserDto) {
    /**
     * use of salt here, a salt is a random string added to the password before hashing to make the hash more secure,
     * so even two users use the same password the hashed values will be different
     */
    try {
      if (updateUserDto.password) {
        const salt = await bcrypt.genSalt() //generate a random salt
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt) //hash the new password with the salt
      }
      //send the updated fields to prisma to update the user in the database
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateUserDto,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      return updatedUser
    } catch (error) {
      //Handle duplicate email error (P2002=unique constraint fail)
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new ConflictException('Email is already in use')
      }
      throw error //throw other errors
    }
  }

  /**
   * Soft delete the current user(mark as deleted)
   * returns user without password
   */

  async deleteMe(userId: string) {
    const { password, ...user } = await this.prisma.user.update({
      where: { id: userId },
      data: { deleted: true },
    })

    return user // returns user without the password
  }
}
