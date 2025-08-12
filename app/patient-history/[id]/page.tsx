'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, Pill, FileText, User, Phone, Mail, Heart, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { Navbar } from '@/components/layout/navbar';
import { PatientMedicalHistory, Appointment, Prescription } from '@/lib/types';
import { mockApi } from '@/lib/mock-api';

export default function PatientHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [patientHistory, setPatientHistory] = useState<PatientMedicalHistory | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        const [historyData, appointmentsData, prescriptionsData] = await Promise.all([
          mockApi.getPatientMedicalHistory(patientId),
          mockApi.getPatientAppointments(patientId),
          mockApi.getPrescriptions(patientId)
        ]);
        
        setPatientHistory(historyData);
        setAppointments(appointmentsData);
        setPrescriptions(prescriptionsData);
      } catch (error) {
        console.error('Failed to fetch patient history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchPatientHistory();
    }
  }, [patientId]);

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsPrescriptionModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-purple-100 text-purple-800';
      case 'follow-up': return 'bg-indigo-100 text-indigo-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-96">
              <LoadingSpinner size="lg" />
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!patientHistory) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Patient Not Found</h1>
              <Button onClick={() => router.back()} className="mt-4">
                Go Back
              </Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Patient Medical History</h1>
            <p className="text-gray-600 mt-2">Complete medical record and appointment history</p>
          </div>

          {/* Patient Profile Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Patient Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                    {patientHistory.firstName[0]}{patientHistory.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {patientHistory.firstName} {patientHistory.lastName}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{patientHistory.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{patientHistory.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{patientHistory.age} years old, {patientHistory.gender}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Medical Information</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Blood Type:</span>
                        <span className="text-sm text-gray-600 ml-2">{patientHistory.bloodType}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Height:</span>
                        <span className="text-sm text-gray-600 ml-2">{patientHistory.height}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Weight:</span>
                        <span className="text-sm text-gray-600 ml-2">{patientHistory.weight}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Emergency Contact</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Contact:</span>
                        <span className="text-sm text-gray-600 ml-2">{patientHistory.emergencyContact}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Last Visit:</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {format(new Date(patientHistory.lastVisit), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Total Visits:</span>
                        <span className="text-sm text-gray-600 ml-2">{patientHistory.totalVisits}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical History & Allergies */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Heart className="h-4 w-4" />
                    <span>Medical History</span>
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-700">
                      {patientHistory.medicalHistory || 'No significant medical history recorded'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Allergies</span>
                  </h4>
                  <div className="bg-red-50 p-3 rounded-md border border-red-200">
                    <p className="text-sm text-red-700">
                      {patientHistory.allergies || 'No known allergies'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Records Tabs */}
          <Tabs defaultValue="appointments" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointments" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Appointment History ({appointments.length})</span>
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="flex items-center space-x-2">
                <Pill className="h-4 w-4" />
                <span>Prescriptions ({prescriptions.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Appointments History */}
            <TabsContent value="appointments" className="space-y-4">
              {appointments.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No appointment history found</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {appointments
                    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())
                    .map((appointment) => (
                    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900">
                                  {format(new Date(`${appointment.date}T${appointment.time}`), 'EEEE, MMM d, yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600">
                                  {format(new Date(`${appointment.date}T${appointment.time}`), 'h:mm a')}
                                </span>
                              </div>
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                              <Badge variant="outline" className={getTypeColor(appointment.type)}>
                                {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                              </Badge>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm text-gray-500 mb-1">Symptoms/Reason for Visit:</p>
                              <p className="text-gray-700">{appointment.symptoms}</p>
                            </div>

                            {/* Find related prescription */}
                            {(() => {
                              const relatedPrescription = prescriptions.find(p => p.appointmentId === appointment.id);
                              return relatedPrescription && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Pill className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">Prescription Available</span>
                                  </div>
                                  <p className="text-sm text-green-700 mb-2">
                                    <strong>Diagnosis:</strong> {relatedPrescription.diagnosis}
                                  </p>
                                  <Button
                                    size="sm"
                                    onClick={() => handleViewPrescription(relatedPrescription)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    View Prescription
                                  </Button>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Prescriptions History */}
            <TabsContent value="prescriptions" className="space-y-4">
              {prescriptions.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No prescriptions found</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {prescriptions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((prescription) => (
                    <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900">
                                  {format(new Date(prescription.date), 'EEEE, MMM d, yyyy')}
                                </span>
                              </div>
                              <Badge className={getStatusColor(prescription.status)}>
                                {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                              </Badge>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm text-gray-500 mb-1">Diagnosis:</p>
                              <p className="text-gray-700 font-medium">{prescription.diagnosis}</p>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm text-gray-500 mb-2">Medications ({prescription.medications.length}):</p>
                              <div className="flex flex-wrap gap-2">
                                {prescription.medications.slice(0, 3).map((medication) => (
                                  <Badge key={medication.id} variant="outline" className="text-xs">
                                    {medication.name} ({medication.dosage})
                                  </Badge>
                                ))}
                                {prescription.medications.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{prescription.medications.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {prescription.followUpDate && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Follow-up: {format(new Date(prescription.followUpDate), 'MMM d, yyyy')}</span>
                              </div>
                            )}
                          </div>

                          <div className="ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewPrescription(prescription)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Prescription Details Modal */}
        <Dialog open={isPrescriptionModalOpen} onOpenChange={setIsPrescriptionModalOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Prescription Details</DialogTitle>
            </DialogHeader>
            
            {selectedPrescription && (
              <div className="space-y-6">
                {/* Prescription Header */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{selectedPrescription.patientName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{format(new Date(selectedPrescription.date), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(selectedPrescription.status)}>
                        {selectedPrescription.status.charAt(0).toUpperCase() + selectedPrescription.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Diagnosis</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {selectedPrescription.diagnosis}
                  </p>
                </div>

                {/* Medications */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Medications</h3>
                  <div className="space-y-3">
                    {selectedPrescription.medications.map((medication, index) => (
                      <div key={medication.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{medication.name}</h4>
                          <Badge variant="outline">{medication.dosage}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Frequency:</span> {medication.frequency}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {medication.duration}
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span> {medication.quantity} {medication.unit}
                          </div>
                        </div>
                        {medication.instructions && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Instructions:</span> {medication.instructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* General Instructions */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">General Instructions</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {selectedPrescription.instructions}
                  </p>
                </div>

                {/* Follow-up Date */}
                {selectedPrescription.followUpDate && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Follow-up Date</h3>
                    <p className="text-gray-700">
                      {format(new Date(selectedPrescription.followUpDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {selectedPrescription.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {selectedPrescription.notes}
                    </p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex items-center justify-between pt-4 border-t text-sm text-gray-500">
                  <div>
                    Created: {format(new Date(selectedPrescription.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                  <div>
                    Updated: {format(new Date(selectedPrescription.updatedAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}