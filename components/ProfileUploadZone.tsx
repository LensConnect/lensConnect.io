"use client";

import { useState } from "react";
// 1. Change your import to the direct nextjs helper package
import { UploadButton } from "@uploadthing/react"; 
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { saveProfileImage } from "@/app/actions/profile";

export function  ProfileUploadZone({ userId }: { userId: number }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="font-semibold text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
        Upload Profile Picture
      </h3>

      {/* 2. Pass your custom core router as a type parameter inside the component */}
      <UploadButton<OurFileRouter, "profileImage">
        endpoint="profileImage"
        content={{
          button({ ready, isUploading, uploadProgress }) {
            return (
              <div className="relative h-40 w-40 md:h-48 md:w-48 rounded-full border-4 border-background bg-secondary overflow-hidden shadow-2xl group cursor-pointer">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Profile Preview"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-secondary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-muted-foreground/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7h4l2-3h6l2 3h4v13H3V7zm9 11a4 4 0 100-8 4 4 0 000 8z"
                      />
                    </svg>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300 backdrop-blur-sm">
                  {isUploading ? (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white">
                      {uploadProgress ? `${uploadProgress}%` : "Uploading"}
                    </p>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                      {ready ? "Update Photo" : "Loading"}
                    </span>
                  )}
                </div>
              </div>
            );
          },
          allowedContent({ isUploading }) {
            return null;
          },
        }}
        appearance={{
          button:
            "p-0 bg-transparent border-0 outline-none ring-0 shadow-none hover:bg-transparent",
          container: "flex",
          allowedContent: "hidden",
        }}
        onClientUploadComplete={async (res) => {
          if (res && res.length > 0) {
            const uploadedUrl = res[0].url; // v7 returns an array of uploaded file objects
            setImageUrl(uploadedUrl);
            setIsSyncing(true);

            const dbResult = await saveProfileImage(userId, uploadedUrl);
            setIsSyncing(false);

            if (dbResult.success) {
              alert("Image saved to database successfully!");
            }
          }
        }}
        onUploadError={(error: Error) => {
          alert(`Upload failed: ${error.message}`);
        }}
      />

      {isSyncing && (
        <p className="text-xs text-amber-600">
          Saving link to database...
        </p>
      )}
    </div>
  );
}
