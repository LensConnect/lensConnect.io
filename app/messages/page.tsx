"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Search } from "lucide-react"
import { mockMessages, mockPhotographers } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function MessagesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const toUserId = searchParams.get("to")

  const [selectedConversation, setSelectedConversation] = useState<string | null>(toUserId)
  const [messageText, setMessageText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  // Get all conversations for the current user
  const userMessages = mockMessages.filter((m) => m.senderId === user.id || m.receiverId === user.id)

  // Group messages by conversation
  const conversations = new Map<string, any>()
  userMessages.forEach((message) => {
    const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId
    if (!conversations.has(otherUserId)) {
      const otherUser = mockPhotographers.find((p) => p.userId === otherUserId)?.user
      conversations.set(otherUserId, {
        userId: otherUserId,
        user: otherUser,
        messages: [],
        lastMessage: message,
        unreadCount: 0,
      })
    }
    const conv = conversations.get(otherUserId)
    conv.messages.push(message)
    if (!message.read && message.receiverId === user.id) {
      conv.unreadCount++
    }
    if (message.createdAt > conv.lastMessage.createdAt) {
      conv.lastMessage = message
    }
  })

  const conversationList = Array.from(conversations.values()).sort(
    (a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime(),
  )

  const filteredConversations = conversationList.filter((conv) =>
    conv.user?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const currentConversation = selectedConversation ? conversations.get(selectedConversation) : null

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedConversation) return

    console.log("[v0] Sending message:", {
      from: user.id,
      to: selectedConversation,
      content: messageText,
    })

    // In a real app, send to API
    setMessageText("")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with photographers and clients</p>
        </div>

        <Card className="h-[calc(100vh-16rem)]">
          <CardContent className="p-0 h-full">
            <div className="grid grid-cols-1 md:grid-cols-3 h-full">
              {/* Conversations List */}
              <div className="border-r border-border">
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <ScrollArea className="h-[calc(100%-5rem)]">
                  {filteredConversations.length > 0 ? (
                    <div className="divide-y divide-border">
                      {filteredConversations.map((conv) => (
                        <button
                          key={conv.userId}
                          onClick={() => setSelectedConversation(conv.userId)}
                          className={cn(
                            "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                            selectedConversation === conv.userId && "bg-muted",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={conv.user?.avatar || "/placeholder.svg"} alt={conv.user?.name} />
                              <AvatarFallback>{conv.user?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold truncate">{conv.user?.name}</p>
                                {conv.unreadCount > 0 && (
                                  <Badge
                                    variant="default"
                                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                  >
                                    {conv.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{conv.lastMessage.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {conv.lastMessage.createdAt.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      {searchQuery ? "No conversations found" : "No messages yet"}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Chat Area */}
              <div className="md:col-span-2 flex flex-col">
                {currentConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-border flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={currentConversation.user?.avatar || "/placeholder.svg"}
                          alt={currentConversation.user?.name}
                        />
                        <AvatarFallback>{currentConversation.user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{currentConversation.user?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {currentConversation.user?.role === "photographer" ? "Photographer" : "Client"}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {currentConversation.messages
                          .sort((a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime())
                          .map((message: any) => {
                            const isOwn = message.senderId === user.id
                            return (
                              <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                                <div
                                  className={cn(
                                    "max-w-[70%] rounded-lg px-4 py-2",
                                    isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
                                  )}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <p
                                    className={cn(
                                      "text-xs mt-1",
                                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
                                    )}
                                  >
                                    {message.createdAt.toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!messageText.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-2">No conversation selected</p>
                      <p className="text-sm">Choose a conversation from the list to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
