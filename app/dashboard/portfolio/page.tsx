"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Plus, Camera } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/header";

interface FormData {
  image_url: string[];
  title: string;
  location: string;
  description: string;
  category: string[];
}

interface FormErrors {
  image_url?: string[];
  title?: string;
  location?: string;
  description?: string;
}

const categories = [
  "Weddings",
  "Portraits",
  "Events",
  "Landscapes",
  "Wildlife",
  "Fashion",
  "Sports",
  "Travel",
  "Macro",
  "Street",
];

export default function PortfolioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    image_url: [],
    title: "",
    location: "",
    description: "",
    category: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  // Handle input changes
  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle category selection
  const toggleCategory = (category: string) => {
    setFormData((prev) =>
      prev.category.includes(category)
        ? { ...prev, category: prev.category.filter((c) => c !== category) }
        : { ...prev, category: [...prev.category, category] }
    );
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      image_url: prev.image_url.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (formData.image_url.length === 0) {
      newErrors.image_url = ["Please upload at least one image."];
    }
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload image(s) to Supabase
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageFiles(files);
    setUploading(true);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      alert("You must be logged in to upload images.");
      router.push("/login");
      return;
    }

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const fileName = `${authData.user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("photographer_portfolio")
        .upload(fileName, file);

      if (uploadError) {
        alert(`Upload failed: ${uploadError.message}`);
        continue;
      }

      const { data } = supabase.storage
        .from("photographer_portfolio")
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
    }

    setFormData((prev) => ({
      ...prev,
      image_url: [...prev.image_url, ...uploadedUrls],
    }));

    setUploading(false);
    alert("Image(s) uploaded successfully!");
  };

  // Submit to photographer_portfolio table
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      alert("You must be logged in to submit a portfolio.");
      return;
    }

    const { error } = await supabase.from("photographer_portfolio").insert([
      {
        photographer_id: authData.user.id,
        title: formData.title,
        location: formData.location,
        description: formData.description,
        category: formData.category,
        image_url: formData.image_url,
      },
    ]);

    if (error) {
      alert(`Error saving portfolio: ${error.message}`);
    } else {
      alert("Portfolio uploaded successfully!");
      router.push("/photographer/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Upload Your Work</h1>
          <Button asChild variant="outline">
            <Link href="/photographer/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle>Portfolio Upload Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label>Title</Label>
                <Input
                  name="title"
                  placeholder="E.g., Wedding Shoot"
                  value={formData.title}
                  onChange={handleOnChange}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <Label>Location</Label>
                <Input
                  name="location"
                  placeholder="E.g., Lagos, Nigeria"
                  value={formData.location}
                  onChange={handleOnChange}
                />
                {errors.location && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <Textarea
                  name="description"
                  placeholder="Describe your photoshoot or project..."
                  value={formData.description}
                  onChange={handleOnChange}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Category Selection */}
              <div>
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={
                        formData.category.includes(cat)
                          ? "default"
                          : "outline"
                      }
                      onClick={() => toggleCategory(cat)}
                      className="rounded-full"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <Label>Upload Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {uploading
                      ? "Uploading..."
                      : "Upload high-quality images of your work"}
                  </p>
                </div>

                {/* Preview */}
                {formData.image_url.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {formData.image_url.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-lg overflow-hidden border"
                      >
                        <img
                          src={img}
                          alt={`Portfolio ${idx}`}
                          className="object-cover w-full h-40"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          onClick={() => removeImage(idx)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full">
                Submit Portfolio
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
