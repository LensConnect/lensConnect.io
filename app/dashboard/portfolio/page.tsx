"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, X, MapPin, Tag, ImagePlus, ArrowLeft, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface FormData {
  imageUrl: string[];
  title: string;
  location: string;
  description: string;
  category: string[];
}

interface FormErrors {
  imageUrl?: string[];
  title?: string;
  location?: string;
  description?: string;
}

interface Portfolio {
  id: string;
  photographerId: string;
  title: string;
  description: string;
  location: string;
  category: string[];
  imageUrl: string[];
  created_at: string;
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
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    imageUrl: [],
    title: "",
    location: "",
    description: "",
    category: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activeIndex, setActiveIndex] = useState<{ [key: string]: number }>({});
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (item: Portfolio) => {
    setSelectedPortfolio(item);
    setLightboxIndex(activeIndex[item.id] || 0);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setSelectedPortfolio(null);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen || !selectedPortfolio) return;
      const total = selectedPortfolio.imageUrl.length;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % total);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i - 1 + total) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, selectedPortfolio]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleCategory = (cat: string) => {
    setFormData((prev) =>
      prev.category.includes(cat)
        ? { ...prev, category: prev.category.filter((c) => c !== cat) }
        : { ...prev, category: [...prev.category, cat] }
    );
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: prev.imageUrl.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (formData.imageUrl.length === 0)
      newErrors.imageUrl = ["Please upload at least one image."];
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 
 

 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!user) {
      toast.error("You must be logged in to create a portfolio.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/create_portfolios?photographerId=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photographerId: user.id,
          title: formData.title,
          location: formData.location,
          description: formData.description,
          category: formData.category,
          imageUrl: formData.imageUrl,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
      } else {
        toast.success(data.message);
        setFormData({ imageUrl: [], title: "", location: "", description: "", category: [] });
        
      }
    } catch {
      toast.error("Unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = (id: string, total: number) => {
    setActiveIndex((prev) => ({ ...prev, [id]: ((prev[id] ?? 0) + 1) % total }));
  };

  const handlePrev = (id: string, total: number) => {
    setActiveIndex((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) - 1 < 0 ? total - 1 : (prev[id] ?? 0) - 1,
    }));
  };



  const fetchPortfolio = async (userId: string) => {
    try {
      const response = await fetch(`/api/create_portfolios?photographerId=${userId}`, { method: "GET", headers: { "Content-Type": "application/json" } });
      const data = await response.json();
      if (response.ok && data.portfolios) {
        setPortfolios(data.portfolios);
      }
    } catch (error) {
      console.error("Error fetching portfolio", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPortfolio(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);
  
  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-white">
      <Header />

      {/* Hero banner */}
      <div className="relative overflow-hidden border-b border-gray-100 bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-10 blur-3xl"
          
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 right-0 h-[400px] w-[400px] rounded-full opacity-5 blur-3xl"
          
        />
        <div className="relative mx-auto max-w-[1300px] px-4 py-12">
          <Link
            href="/photographer/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#FF4F01] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl shadow-md"
              style={{ background: "linear-gradient(135deg, #FF4F01, #FF8C42)" }}
            >
              <ImagePlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Studio</h1>
              <p className="text-gray-400 text-sm mt-0.5">Showcase your finest work to the world</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1300px] px-4 py-10 space-y-16">

        {/* ── Upload Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
              {/* Form header */}
              <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2 bg-orange-50">
                <Sparkles className="h-4 w-4 text-[#FF4F01]" />
                <span className="text-sm font-semibold text-[#FF4F01] uppercase tracking-widest">
                  New Portfolio Entry
                </span>
              </div>

              <div className="p-8 space-y-8">

                {/* ── Image Upload Zone ── */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                    Images
                  </label>

                  <div
                    className={`relative rounded-xl border-2 border-dashed transition-colors overflow-hidden ${
                      errors.imageUrl
                        ? "border-red-400 bg-red-50"
                        : "border-orange-200 hover:border-[#FF4F01] bg-orange-50/40"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                      <div
                        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                        style={{ background: "rgba(255,79,1,0.1)" }}
                      >
                        <ImagePlus className="h-8 w-8 text-[#FF4F01]" />
                      </div>

                      <p className="text-gray-800 font-semibold mb-1">Drop your shots here</p>
                      <p className="text-gray-400 text-sm mb-5">
                        Up to 10 images · Max 8 MB each · JPG, PNG, WEBP
                      </p>

                      <UploadButton<OurFileRouter, "portfolioImages">
                        endpoint="portfolioImages"
                        appearance={{
                          button:
                            "ut-ready:bg-[#FF4F01] ut-uploading:bg-[#FF4F01]/70 after:bg-[FF4F01] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all hover:brightness-110 shadow-md shadow-[#FF4F01]/20",
                          allowedContent: "hidden",
                          container: "flex flex-col items-center gap-2",
                        }}
                        content={{
                          button({ ready, isUploading, uploadProgress }) {
                            if (isUploading)
                              return (
                                <span className="flex items-center gap-2">
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                  </svg>
                                  {uploadProgress ? `${uploadProgress}%` : "Uploading\u2026"}
                                </span>
                              );
                            return ready ? "Choose Photos" : "Loading\u2026";
                          },
                        }}
                        onClientUploadComplete={(res) => {
                          if (res && res.length > 0) {
                            const urls = res.map((r) => r.ufsUrl);
                            setFormData((prev) => ({
                              ...prev,
                              imageUrl: [...prev.imageUrl, ...urls],
                            }));
                            setErrors((prev) => ({ ...prev, imageUrl: undefined }));
                            toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded!`);
                          }
                        }}
                        onUploadError={(err) => {
                          toast.error(`Upload failed: ${err.message}`);
                        }}
                      />
                    </div>
                  </div>

                  {errors.imageUrl && (
                    <p className="text-red-500 text-xs mt-1">{errors.imageUrl[0]}</p>
                  )}

                  {/* Preview grid */}
                  <AnimatePresence>
                    {formData.imageUrl.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3"
                      >
                        {formData.imageUrl.map((img, idx) => (
                          <motion.div
                            key={img}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2, delay: idx * 0.04 }}
                            className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200"
                          >
                            <img
                              src={img}
                              alt={`Preview ${idx + 1}`}
                              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 hover:bg-red-600 hover:scale-110"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Text Fields ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                      Title
                    </label>
                    <input
                      name="title"
                      placeholder="E.g., Twilight Wedding in Lagos"
                      value={formData.title}
                      onChange={handleChange}
                      className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all focus:ring-2 focus:ring-[#FF4F01]/30 ${
                        errors.title ? "border-red-400" : "border-gray-200 focus:border-[#FF4F01]"
                      }`}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                      <input
                        name="location"
                        placeholder="E.g., Lagos, Nigeria"
                        value={formData.location}
                        onChange={handleChange}
                        className={`w-full rounded-xl border bg-white pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all focus:ring-2 focus:ring-[#FF4F01]/30 ${
                          errors.location ? "border-red-400" : "border-gray-200 focus:border-[#FF4F01]"
                        }`}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-red-500 text-xs">{errors.location}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Tell the story behind this shoot\u2026"
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all resize-none focus:ring-2 focus:ring-[#FF4F01]/30 ${
                      errors.description ? "border-red-400" : "border-gray-200 focus:border-[#FF4F01]"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs">{errors.description}</p>
                  )}
                </div>

                {/* ── Categories ── */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                    <Tag className="inline h-3 w-3 mr-1 -mt-0.5" />
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const active = formData.category.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                            active
                              ? "border-[#FF4F01] bg-[#FF4F01] text-white shadow-md shadow-[#FF4F01]/20"
                              : "border-gray-200 bg-white text-gray-500 hover:border-[#FF4F01] hover:text-[#FF4F01]"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Submit ── */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.99]"
                    style={{
                      background: "linear-gradient(135deg, #FF4F01, #FF8C42)",
                      boxShadow: "0 6px 24px rgba(255,79,1,0.25)",
                    }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Publishing\u2026
                      </span>
                    ) : (
                      "Publish Portfolio"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* ── Portfolio Grid ── */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Your Work</h2>
            {!loading && portfolios.length > 0 && (
              <span
                className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold text-[#FF4F01]"
                style={{ background: "rgba(255,79,1,0.1)" }}
              >
                {portfolios.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm"
                >
                  <Skeleton className="h-52 w-full bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-gray-100" />
                    <Skeleton className="h-3 w-1/2 bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-orange-50/40 py-20 text-center">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: "rgba(255,79,1,0.1)" }}
              >
                <ImagePlus className="h-7 w-7 text-[#FF4F01]" />
              </div>
              <p className="text-gray-400 text-sm">No portfolios yet. Upload your first one above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {portfolios.map((item) => {
                const currentIndex = activeIndex[item.id] || 0;
                const total = item.imageUrl.length;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => openLightbox(item)}
                    className="group relative rounded-2xl overflow-hidden border border-gray-100 hover:border-[#FF4F01]/40 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-[#FF4F01]/10 cursor-pointer"
                  >
                    {/* Image with hover overlay */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100" onClick={() => { setIsOpen(true); setActiveIndex(prev => ({ ...prev, [item.id]: currentIndex })); }}>
                      <Image
                        src={item.imageUrl[currentIndex]}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Hover overlay with details */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
                        <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-500 space-y-2">
                          <h3 className="font-bold text-white text-base leading-snug line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-white/80 text-xs line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="flex items-center gap-1 text-[11px] text-white/90">
                              <MapPin className="h-3 w-3" />
                              {item.location}
                            </span>
                            {item.category && item.category.length > 0 && (
                              <span className="text-[10px] text-[#FF4F01] font-semibold bg-white/95 rounded-full px-2 py-0.5">
                                {Array.isArray(item.category)
                                  ? item.category[0]
                                  : item.category}
                                {Array.isArray(item.category) && item.category.length > 1
                                  ? ` +${item.category.length - 1}`
                                  : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Navigation arrows */}
                      {total > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrev(item.id, total);
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#FF4F01] hover:text-white shadow z-10"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNext(item.id, total);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#FF4F01] hover:text-white shadow z-10"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>

                          {/* Dot indicators */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                            {item.imageUrl.map((_, i) => (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveIndex((prev) => ({ ...prev, [item.id]: i }));
                                }}
                                className="h-1.5 rounded-full transition-all duration-200"
                                style={{
                                  width: i === currentIndex ? "20px" : "6px",
                                  background:
                                    i === currentIndex ? "#FF4F01" : "rgba(255,255,255,0.6)",
                                }}
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {/* Image count badge */}
                      {total > 1 && (
                        <div className="absolute top-2 right-2 rounded-full bg-white/80 backdrop-blur-sm px-2 py-0.5 text-xs text-gray-700 font-medium shadow-sm z-10">
                          {currentIndex + 1}/{total}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Lightbox Modal */}
              <AnimatePresence>
                {isOpen && selectedPortfolio && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    onClick={closeLightbox}
                    className="fixed inset-0 z-50 bg-white overflow-y-auto"
                  >
                    <motion.div
                      initial={{ scale: 0.96, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.96, opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      onClick={(e) => e.stopPropagation()}
                      className="relative w-full min-h-screen bg-white"
                    >
                      {/* Close button */}
                      <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 flex items-center justify-center shadow-lg border border-gray-200 hover:bg-[#FF4F01] hover:text-white transition-all duration-200"
                      >
                        <X className="h-5 w-5" />
                      </button>

                      {/* Details panel */}
                      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-16 pb-8 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                            {selectedPortfolio.title}
                          </h2>
                          <span
                            className="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FF4F01]"
                            style={{ background: "rgba(255,79,1,0.1)" }}
                          >
                            Portfolio
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-[#FF4F01]" />
                          <span className="font-medium">{selectedPortfolio.location}</span>
                        </div>

                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                          {selectedPortfolio.description}
                        </p>

                        {selectedPortfolio.category &&
                          selectedPortfolio.category.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {selectedPortfolio.category.map((cat) => (
                                <span
                                  key={cat}
                                  className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-[#FF4F01] uppercase tracking-wide"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>

                      {/* Image slider */}
                      {selectedPortfolio.imageUrl.length > 1 && (
                        <div className="bg-white border-t border-gray-100">
                          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                  Gallery
                                </span>
                                <span className="text-xs text-gray-400">
                                  {lightboxIndex + 1} of {selectedPortfolio.imageUrl.length}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    setLightboxIndex(
                                      (i) =>
                                        (i - 1 + selectedPortfolio.imageUrl.length) %
                                        selectedPortfolio.imageUrl.length
                                    )
                                  }
                                  className="h-9 w-9 rounded-full bg-white text-gray-700 flex items-center justify-center border border-gray-200 shadow-sm hover:bg-[#FF4F01] hover:text-white hover:border-[#FF4F01] transition-all"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setLightboxIndex(
                                      (i) => (i + 1) % selectedPortfolio.imageUrl.length
                                    )
                                  }
                                  className="h-9 w-9 rounded-full bg-white text-gray-700 flex items-center justify-center border border-gray-200 shadow-sm hover:bg-[#FF4F01] hover:text-white hover:border-[#FF4F01] transition-all"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Thumbnail rail */}
                            <div className="relative">
                              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                                {selectedPortfolio.imageUrl.map((url, i) => {
                                  const active = i === lightboxIndex;
                                  return (
                                    <button
                                      key={i}
                                      onClick={() => setLightboxIndex(i)}
                                      className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                        active
                                          ? "border-[#FF4F01] shadow-md shadow-[#FF4F01]/20 scale-95"
                                          : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-200"
                                      }`}
                                    >
                                      <Image
                                        src={url}
                                        alt={`Thumbnail ${i + 1}`}
                                        fill
                                        className="object-cover"
                                      />
                                      {active && (
                                        <div className="absolute inset-0 bg-[#FF4F01]/10" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image area */}
                      <div className="relative w-full bg-gray-50">
                        <div className="relative w-full aspect-[16/9] max-h-[80vh]">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={selectedPortfolio.imageUrl[lightboxIndex]}
                              initial={{ opacity: 0, x: 40 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -40 }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                              drag="x"
                              dragConstraints={{ left: 0, right: 0 }}
                              dragElastic={0.2}
                              onDragEnd={(_, info) => {
                                if (info.offset.x > 100) {
                                  setLightboxIndex(
                                    (i) =>
                                      (i - 1 + selectedPortfolio.imageUrl.length) %
                                      selectedPortfolio.imageUrl.length
                                  );
                                } else if (info.offset.x < -100) {
                                  setLightboxIndex(
                                    (i) => (i + 1) % selectedPortfolio.imageUrl.length
                                  );
                                }
                              }}
                              className="absolute inset-0 cursor-grab active:cursor-grabbing"
                            >
                              <Image
                                src={selectedPortfolio.imageUrl[lightboxIndex]}
                                alt={selectedPortfolio.title}
                                fill
                                className="object-contain pointer-events-none"
                                draggable={false}
                              />
                            </motion.div>
                          </AnimatePresence>

                          {/* Image counter */}
                          <div className="absolute top-4 left-4 rounded-full bg-black/70 backdrop-blur-sm px-3 py-1 text-xs text-white font-medium">
                            {lightboxIndex + 1} / {selectedPortfolio.imageUrl.length}
                          </div>

                          {/* Large nav arrows */}
                          {selectedPortfolio.imageUrl.length > 1 && (
                            <>
                              <button
                                onClick={() =>
                                  setLightboxIndex(
                                    (i) =>
                                      (i - 1 + selectedPortfolio.imageUrl.length) %
                                      selectedPortfolio.imageUrl.length
                                  )
                                }
                                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm text-gray-800 flex items-center justify-center shadow-lg border border-gray-200 hover:bg-[#FF4F01] hover:text-white hover:border-[#FF4F01] transition-all"
                              >
                                <ChevronLeft className="h-6 w-6" />
                              </button>
                              <button
                                onClick={() =>
                                  setLightboxIndex(
                                    (i) => (i + 1) % selectedPortfolio.imageUrl.length
                                  )
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm text-gray-800 flex items-center justify-center shadow-lg border border-gray-200 hover:bg-[#FF4F01] hover:text-white hover:border-[#FF4F01] transition-all"
                              >
                                <ChevronRight className="h-6 w-6" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


  





