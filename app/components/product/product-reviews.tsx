'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Star, ThumbsUp, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { formatDate } from '@/lib/utils'

interface ReviewUser {
  name: string
  image?: string
}

interface Review {
  id: number
  rating: number
  title?: string
  comment?: string
  verifiedPurchase: boolean
  isApproved: boolean
  createdAt: string
  user: ReviewUser
}

interface ProductReviewsProps {
  reviews: Review[]
  productId: number
}

export default function ProductReviews({ reviews, productId }: ProductReviewsProps) {
  const { data: session } = useSession()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set())
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')

  const approvedReviews = reviews.filter(review => review.isApproved)

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: approvedReviews.filter(review => review.rating === rating).length,
    percentage: approvedReviews.length > 0 
      ? (approvedReviews.filter(review => review.rating === rating).length / approvedReviews.length) * 100 
      : 0
  }))

  const averageRating = approvedReviews.length > 0 
    ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length 
    : 0

  // Sort reviews
  const sortedReviews = [...approvedReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'highest':
        return b.rating - a.rating
      case 'lowest':
        return a.rating - b.rating
      default:
        return 0
    }
  })

  const toggleReviewExpansion = (reviewId: number) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClass = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }[size]

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClass} ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (approvedReviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to review this product
            </p>
            {session && (
              <Button onClick={() => setShowReviewForm(true)}>
                Write a Review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Rating Summary */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">
                  {averageRating.toFixed(1)}
                </div>
                <div>
                  {renderStars(Math.round(averageRating), 'lg')}
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {approvedReviews.length} reviews
                  </p>
                </div>
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-2">
                {ratingCounts.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-8">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Write Review */}
            <div className="space-y-4">
              <h3 className="font-medium">Share your experience</h3>
              <p className="text-sm text-muted-foreground">
                Help other customers by sharing your thoughts about this product.
              </p>
              {session ? (
                <Button 
                  onClick={() => setShowReviewForm(true)}
                  className="w-full"
                >
                  Write a Review
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Sign in to write a review
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/login">Sign In</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Reviews ({approvedReviews.length})</CardTitle>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-input bg-background px-3 py-1 text-sm rounded-md"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedReviews.map((review) => {
              const isExpanded = expandedReviews.has(review.id)
              const shouldTruncate = review.comment && review.comment.length > 200
              
              return (
                <div key={review.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user.image} />
                      <AvatarFallback>
                        {review.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.user.name}</span>
                        {review.verifiedPurchase && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, 'md')}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>

                      {review.title && (
                        <h4 className="font-medium">{review.title}</h4>
                      )}

                      {review.comment && (
                        <div className="space-y-2">
                          <p className="text-sm leading-relaxed">
                            {shouldTruncate && !isExpanded
                              ? `${review.comment.substring(0, 200)}...`
                              : review.comment
                            }
                          </p>
                          
                          {shouldTruncate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleReviewExpansion(review.id)}
                            >
                              {isExpanded ? (
                                <>
                                  Show Less <ChevronUp className="h-4 w-4 ml-1" />
                                </>
                              ) : (
                                <>
                                  Show More <ChevronDown className="h-4 w-4 ml-1" />
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Review Actions */}
                      <div className="flex items-center gap-4 pt-2">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Helpful
                        </Button>
                        <Button variant="ghost" size="sm">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}