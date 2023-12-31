import getCurrentUser from '@/app/action/getCurrentUsers'
import { NextResponse } from 'next/server'
import prisma from '@/app/libs/prismadb'

interface IParams {
    conversationId?: string
}

export async function DELETE(
    request:Request,
    { params } : { params : IParams}
) {
    try{
        const { conversationId} = params
        const currentUser = await getCurrentUser()

        if(!currentUser) return new NextResponse('Unauthorized' , {status: 401})

        const existingConversation = await prisma.conversation.findUnique({
            where:{
                id: conversationId
            },
            include : {
                users : true
            }
        })

        if(!existingConversation) return new NextResponse('Invalid ID' , {status: 400})

        const deletedConversation = await prisma.conversation.deleteMany({
            where:{
                id: conversationId,
                userIds : {
                    hasSome: [currentUser.id]
                }
            }
        })

        return NextResponse.json(deletedConversation)
    }
    catch(err: any){
        console.log(err , 'Error conversation delete')
        return new NextResponse('Internal Error' , {status: 500})
    }
}

