import {NextResponse, NextRequest} from 'next/server'
import {db} from '@/app/src'
import {profiles} from '@/app/src/db/schema'

export async function POST(req:NextRequest) {

    
try{
const body = await req.json()

    const{id, userId, phoneNumber, imageUrl, bio, website, location, updatedAt} = body

    const result = await db.insert(profiles).values({...body,updatedAt:body.updatedAt.split('T')[0]})
    
    return NextResponse.json({
        message:"Profile created successfully",
        result
    })

}catch(error){

    return NextResponse.json({
        error:"Profile creation failed"
    })
}

}