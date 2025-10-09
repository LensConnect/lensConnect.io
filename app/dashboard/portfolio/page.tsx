"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, Plus } from "lucide-react"
import { mockPhotographers } from "@/lib/mock-data"
import Link from "next/link"

export default function PortfolioPage() {
 
  const router = useRouter()
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])

  

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // In a real app, upload to storage and get URLs
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setPortfolioImages([...portfolioImages, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Portfolio Manager</h1>
            <p className="text-muted-foreground">Showcase your best work to attract clients</p>
          </div>
          <Button variant="outline" asChild className="bg-transparent">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Click to upload images</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Tip: Upload high-quality images that showcase your best work. Aim for 6-12 images that represent your
                style and specialties.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Your Portfolio ({portfolioImages.length} images)</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioImages.map((image, index) => (
                  <div key={index} className="relative group aspect-[4/3] overflow-hidden rounded-lg">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="destructive" onClick={() => removeImage(index)} className="gap-2">
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Label
                  htmlFor="add-more"
                  className="aspect-[4/3] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors"
                >
                  <Plus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Add more</span>
                  <Input
                    id="add-more"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </Label>
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No portfolio images yet. Upload your first image to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
