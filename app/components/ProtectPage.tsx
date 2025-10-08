"use client"

import { useEffect,useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      
      if (!user) {
        // Not logged in — redirect to login
        router.push("/login")
        return
      }

      if (!user.email_confirmed_at) {
        // Email not confirmed — redirect to info page
        router.push("/verify-email")
        return
      }
      setLoading(false)
    } 
   

    checkUser()
  }, [router])

  if(loading){
              return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return <>{children}</>
}
