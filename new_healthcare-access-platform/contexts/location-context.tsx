"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

interface LocationContextType {
  location: LocationState | null;
  isLoading: boolean;
  error: string | null;
  permissionDenied: boolean;
  requestLocation: () => void;
  setManualLocation: (lat: number, lng: number) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

// Default location (Mumbai, India) for demo purposes
const DEFAULT_LOCATION = {
  latitude: 19.076,
  longitude: 72.8777,
  accuracy: 100,
  address: "Mumbai, Maharashtra, India",
};

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLocation(DEFAULT_LOCATION);
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setPermissionDenied(false);
        setIsLoading(false);
      },
      (err) => {
        console.log("[v0] Geolocation error:", err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setError("Location access was denied");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Location information is unavailable");
        } else if (err.code === err.TIMEOUT) {
          setError("Location request timed out");
        }
        // Use default location for demo
        setLocation(DEFAULT_LOCATION);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const setManualLocation = (lat: number, lng: number) => {
    setLocation({
      latitude: lat,
      longitude: lng,
      accuracy: 100,
    });
    setPermissionDenied(false);
    setError(null);
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        error,
        permissionDenied,
        requestLocation,
        setManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
