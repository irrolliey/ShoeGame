import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
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
    async findByEmail(email:string){
        return this.prisma.user.findUnique({
            where:{email},
            select:{
                id:true,
                email:true,
                password:true,
            }
        
        });
    }
}
