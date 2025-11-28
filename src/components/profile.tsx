"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, User, Mail, Phone, MapPin, Edit } from "lucide-react"


interface UserProfile {
  id: string
  name: string | null
  email: string
  phone: string | null
  address: string | null
  nativeLanguage: string | null
  learningLanguages: string[]
  timezone: string | null
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    nativeLanguage: "",
    learningLanguages: [] as string[],
    timezone: "",
  })

  // Fetch user profile
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile()
    }
  }, [session])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${session!.user.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch profile")
      }

      setUser(data)
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        nativeLanguage: data.nativeLanguage || "",
        learningLanguages: data.learningLanguages || [],
        timezone: data.timezone || "",
      })
    } catch (error) {
      alert("Failed to load profile")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setUser(data)
      setIsEditing(false)
      alert("Profile updated successfully")
    } catch (error) {
      alert("Failed to update profile")
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        nativeLanguage: user.nativeLanguage || "",
        learningLanguages: user.learningLanguages || [],
        timezone: user.timezone || "",
      })
    }
    setIsEditing(false)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-muted-foreground">You need to be signed in to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
     

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email - Read Only */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter your address"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={updating}>
                    {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={updating}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Name */}
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{user?.name || "Not provided"}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{user?.phone || "Not provided"}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium whitespace-pre-line">{user?.address || "Not provided"}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
