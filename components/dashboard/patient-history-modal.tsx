'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Pill, FileText, User, Phone, Mail, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Patient, Appointment, Prescription } from '@/lib/types';
import { mockApi } from '@/lib/mock-api';

interface PatientHistoryModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientHistoryModal({ patient, isOpen, onClose }: PatientHistoryModalProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (patient && isOpen) {
      fetchPatientHistory();
    }
  }, [patient, isOpen]);

  const fetchPatientHistory = async () => {
    if (!patient) return;
    
    setIsLoading(true);
    try {
      const [appointmentData, prescriptionData] = await Promise.all([
        mockApi.getPatientAppointments(patient.id),
        mockApi.getPrescriptions(patient.id)
      ]);
      setAppointments(appointmentData);
      setPrescriptions(prescriptionData);
    } catch (error) {
      console.error('Failed to fetch patient history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
    }
  };

  const getPrescriptionStatusColor = (status: Prescription['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Patient History - {patient.name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Patient Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{patient.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{patient.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{patient.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Age: {patient.age}</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <LoadingSpinner />
          </div>
        ) : (
          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointments" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Appointments ({appointments.length})</span>
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="flex items-center space-x-2">
                <Pill className="h-4 w-4" />
                <span>Prescriptions ({prescriptions.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-4">
              {appointments.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <p className="text-gray-500">No appointments found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {appointment.type}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {format(new Date(`${appointment.date}T${appointment.time}`), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {format(new Date(`${appointment.date}T${appointment.time}`), 'h:mm a')}
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-gray-500 mb-1">Symptoms/Reason:</p>
                              <p className="text-sm text-gray-700">{appointment.symptoms}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-4">
              {prescriptions.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <p className="text-gray-500">No prescriptions found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {prescriptions.map((prescription) => (
                    <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className={getPrescriptionStatusColor(prescription.status)}>
                              {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {format(new Date(prescription.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-1">Diagnosis:</p>
                          <p className="text-sm text-gray-700 font-medium">{prescription.diagnosis}</p>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-2">Medications:</p>
                          <div className="space-y-2">
                            {prescription.medications.slice(0, 2).map((medication) => (
                              <div key={medication.id} className="bg-gray-50 p-2 rounded text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{medication.name}</span>
                                  <span className="text-gray-600">{medication.dosage}</span>
                                </div>
                                <div className="text-gray-600 mt-1">
                                  {medication.frequency} for {medication.duration}
                                </div>
                              </div>
                            ))}
                            {prescription.medications.length > 2 && (
                              <p className="text-xs text-gray-500">
                                +{prescription.medications.length - 2} more medications
                              </p>
                            )}
                          </div>
                        </div>

                        {prescription.followUpDate && (
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Follow-up:</span> {format(new Date(prescription.followUpDate), 'MMM d, yyyy')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}