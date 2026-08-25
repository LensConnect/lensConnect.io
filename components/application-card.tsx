"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Star,
  MapPin,
  DollarSign,
  MessageSquare,
  Check,
  X,
  Clock,
  ChevronRight,
  Briefcase,
  User,
} from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ApplicationCardProps {
  application: {
    id: string
    message: string
    bidAmount?: number
    status: "pending" | "accepted" | "rejected"
    created_at: Date | string
    photographer: {
      id: string
      fullname: string
      hourlyRate: number
      specialties: string[]
      bio: string
      location?: string
    }
  }
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { photographer, bidAmount, message, created_at, status } = application

  const accepted = status === "accepted"
  const rejected = status === "rejected"

  const router = useRouter()

  async function updateJobStatus() {

    const response = await fetch(`/api/get_applications_profiles?jobId=${application.id}`, {method:'PATCH', headers:{'Content-Type': 'application/json'},body:JSON.stringify({status:'accepted'}),})

    if(!response.ok){
      throw new Error('Failed to update job status')
    }

    const data = await response.json()
    router.refresh()
    return data

  }

  async function updateJobStatusRejected() {
    const response = await fetch('http://localhost:3000/api/get_applications_profiles', {method:'PATCH', headers:{'Content-Type': 'application/json'},body:JSON.stringify({jobId:application.id,status:'rejected'}),})

    if(!response.ok) throw  Error

    const data = await response.json()
    router.refresh()
    return data
  }

  const statusColor =
    accepted
      ? "bg-green-500/10 text-green-600 border-green-500/20"
      : rejected
      ? "bg-destructive/10 text-destructive border-destructive/20"
      : "bg-primary/10 text-primary border-primary/20"

  return (
    <Sheet>
      {/* ─── TRIGGER: Clean scannable summary card ─── */}
      <SheetTrigger asChild>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="group cursor-pointer"
        >
          <div className="relative rounded-[1.5rem] border border-border/40 bg-background/60 backdrop-blur-sm px-6 py-5 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:bg-background">
            {/* Left accent bar */}
            <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-primary via-primary/40 to-transparent" />

            <div className="flex items-center gap-5">
              {/* Avatar */}
              <Avatar className="h-14 w-14 shrink-0 border-2 border-primary/20 bg-secondary/30">
                <AvatarFallback className="font-black text-xl text-primary bg-primary/10">
                  {photographer.fullname.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Name + location + specialties */}
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-base tracking-tight group-hover:text-primary transition-colors truncate">
                  {photographer.fullname}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mt-0.5 truncate">
                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                  {photographer.location || "Available Worldwide"}
                </div>
                {photographer.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {photographer.specialties.slice(0, 3).map((s, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="px-1.5 py-0 text-[8px] font-black uppercase tracking-tighter"
                      >
                        {s}
                      </Badge>
                    ))}
                    {photographer.specialties.length > 3 && (
                      <Badge variant="outline" className="px-1.5 py-0 text-[8px] font-black">
                        +{photographer.specialties.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Bid + status */}
              <div className="text-right shrink-0 space-y-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bid</p>
                  <p className="text-2xl font-black text-foreground tracking-tight">
                    ₦{bidAmount?.toLocaleString() ?? "N/A"}
                  </p>
                </div>
                <Badge className={`text-[9px] font-black uppercase tracking-widest border ${statusColor}`}>
                  {status}
                </Badge>
              </div>

              {/* Chevron hint */}
              <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </div>
        </motion.div>
      </SheetTrigger>

      {/* ─── CONTENT: Full profile + proposal slide-over ─── */}
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg flex flex-col p-0 gap-0 border-l border-border/50"
      >
        {/* Header hero */}
        <div className="relative bg-gradient-to-br from-primary/10 via-background to-background border-b border-border/40 p-8 pb-6">
          <div className="absolute inset-0 opacity-5 overflow-hidden">
            <User className="absolute -right-8 -top-8 h-48 w-48 text-primary rotate-12" />
          </div>
          <div className="relative flex items-start gap-5">
            <Avatar className="h-20 w-20 border-4 border-background shadow-xl shrink-0">
              <AvatarFallback className="font-black text-3xl text-primary bg-primary/10">
                {photographer.fullname.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-2xl font-black tracking-tight leading-tight">{photographer.fullname}</h2>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-semibold mt-1">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                {photographer.location || "Available Worldwide"}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold mt-0.5">
                <DollarSign className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-muted-foreground">Standard Rate:</span>
                <span className="text-foreground">₦{photographer.hourlyRate?.toLocaleString()}/hr</span>
              </div>
              {photographer.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {photographer.specialties.map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-[9px] font-black uppercase tracking-wider">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Bid + Date stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-secondary/20 border border-border/30 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Proposed Bid</p>
              <p className="text-3xl font-black text-foreground tracking-tight">
                ₦{bidAmount?.toLocaleString() ?? "N/A"}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/20 border border-border/30 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Submitted</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span className="text-base font-black tracking-tight">
                  {format(new Date(created_at), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>

          {/* Cover letter */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3 text-primary" /> Cover Letter
            </p>
            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5">
              <p className="text-sm text-foreground leading-relaxed italic">&ldquo;{message}&rdquo;</p>
            </div>
          </div>

          {/* Bio */}
          {photographer.bio && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Star className="h-3 w-3 text-primary" /> About the Artist
              </p>
              <div className="rounded-2xl bg-secondary/10 border border-border/20 p-5">
                <p className="text-sm text-muted-foreground leading-relaxed">{photographer.bio}</p>
              </div>
            </div>
          )}

          {/* View full profile link */}
          <Link
            href={`/photographer/${photographer.fullname}/${photographer.id}`}
            className="flex items-center justify-between rounded-2xl border border-border/40 hover:border-primary/40 bg-secondary/10 hover:bg-secondary/20 p-4 transition-all group/link"
          >
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-sm font-black uppercase tracking-widest">View Full Profile</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/link:text-primary group-hover/link:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Sticky action footer */}
        <div className="border-t border-border/40 bg-background p-4 space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={updateJobStatus}
              disabled={accepted}
              className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              <Check className="h-4 w-4 mr-2" />
              {accepted ? "Accepted" : "Accept"}
            </Button>
            <Button
              onClick={() => router.push("/messages")}
              variant="outline"
              className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 border-border/60 hover:bg-secondary/50"
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Message
            </Button>
          </div>
          <Button
            onClick={updateJobStatusRejected}
            disabled={rejected}
            variant="ghost"
            className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 disabled:opacity-60"
          >
            <X className="h-4 w-4 mr-2" />
            {rejected ? "Declined" : "Decline"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
