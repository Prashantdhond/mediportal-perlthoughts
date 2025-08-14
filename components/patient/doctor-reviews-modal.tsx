+'use client';
+
+import { useEffect, useState } from 'react';
+import { format } from 'date-fns';
+import { Star, MessageSquare, User } from 'lucide-react';
+import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
+import { Card, CardContent } from '@/components/ui/card';
+import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
+import { LoadingSpinner } from '@/components/ui/loading-spinner';
+import { DoctorListing, Review } from '@/lib/types';
+import { mockApi } from '@/lib/mock-api';
+
+interface DoctorReviewsModalProps {
+  doctor: DoctorListing | null;
+  isOpen: boolean;
+  onClose: () => void;
+}
+
+export function DoctorReviewsModal({ doctor, isOpen, onClose }: DoctorReviewsModalProps) {
+  const [reviews, setReviews] = useState<Review[]>([]);
+  const [isLoading, setIsLoading] = useState(false);
+
+  useEffect(() => {
+    if (doctor && isOpen) {
+      fetchReviews();
+    }
+  }, [doctor, isOpen]);
+
+  const fetchReviews = async () => {
+    if (!doctor) return;
+    
+    setIsLoading(true);
+    try {
+      const data = await mockApi.getReviews(doctor.id);
+      setReviews(data);
+    } catch (error) {
+      console.error('Failed to fetch reviews:', error);
+    } finally {
+      setIsLoading(false);
+    }
+  };
+
+  const renderStars = (rating: number) => {
+    return (
+      <div className="flex items-center space-x-1">
+        {[1, 2, 3, 4, 5].map((star) => (
+          <Star
+            key={star}
+            className={`h-4 w-4 ${
+              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
+            }`}
+          />
+        ))}
+      </div>
+    );
+  };
+
+  if (!doctor) return null;
+
+  return (
+    <Dialog open={isOpen} onOpenChange={onClose}>
+      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
+        <DialogHeader>
+          <DialogTitle className="flex items-center space-x-2">
+            <MessageSquare className="h-5 w-5" />
+            <span>Patient Reviews</span>
+          </DialogTitle>
+        </DialogHeader>
+
+        {/* Doctor Summary */}
+        <div className="bg-gray-50 p-4 rounded-lg mb-6">
+          <div className="flex items-center space-x-4">
+            <Avatar className="h-16 w-16">
+              <AvatarImage src={doctor.avatar} alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} />
+              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
+                {doctor.firstName[0]}{doctor.lastName[0]}
+              </AvatarFallback>
+            </Avatar>
+            <div className="flex-1">
+              <h3 className="text-xl font-semibold text-gray-900">
+                Dr. {doctor.firstName} {doctor.lastName}
+              </h3>
+              <p className="text-gray-600">{doctor.specialization}</p>
+              <p className="text-sm text-gray-500">{doctor.clinicName}</p>
+              <div className="flex items-center space-x-2 mt-2">
+                {renderStars(doctor.rating)}
+                <span className="text-sm font-medium">{doctor.rating}</span>
+                <span className="text-sm text-gray-500">({doctor.totalReviews} reviews)</span>
+              </div>
+            </div>
+          </div>
+        </div>
+
+        {isLoading ? (
+          <div className="flex items-center justify-center h-48">
+            <LoadingSpinner />
+          </div>
+        ) : (
+          <div className="space-y-4">
+            <h4 className="text-lg font-semibold text-gray-900">
+              Patient Reviews ({reviews.length})
+            </h4>
+            
+            {reviews.length === 0 ? (
+              <Card>
+                <CardContent className="flex items-center justify-center h-32">
+                  <div className="text-center">
+                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
+                    <p className="text-gray-500">No reviews yet</p>
+                  </div>
+                </CardContent>
+              </Card>
+            ) : (
+              <div className="space-y-4 max-h-96 overflow-y-auto">
+                {reviews.map((review) => (
+                  <Card key={review.id} className="hover:shadow-md transition-shadow">
+                    <CardContent className="p-4">
+                      <div className="flex items-start space-x-4">
+                        <div className="bg-blue-100 p-2 rounded-full">
+                          <User className="h-5 w-5 text-blue-600" />
+                        </div>
+                        <div className="flex-1">
+                          <div className="flex items-center justify-between mb-2">
+                            <div>
+                              <p className="font-medium text-gray-900">{review.patientName}</p>
+                              <p className="text-sm text-gray-500">
+                                {format(new Date(review.date), 'MMM d, yyyy')}
+                              </p>
+                            </div>
+                            {renderStars(review.rating)}
+                          </div>
+                          {review.comment && (
+                            <p className="text-gray-700 text-sm leading-relaxed">
+                              "{review.comment}"
+                            </p>
+                          )}
+                        </div>
+                      </div>
+                    </CardContent>
+                  </Card>
+                ))}
+              </div>
+            )}
+          </div>
+        )}
+      </DialogContent>
+    </Dialog>
+  );
+}
+