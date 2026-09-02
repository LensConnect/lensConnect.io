import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      console.log("File uploaded successfully to Uploadthing:", file.url);
      return { uploadedUrl: file.ufsUrl };
    }),
  portfolioImages: f({ image: { maxFileSize: "8MB", maxFileCount: 10 } })
    .onUploadComplete(async ({ file }) => {
      console.log("Portfolio image uploaded to Uploadthing:", file.url);
      return { uploadedUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
