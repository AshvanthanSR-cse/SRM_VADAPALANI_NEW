import type { Hospital, Doctor, Department } from "./types";

// Generate mock hospitals around a given location
export function generateMockHospitals(
  userLat: number,
  userLng: number
): Hospital[] {
  const hospitals: Hospital[] = [
    {
      id: "hosp_1",
      email: "city.hospital@example.com",
      role: "hospital",
      name: "City General Hospital",
      phone: "+91 98765 43210",
      location: {
        latitude: userLat + 0.01,
        longitude: userLng + 0.015,
        address: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
      serviceRadius: 15,
      departments: generateDepartments("hosp_1"),
      emergencyCapacity: 50,
      nonEmergencyCapacity: 200,
      availableEmergencyBeds: 12,
      availableNonEmergencyBeds: 45,
      priceRange: {
        minConsultation: 300,
        maxConsultation: 1500,
        emergencyCharges: 5000,
      },
      rating: 4.5,
      totalRatings: 1250,
      isOpen24Hours: true,
      amenities: ["ICU", "Pharmacy", "Ambulance", "Lab", "X-Ray", "MRI"],
      images: [],
      createdAt: new Date(),
    },
    {
      id: "hosp_2",
      email: "apollo.hospital@example.com",
      role: "hospital",
      name: "Apollo Medical Center",
      phone: "+91 98765 43211",
      location: {
        latitude: userLat - 0.008,
        longitude: userLng + 0.012,
        address: "456 Health Avenue",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400002",
      },
      serviceRadius: 20,
      departments: generateDepartments("hosp_2"),
      emergencyCapacity: 80,
      nonEmergencyCapacity: 350,
      availableEmergencyBeds: 25,
      availableNonEmergencyBeds: 120,
      priceRange: {
        minConsultation: 500,
        maxConsultation: 2500,
        emergencyCharges: 8000,
      },
      rating: 4.8,
      totalRatings: 3200,
      isOpen24Hours: true,
      amenities: [
        "ICU",
        "NICU",
        "Pharmacy",
        "Ambulance",
        "Lab",
        "X-Ray",
        "MRI",
        "CT Scan",
        "Cafeteria",
      ],
      images: [],
      createdAt: new Date(),
    },
    {
      id: "hosp_3",
      email: "lifecare.hospital@example.com",
      role: "hospital",
      name: "LifeCare Hospital",
      phone: "+91 98765 43212",
      location: {
        latitude: userLat + 0.025,
        longitude: userLng - 0.02,
        address: "789 Care Lane",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400003",
      },
      serviceRadius: 10,
      departments: generateDepartments("hosp_3"),
      emergencyCapacity: 30,
      nonEmergencyCapacity: 100,
      availableEmergencyBeds: 0, // Full - no emergency beds
      availableNonEmergencyBeds: 15,
      priceRange: {
        minConsultation: 200,
        maxConsultation: 800,
        emergencyCharges: 3000,
      },
      rating: 4.2,
      totalRatings: 890,
      isOpen24Hours: true,
      amenities: ["ICU", "Pharmacy", "Ambulance", "Lab", "X-Ray"],
      images: [],
      createdAt: new Date(),
    },
    {
      id: "hosp_4",
      email: "medplus.hospital@example.com",
      role: "hospital",
      name: "MedPlus Super Specialty",
      phone: "+91 98765 43213",
      location: {
        latitude: userLat - 0.035,
        longitude: userLng + 0.04,
        address: "101 Specialty Road",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400004",
      },
      serviceRadius: 25,
      departments: generateDepartments("hosp_4"),
      emergencyCapacity: 100,
      nonEmergencyCapacity: 500,
      availableEmergencyBeds: 40,
      availableNonEmergencyBeds: 200,
      priceRange: {
        minConsultation: 800,
        maxConsultation: 5000,
        emergencyCharges: 15000,
      },
      rating: 4.9,
      totalRatings: 5600,
      isOpen24Hours: true,
      amenities: [
        "ICU",
        "NICU",
        "PICU",
        "Pharmacy",
        "Ambulance",
        "Lab",
        "X-Ray",
        "MRI",
        "CT Scan",
        "PET Scan",
        "Cafeteria",
        "Parking",
      ],
      images: [],
      createdAt: new Date(),
    },
    {
      id: "hosp_5",
      email: "rural.clinic@example.com",
      role: "hospital",
      name: "Rural Health Clinic",
      phone: "+91 98765 43214",
      location: {
        latitude: userLat + 0.05,
        longitude: userLng + 0.06,
        address: "Village Road",
        city: "Suburbs",
        state: "Maharashtra",
        pincode: "400005",
      },
      serviceRadius: 30,
      departments: generateDepartments("hosp_5", true),
      emergencyCapacity: 10,
      nonEmergencyCapacity: 30,
      availableEmergencyBeds: 5,
      availableNonEmergencyBeds: 20,
      priceRange: {
        minConsultation: 100,
        maxConsultation: 300,
        emergencyCharges: 1000,
      },
      rating: 4.0,
      totalRatings: 320,
      isOpen24Hours: false,
      operatingHours: {
        monday: { isOpen: true, openTime: "08:00", closeTime: "20:00" },
        tuesday: { isOpen: true, openTime: "08:00", closeTime: "20:00" },
        wednesday: { isOpen: true, openTime: "08:00", closeTime: "20:00" },
        thursday: { isOpen: true, openTime: "08:00", closeTime: "20:00" },
        friday: { isOpen: true, openTime: "08:00", closeTime: "20:00" },
        saturday: { isOpen: true, openTime: "08:00", closeTime: "14:00" },
        sunday: { isOpen: false },
      },
      amenities: ["Pharmacy", "Lab"],
      images: [],
      createdAt: new Date(),
    },
    {
      id: "hosp_6",
      email: "heart.center@example.com",
      role: "hospital",
      name: "Heart Care Center",
      phone: "+91 98765 43215",
      location: {
        latitude: userLat - 0.02,
        longitude: userLng - 0.03,
        address: "Heart Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400006",
      },
      serviceRadius: 50,
      departments: [
        {
          id: "dept_heart_1",
          name: "Cardiology",
          doctors: generateDoctors("hosp_6", "Cardiologist", 5),
          isEmergency: true,
        },
        {
          id: "dept_heart_2",
          name: "Cardiac Surgery",
          doctors: generateDoctors("hosp_6", "Cardiac Surgeon", 3),
          isEmergency: true,
        },
      ],
      emergencyCapacity: 40,
      nonEmergencyCapacity: 80,
      availableEmergencyBeds: 8,
      availableNonEmergencyBeds: 30,
      priceRange: {
        minConsultation: 1000,
        maxConsultation: 3000,
        emergencyCharges: 20000,
      },
      rating: 4.7,
      totalRatings: 2100,
      isOpen24Hours: true,
      amenities: [
        "ICU",
        "CCU",
        "Cath Lab",
        "Pharmacy",
        "Ambulance",
        "Lab",
        "X-Ray",
        "CT Scan",
      ],
      images: [],
      createdAt: new Date(),
    },
  ];

  return hospitals;
}

function generateDepartments(
  hospitalId: string,
  isRural: boolean = false
): Department[] {
  if (isRural) {
    return [
      {
        id: `dept_${hospitalId}_1`,
        name: "General Medicine",
        doctors: generateDoctors(hospitalId, "General Physician", 2),
        isEmergency: true,
      },
      {
        id: `dept_${hospitalId}_2`,
        name: "Pediatrics",
        doctors: generateDoctors(hospitalId, "Pediatrician", 1),
        isEmergency: false,
      },
    ];
  }

  return [
    {
      id: `dept_${hospitalId}_1`,
      name: "Emergency",
      doctors: generateDoctors(hospitalId, "Emergency Medicine", 3),
      isEmergency: true,
    },
    {
      id: `dept_${hospitalId}_2`,
      name: "General Medicine",
      doctors: generateDoctors(hospitalId, "General Physician", 4),
      isEmergency: false,
    },
    {
      id: `dept_${hospitalId}_3`,
      name: "Cardiology",
      doctors: generateDoctors(hospitalId, "Cardiologist", 2),
      isEmergency: true,
    },
    {
      id: `dept_${hospitalId}_4`,
      name: "Orthopedics",
      doctors: generateDoctors(hospitalId, "Orthopedic", 2),
      isEmergency: false,
    },
    {
      id: `dept_${hospitalId}_5`,
      name: "Neurology",
      doctors: generateDoctors(hospitalId, "Neurologist", 2),
      isEmergency: true,
    },
    {
      id: `dept_${hospitalId}_6`,
      name: "Pediatrics",
      doctors: generateDoctors(hospitalId, "Pediatrician", 3),
      isEmergency: false,
    },
  ];
}

function generateDoctors(
  hospitalId: string,
  specialization: string,
  count: number
): Doctor[] {
  const firstNames = [
    "Dr. Arun",
    "Dr. Priya",
    "Dr. Rajesh",
    "Dr. Sunita",
    "Dr. Vikram",
    "Dr. Meera",
    "Dr. Sanjay",
    "Dr. Neha",
  ];
  const lastNames = [
    "Sharma",
    "Patel",
    "Kumar",
    "Singh",
    "Gupta",
    "Joshi",
    "Verma",
    "Reddy",
  ];

  const doctors: Doctor[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    doctors.push({
      id: `doc_${hospitalId}_${specialization}_${i}`,
      name: `${firstName} ${lastName}`,
      specialization,
      qualification: "MBBS, MD",
      experience: Math.floor(Math.random() * 20) + 5,
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      totalRatings: Math.floor(Math.random() * 500) + 50,
      consultationFee: Math.floor(Math.random() * 1000) + 300,
      availableSlots: generateTimeSlots(),
      hospitalId,
    });
  }

  return doctors;
}

function generateTimeSlots() {
  const slots = [];
  const today = new Date();

  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split("T")[0];

    const times = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
    ];

    for (const time of times) {
      const [hours, minutes] = time.split(":");
      const endMinutes = parseInt(minutes) + 30;
      const endTime =
        endMinutes >= 60
          ? `${String(parseInt(hours) + 1).padStart(2, "0")}:${String(endMinutes - 60).padStart(2, "0")}`
          : `${hours}:${String(endMinutes).padStart(2, "0")}`;

      slots.push({
        id: `slot_${dateStr}_${time}`,
        date: dateStr,
        startTime: time,
        endTime,
        isBooked: Math.random() > 0.7, // 30% chance of being booked
      });
    }
  }

  return slots;
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate response time based on distance
export function estimateResponseTime(distanceKm: number): string {
  const baseTime = 5; // Base time in minutes
  const timePerKm = 3; // Minutes per km (accounting for traffic)
  const totalMinutes = Math.round(baseTime + distanceKm * timePerKm);

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}h ${mins}m`;
}
