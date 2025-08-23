'use server'

import {prisma} from '@/lib/prisma'


// todo: change it to api with trpc
export const getAllUsers = async ()=>{
    return await prisma.user.findMany()
}

export const createUser = async ({email,name,password}:{email:string,name:string,password:string})=>{
    return await prisma.user.create({data:{email,name,password}})
}