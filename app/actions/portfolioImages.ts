"use server";
import {db} from '@/app/src'
import {sql} from 'drizzle-orm'
import { success } from 'zod';

export async function uploadUrl(imageUrl: string, photographerId:string){

try{
if (!photographerId){
    return{
        message: "Photographer ID is required",
        success: false,
     
    }
}

const numsId = Number(photographerId)

const [rows] = await db.execute(sql`SELECT photographerId FROM photographer_portfolios WHERE photographerId = ${numsId}`)
if(!rows){
 return{
    message:"Photographer profile not found",
    success:false
 }  
} else{
    await db.execute(sql`INSERT INTO photographer_portfolios (photographerId, imageUrl) VALUES (${numsId}, ${imageUrl})`)
   
} 

await db.execute(sql`UPDATE photographer_profiles SET portfolio_image_url = ${imageUrl} WHERE id = ${numsId}`)

return {
    success: true,
    message: "Portfolio image uploaded successfully"
}




} catch (error){
    console.error(error)
    return {
        success: false,
        message: "Failed to upload portfolio image"
    }
}

}
