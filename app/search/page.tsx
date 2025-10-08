"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { PhotographerCard } from "@/components/photographer-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, SlidersHorizontal } from "lucide-react"
import { mockPhotographers } from "@/lib/mock-data"

const specialties = ["Events", "Portraits", "Products", "Real Estate", "Fashion", "Family", "Weddings", "Commercial"]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 500])
  const [minRating, setMinRating] = useState("0")
  const [sortBy, setSortBy] = useState("rating")
  const [showFilters, setShowFilters] = useState(true)

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty],
    )
  }

  const filteredPhotographers = useMemo(() => {
    const filtered = mockPhotographers.filter((photographer) => {
      // Search query filter
      if (searchQuery && !photographer.user.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Location filter
      if (location && !photographer.location.toLowerCase().includes(location.toLowerCase())) {
        return false
      }

      // Specialty filter
      if (selectedSpecialties.length > 0) {
        const hasMatchingSpecialty = photographer.specialties.some((s) => selectedSpecialties.includes(s))
        if (!hasMatchingSpecialty) return false
      }

      // Price range filter
      if (photographer.hourlyRate < priceRange[0] || photographer.hourlyRate > priceRange[1]) {
        return false
      }

      // Rating filter
      if (photographer.rating < Number.parseFloat(minRating)) {
        return false
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "price-low":
          return a.hourlyRate - b.hourlyRate
        case "price-high":
          return b.hourlyRate - a.hourlyRate
        case "reviews":
          return b.reviewCount - a.reviewCount
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, location, selectedSpecialties, priceRange, minRating, sortBy])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">Find Your Photographer</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative flex-1">
              <Input
                placeholder="Location (e.g., New York, NY)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:w-auto">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="lg:w-80 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Specialties */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Specialties</Label>
                    <div className="space-y-2">
                      {specialties.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox
                            id={specialty}
                            checked={selectedSpecialties.includes(specialty)}
                            onCheckedChange={() => toggleSpecialty(specialty)}
                          />
                          <label
                            htmlFor={specialty}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {specialty}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      Price Range: ${priceRange[0]} - ${priceRange[1]}/hr
                    </Label>
                    <Slider
                      min={0}
                      max={500}
                      step={25}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="py-4"
                    />
                  </div>

                  {/* Minimum Rating */}
                  <div className="space-y-3">
                    <Label htmlFor="rating" className="text-base font-semibold">
                      Minimum Rating
                    </Label>
                    <Select value={minRating} onValueChange={setMinRating}>
                      <SelectTrigger id="rating">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any Rating</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setSearchQuery("")
                      setLocation("")
                      setSelectedSpecialties([])
                      setPriceRange([0, 500])
                      setMinRating("0")
                    }}
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1 space-y-6">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredPhotographers.length} photographer{filteredPhotographers.length !== 1 ? "s" : ""} found
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="sort" className="text-sm">
                  Sort by:
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Photographer Grid */}
            {filteredPhotographers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPhotographers.map((photographer) => (
                  <PhotographerCard key={photographer.id} photographer={photographer} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No photographers found matching your criteria.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("")
                    setLocation("")
                    setSelectedSpecialties([])
                    setPriceRange([0, 500])
                    setMinRating("0")
                  }}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
