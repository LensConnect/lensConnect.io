"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {ProfileUploadZone} from "@/components/ProfileUploadZone";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
    Camera,
    MapPin,
    Mail,
    Phone,
    Globe,
    Briefcase,
    ExternalLink,
    Award,
    Save,
    Loader2,
    Image as ImageIcon,
    ArrowLeft,
    Sparkles,
    User as UserIcon,
    CheckCircle2,
} from "lucide-react";

import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";



type UserRole = "photographer" | "client";

interface ProfileData {
    id: number;
    fullname: string;
    email: string;
    role: UserRole;
    userId:number;

    phoneNumber: string;
    bio: string;
    location: string;

    hourlyRate?: number;
    experience?: number;

    specialties?: string[];

    portfolio_url?: string;

    profile_image_url?: string;

    website?: string;

    initialData?:{
    id: string;
    userId: string;
    fullname: string;
    role: "client" | "photographer";
    bio: string;
    location: string;
    hourly_rate?: number; // Optional: Only for photographers
    experience?: number;  
    }
}

interface PortfolioItem {
    id: number;
    title: string;
    description?: string;
    image_url: string[];
}




const AVAILABLE_SPECIALTIES = [
    "Wedding",
    "Portrait",
    "Event",
    "Nature",
    "Fashion",
    "Sports",
    "Travel",
    "Product",
    "Studio",
    "Commercial",
    "Editorial",
    "Architecture",
];






export default function ProfilePage() {
    const router = useRouter();

    const [profile, setProfile] = useState<ProfileData | null>(null);

    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [apiMessage, setApiMessage] = useState<{ text: string; success: boolean } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        user,
        isLoading: authLoading,
    } = useAuth();


   
    const {
        isLoading: profileLoading,
        error: profileError,
        data: profileData,
    } = useQuery<ProfileData | null>({
        queryKey: ["profile", user?.id],

        enabled: !!user?.id && !authLoading,

        queryFn: async () => {
            if (!user?.id) {
                return null;
            }

            const response = await fetch(
                `/api/profiles?userId=${user.id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                  
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                throw new Error(
                    errorData?.error ||
                    "Failed to fetch profile data"
                );
            }

            const data = await response.json();

            console.log("FULL API RESPONSE:", data);
            console.log("PROFILE RESULT:", data.result);

            return data.result ?? null;
        },

        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (profileData) {
            setProfile(profileData);
        }
    }, [profileData]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [authLoading, user, router]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        let processedValue: string | number = value;

        if (
            name === "hourly_rate" ||
            name === "experience"
        ) {
            processedValue = value === ""
                ? 0
                : Number(value);
        }

        setProfile((prev) => {
            if (!prev) return null;

            return {
                ...prev,
                [name]: processedValue,
            };
        });
    };


    const toggleSpecialty = (specialty: string) => {
        setProfile((prev) => {
            if (!prev) return null;

            const currentSpecialties =
                prev.specialties || [];

            const updatedSpecialties =
                currentSpecialties.includes(specialty)
                    ? currentSpecialties.filter(
                        (item) => item !== specialty
                    )
                    : [
                        ...currentSpecialties,
                        specialty,
                    ];

            return {
                ...prev,
                specialties: updatedSpecialties,
            };
        });
    };


   

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file || !profile) {
            return;
        }

        try {
            setUploading(true);

            const filePath =
                `${profile.id}/${Date.now()}_${file.name}`;


            // Upload image
            const {
                error: uploadError,
            } = await supabase.storage
                .from("profile_image")
                .upload(
                    filePath,
                    file,
                    {
                        upsert: true,
                    }
                );

            if (uploadError) {
                throw uploadError;
            }


            // Get public URL
            const {
                data: publicUrlData,
            } = supabase.storage
                .from("profile_image")
                .getPublicUrl(filePath);

            const publicUrl =
                publicUrlData.publicUrl;


            // Update local state immediately
            setProfile((prev) => {
                if (!prev) return null;

                return {
                    ...prev,
                    profile_image_url: publicUrl,
                };
            });


            // IMPORTANT:
            // Your API reads p?.imageUrl.
            // Therefore we update imageUrl here.
            const {
                error: profileUpdateError,
            } = await supabase
                .from("profiles")
                .update({
                    imageUrl: publicUrl,
                })
                .eq("id", profile.id);


            if (profileUpdateError) {
                throw profileUpdateError;
            }


            toast.success(
                "Profile photo updated"
            );

        } catch (error) {
            console.error(
                "Error uploading image:",
                error
            );

            toast.error(
                "Failed to upload image."
            );

        } finally {
            setUploading(false);

            // Allow selecting the same image again
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };


  
    const handleSave = async () => {
        if (!profile) {
            return;
        }

        const payload: Record<string, any> = {
      userId: profile.id,
      fullname: profile.fullname,
      bio: profile.bio,
      location: profile.location,
      phoneNumber: profile.phoneNumber,
    };


    if(profile.role === 'photographer'){
      payload.hourlyRate = profile.hourlyRate;
      payload.experience = profile.experience;
      payload.specialties = profile.specialties;
      payload.profile_image_url = profile.profile_image_url;
      payload.bio = profile.bio;
      payload.availability = true;
    }

    if(profile.role === 'client'){
      payload.imageUrl = profile.profile_image_url;
      payload.website = profile.website || '';
    }


        try {
            setSaving(true);

            /*
             * Only update fields that belong to
             * the profiles table.
             *
             * Do NOT send the entire flattened
             * API response into profiles because
             * fields like hourly_rate and
             * experience may belong to
             * photographer_profiles.
             */

            /* const {
                error,
            } = await supabase
                .from("profiles")
                .update({
                    phoneNumber: profile.phoneNumber,
                    bio: profile.bio,
                    location: profile.location,
                    website: profile.website,
                    imageUrl:
                        profile.profile_image_url,
                })
                .eq("id", profile.id);


            if (error) {
                throw error;
            }


            


            
 */

         

            const response = await fetch(`/api/profiles?userId=${user?.id}`, {method:'PATCH', headers:{'Content-Type': 'application/json' }, body:JSON.stringify(payload)})

            const data = await response.json();
           
            if(response.ok && data.success){
                setApiMessage({text:'Profile updated successfully', success:true})
            }
            else{
                setApiMessage({text: data.error || 'Profile updated failed', success:false})
            }

           setTimeout(() => {
            setApiMessage(null)
           }, 3000);
        } catch (error: any) {
            console.error(
                "Error saving profile:",
                error
            );
            setApiMessage({text:'Profile updated failed', success:false});

        } finally {
            setSaving(false);
            
        }
    };

    if (profileError) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-6">

                <h2 className="text-xl font-bold">
                    Failed to load profile
                </h2>

                <p className="text-sm text-muted-foreground text-center">
                    {profileError instanceof Error
                        ? profileError.message
                        : "Something went wrong while loading your profile."
                    }
                </p>

                <Button
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </Button>

            </div>
        );
    }


  

    if (!profile) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">

                <h2 className="text-xl font-bold">
                    Profile not found
                </h2>

                <p className="text-sm text-muted-foreground">
                    We couldn't find a profile for this account.
                </p>

            </div>
        );
    }
    const displayName =
        profile.fullname ||
        "Account Settings";


    const isPhotographer =
        profile.role === "photographer";


    

    return (
        <div className="w-full min-h-screen overflow-x-hidden bg-white text-gray-900">

            <Header />

            {/* Hero banner */}
            <div className="relative overflow-hidden border-b border-gray-100 bg-white">
                <div className="relative mx-auto max-w-[1300px] px-4 py-10">
                    <Link
                        href={isPhotographer ? "/dashboard" : "/dashboard/client"}
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
                            <UserIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
                            <p className="text-gray-400 text-sm mt-0.5">
                                Manage how clients and collaborators see you
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* API message toast */}
            {apiMessage && (
                <div className="mx-auto max-w-[1300px] px-4 mt-6">
                    <div
                        className={`p-3 rounded-xl text-sm text-center font-semibold border ${
                            apiMessage.success
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                        }`}
                    >
                        {apiMessage.text}
                    </div>
                </div>
            )}

            <div className="mx-auto w-full max-w-[1300px] px-4 py-10 space-y-10">

                {/* ── Profile Card ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm"
                >
                    <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2 bg-orange-50">
                        <Sparkles className="h-4 w-4 text-[#FF4F01]" />
                        <span className="text-sm font-semibold text-[#FF4F01] uppercase tracking-widest">
                            Account Overview
                        </span>
                    </div>

                    <div className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div
                                className="relative h-36 w-36 md:h-44 md:w-44 rounded-full p-[3px] shadow-lg"
                                style={{ background: "linear-gradient(135deg, #FF4F01, #FF8C42)" }}
                            >
                                <div className="relative h-full w-full rounded-full overflow-hidden bg-gray-100">
                                    {profile.profile_image_url ? (
                                        <img
                                            src={profile.profile_image_url}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            alt={displayName}
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <Camera className="h-10 w-10 text-gray-300" />
                                        </div>
                                    )}

                                    <div
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-300 backdrop-blur-sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {uploading ? (
                                            <Loader2 className="h-5 w-5 text-white animate-spin mb-1.5" />
                                        ) : (
                                            <Camera className="h-5 w-5 text-white mb-1.5" />
                                        )}
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                                            {uploading ? "Uploading" : "Update Photo"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>

                        {/* Name + actions */}
                        <div className="flex-1 w-full text-center md:text-left space-y-5">
                            {isPhotographer && (
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FF4F01]"
                                    style={{ background: "rgba(255,79,1,0.1)" }}
                                >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified Creator
                                </span>
                            )}

                            <div className="space-y-2">
                                <Input
                                    name="fullname"
                                    value={profile.fullname || ""}
                                    onChange={handleChange}
                                    className="text-3xl md:text-4xl font-bold tracking-tight p-0 border-0 bg-transparent placeholder:text-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto text-center md:text-left"
                                    placeholder="Your Name"
                                />
                                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 capitalize">
                                    <Award className="h-4 w-4 text-[#FF4F01]" />
                                    {profile.role}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="relative overflow-hidden rounded-xl px-8 py-3 text-sm font-bold text-white uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.99]"
                                    style={{
                                        background: "linear-gradient(135deg, #FF4F01, #FF8C42)",
                                        boxShadow: "0 6px 24px rgba(255,79,1,0.25)",
                                    }}
                                >
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            Save Settings
                                        </span>
                                    )}
                                </button>

                                {isPhotographer && (
                                    <Link
                                        href={`/photographer/${encodeURIComponent(profile.fullname)}/${profile.id}`}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-8 py-3 text-sm font-bold text-gray-700 uppercase tracking-widest hover:border-[#FF4F01] hover:text-[#FF4F01] transition-all"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        View Public Profile
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <ProfileUploadZone userId={profile.id} />
                </motion.div>

                {/* ── Contact Details ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm"
                >
                    <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2 bg-orange-50">
                        <Mail className="h-4 w-4 text-[#FF4F01]" />
                        <span className="text-sm font-semibold text-[#FF4F01] uppercase tracking-widest">
                            Contact Details
                        </span>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <Label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                                Email Address
                            </Label>
                            <Input
                                name="email"
                                disabled
                                value={profile.email || ""}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                                Phone Number
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                                <Input
                                    name="phone"
                                    value={profile.phoneNumber || ""}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all focus:border-[#FF4F01] focus:ring-2 focus:ring-[#FF4F01]/30"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <Label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                                Location
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                                <Input
                                    name="location"
                                    value={profile.location || ""}
                                    onChange={handleChange}
                                    placeholder="City, State, Country"
                                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all focus:border-[#FF4F01] focus:ring-2 focus:ring-[#FF4F01]/30"
                                />
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* ── Photographer Section ── */}
                {isPhotographer && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm"
                    >
                        <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-2 bg-orange-50">
                            <Briefcase className="h-4 w-4 text-[#FF4F01]" />
                            <span className="text-sm font-semibold text-[#FF4F01] uppercase tracking-widest">
                                Professional Overview
                            </span>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                                        Hourly Rate ($)
                                    </Label>
                                    <Input
                                        name="hourlyRate"
                                        type="number"
                                        value={profile.hourlyRate || ""}
                                        onChange={handleChange}
                                        placeholder="150"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all focus:border-[#FF4F01] focus:ring-2 focus:ring-[#FF4F01]/30"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                                        Years Experience
                                    </Label>
                                    <Input
                                        name="experience"
                                        type="number"
                                        value={profile.experience || ""}
                                        onChange={handleChange}
                                        placeholder="5"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all focus:border-[#FF4F01] focus:ring-2 focus:ring-[#FF4F01]/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                                    Biography & Creative Vision
                                </Label>
                                <Textarea
                                    name="bio"
                                    value={profile.bio || ""}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Describe your style, vision, and what makes your work unique..."
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all resize-none focus:border-[#FF4F01] focus:ring-2 focus:ring-[#FF4F01]/30"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                                    Creative Specialties
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_SPECIALTIES.map((specialty) => {
                                        const isSelected =
                                            profile.specialties?.includes(specialty);
                                        return (
                                            <button
                                                key={specialty}
                                                type="button"
                                                onClick={() => toggleSpecialty(specialty)}
                                                className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                                                    isSelected
                                                        ? "border-[#FF4F01] bg-[#FF4F01] text-white shadow-md shadow-[#FF4F01]/20"
                                                        : "border-gray-200 bg-white text-gray-500 hover:border-[#FF4F01] hover:text-[#FF4F01]"
                                                }`}
                                            >
                                                {specialty}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                                    External Portfolio Link
                                </Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                                    <Input
                                        name="portfolio_url"
                                        value={profile.portfolio_url || ""}
                                        onChange={handleChange}
                                        placeholder="https://your-portfolio.com"
                                        className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all focus:border-[#FF4F01] focus:ring-2 focus:ring-[#FF4F01]/30"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* ── Selected Works ── */}
                {isPhotographer && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm"
                    >
                        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between gap-2 bg-orange-50">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-[#FF4F01]" />
                                <span className="text-sm font-semibold text-[#FF4F01] uppercase tracking-widest">
                                    Selected Works
                                </span>
                            </div>
                            <Link
                                href="/dashboard/portfolio"
                                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#FF4F01] hover:underline"
                            >
                                Manage Portfolio →
                            </Link>
                        </div>

                        <div className="p-8">
                            {portfolio.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {portfolio.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group relative aspect-[4/5] rounded-xl overflow-hidden border border-gray-100 hover:border-[#FF4F01]/40 transition-all hover:shadow-lg"
                                        >
                                            <img
                                                src={item.image_url?.[0]}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <h4 className="text-base font-bold text-white line-clamp-1">
                                                    {item.title}
                                                </h4>
                                                <p className="text-xs text-white/70 line-clamp-1 mt-1">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    <Link
                                        href="/dashboard/portfolio"
                                        className="group aspect-[4/5] rounded-xl border-2 border-dashed border-orange-200 flex flex-col items-center justify-center gap-3 hover:border-[#FF4F01] hover:bg-orange-50/40 transition-all cursor-pointer"
                                    >
                                        <div
                                            className="h-12 w-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                                            style={{ background: "rgba(255,79,1,0.1)" }}
                                        >
                                            <Camera className="h-5 w-5 text-[#FF4F01]" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4F01]">
                                            Add New Work
                                        </span>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/40 py-16 text-center">
                                    <div
                                        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                                        style={{ background: "rgba(255,79,1,0.1)" }}
                                    >
                                        <Camera className="h-7 w-7 text-[#FF4F01]" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">Empty Gallery</h4>
                                    <p className="text-sm text-gray-400 mt-2 mb-6 max-w-sm">
                                        Your portfolio is the most critical part of your profile. Start building it now to attract clients.
                                    </p>
                                    <Link
                                        href="/dashboard/portfolio"
                                        className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white uppercase tracking-widest transition-all hover:brightness-110"
                                        style={{
                                            background: "linear-gradient(135deg, #FF4F01, #FF8C42)",
                                            boxShadow: "0 6px 24px rgba(255,79,1,0.25)",
                                        }}
                                    >
                                        Upload First Collection
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.section>
                )}
            </div>
        </div>
    );
}