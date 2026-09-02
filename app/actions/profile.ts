"use server";
import { db } from "@/app/src";
import { sql } from "drizzle-orm";
export async function saveProfileImage(userId: number, profile_image_url: string) {
  try {
    if (!userId || !profile_image_url) {
      return { success: false, error: "User ID and image URL are required" };
    }
    const numUserId = Number(userId);
   
    const [profileRows] = await db.execute(sql`
      SELECT userId FROM profiles WHERE userId = ${numUserId}
    `);
    if (Array.isArray(profileRows) && profileRows.length > 0) {
      await db.execute(sql`
        UPDATE profiles 
        SET profile_image_url = ${profile_image_url}, imageUrl = ${profile_image_url} 
        WHERE userId = ${numUserId}
      `);
    } else {
      await db.execute(sql`
        INSERT INTO profiles (userId, profile_image_url) 
        VALUES (${numUserId}, ${profile_image_url})
      `);
    }
    
    await db.execute(sql`
      UPDATE photographer_profiles 
      SET profile_image_url = ${profile_image_url} 
      WHERE userId = ${numUserId}
    `);
    return { success: true, url: profile_image_url };
  } catch (error: any) {
    console.error("Error saving profile image:", error);
    return { success: false, error: error?.message || "Failed to save profile image" };
  }
}
