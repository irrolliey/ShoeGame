import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UsersService {
    constructor(private prisma:PrismaService){

    }
    async create(data:CreateUserDto){
        //we hash user password
        const hashedPassword = await bcrypt.hash(data.password,10);
                const user=await this.prisma.user.create({
                    data:{
                        name:data.name,
                        email:data.email,
                        password:hashedPassword,
                        role:'CUSTOMER',
                    },

                });
            //we prevent exposing the hash
            const {password, ...result}=user;
            return result;
            
    }

    async findAll(){
        return this.prisma.user.findMany();
    }
    async findOne(id:string){
        return this.prisma.user.findUnique({where:{id}});
    }
    //looks up the user during login, compares hashed password and sign JWT
    async findByEmail(email:string){
        return this.prisma.user.findUnique({
            where:{email},
            select:{
                id:true,
                name:true,
                email:true,
                password:true,
                role:true,
            }
        
        });
    }
    async updateMe(userId:string, updateUserDto:UpdateUserDto){
        /**
         * use of salt here, a salt is a random string added to the password before hashing to make the hash more secure, 
         * so even two users use the same password the hashed values will be different
         */
        
        if(updateUserDto.password){
            const salt=await bcrypt.genSalt();//generate a random salt
            updateUserDto.password=await bcrypt.hash(updateUserDto.password,salt);//hash the new password with the salt
        }
        //send the updated fields to prisma to update the user in the database
        return this.prisma.user.update({
          where:{id:userId},
          data:updateUserDto,  
        });
    }
  async deleteMe(userId: string) {
  const { password, ...user } = await this.prisma.user.update({
    where: { id: userId },
    data:{deleted:true},
  });

  return user; // returns user without the password
}

}

