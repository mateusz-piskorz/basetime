'use server'

import {prisma} from '@/lib/prisma'




export const createUser = async ({email,name,password}:{email:string,name:string,password:string})=>{
    return await prisma.user.create({data:{email,name,password}})
}