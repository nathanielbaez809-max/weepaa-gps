import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Moon, Sun, Truck } from 'lucide-react';
import RouteInput from './components/RouteInput';
import NavigationPanel from './components/NavigationPanel';
import PoiPrompt from './components/PoiPrompt';
import ReportButton from './components/ReportButton';
import Speedometer from './components/Speedometer';
import { type VehicleSpecs } from './components/VehicleProfile';
import { calculateRoute, type RouteData, type POI } from './services/mockRouting';
import { speak } from './services/tts';
import { checkForWeatherAlerts, type WeatherAlert } from './services/weather';
import { getFuelPrices, type FuelPrice } from './services/fuel';
import { getParkingStatus, type ParkingStatus } from './services/parking';
import { subscribeToReports, type CommunityReport } from './services/reports';
import { AlertTriangle, User } from 'lucide-react';
import VoiceInput from './components/VoiceInput';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { GamificationProvider, useGamification } from './contexts/GamificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import OfflineIndicator from './components/OfflineIndicator';
import VehicleSetupWizard from './components/VehicleSetupWizard';
import WeighStationFeedback from './components/WeighStationFeedback';

// Lazy Load Heavy Components
const Map = lazy(() => import('./components/Map'));
const SubscriptionModal = lazy(() => import('./components/SubscriptionModal'));
const ProfilePanel = lazy(() => import('./components/ProfilePanel'));

function App() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | undefined>(undefined);
  const [_routeIndex, setRouteIndex] = useState(0);
  const [activePoiPrompt, setActivePoiPrompt] = useState<POI | null>(null);

  // Advanced Features State
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [showGamificationProfile, setShowGamificationProfile] = useState(false);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);
  const [parkingStatuses, setParkingStatuses] = useState<ParkingStatus[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const { addPoints } = useGamification();
  const [vehicleSpecs, setVehicleSpecs] = useState<VehicleSpecs>(() => {
    const saved = localStorage.getItem('vehicleSpecs');
    return saved ? JSON.parse(saved) : null;
  });
  const [showVehicleSetup, setShowVehicleSetup] = useState(!localStorage.getItem('vehicleSpecs'));

  // Simulation refs
  const simulationInterval = useRef<number | null>(null);

  const handleStartNavigation = async (waypoints: string[] = [], avoidWeighStations: boolean = false) => {
    if (!vehicleSpecs) {
      speak("Please complete vehicle setup first.");
      setShowVehicleSetup(true);
      return;
    }

    setIsLoading(true);
    try {
      const data = await calculateRoute("Denver", "Kansas City", {
        vehicleHeight: `${vehicleSpecs.height.ft}'${vehicleSpecs.height.in}"`,
        vehicleWeight: vehicleSpecs.weight,
        hazmat: vehicleSpecs.hazmat
      }, waypoints, avoidWeighStations);
      setRouteData(data);
      setIsNavigating(true);

      // Check for weather
      const alerts = await checkForWeatherAlerts(data.coordinates);
      setWeatherAlerts(alerts);
      if (alerts.length > 0) {
        speak(`Caution. ${alerts[0].message} reported on your route.`);
      }

      // Get Fuel Prices
      const prices = await getFuelPrices(data.pois);
      setFuelPrices(prices);
      const bestPrice = prices.find(p => p.isBestPrice);
      if (bestPrice) {
        // Maybe notify about savings?
        // speak(`Best diesel price found: $${bestPrice.price}`);
      }

      // Get Parking Status
      const parking = await getParkingStatus(data.pois);
      setParkingStatuses(parking);

      // Fetch current GPS location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const gpsLocation: [number, number] = [
              position.coords.latitude,
              position.coords.longitude
            ];
            setCurrentLocation(gpsLocation);
            console.log('GPS Location acquired:', gpsLocation);
            speak("GPS location acquired. Starting navigation.");
          },
          (error) => {
            console.warn('GPS location unavailable:', error);
            // Fallback to route start point
            if (data.coordinates.length > 0) {
              setCurrentLocation(data.coordinates[0]);
              setRouteIndex(0);
              speak("Starting navigation. Truck route calculated.");
            }
          }
        );
      } else {
        // No GPS available, use route start point
        if (data.coordinates.length > 0) {
          setCurrentLocation(data.coordinates[0]);
          setRouteIndex(0);
          speak("Starting navigation. Truck route calculated.");
        }
      }
    } catch (error) {
      console.error("Failed to calculate route", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setRouteData(null);
    setCurrentLocation(undefined);
    setRouteIndex(0);
    setActivePoiPrompt(null);
    setCurrentSpeed(0);
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    speak("Navigation cancelled.");
  };

  const handlePoiVote = (status: 'open' | 'closed' | 'unknown') => {
    if (!activePoiPrompt || !routeData) return;

    // Update local state
    const updatedPois = routeData.pois.map(p =>
      p.id === activePoiPrompt.id ? { ...p, status } : p
    );

    setRouteData({ ...routeData, pois: updatedPois });
    setActivePoiPrompt(null);

    if (status !== 'unknown') {
      speak(`Thanks for reporting. Weigh station marked as ${status}.`);
    }
  };

  // Initial data fetch (Subscription)
  useEffect(() => {
    const unsubscribe = subscribeToReports((reports) => {
      setCommunityReports(reports);
    });
    return () => unsubscribe();
  }, []);

  const handleReportAdded = () => {
    addPoints(10, "Report Added");
  };

  const handleReportVerified = () => {
    addPoints(2, "Report Verified");
  };

  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case 'find_fuel':
        speak("Searching for diesel prices along your route.");
        // In a real app, this would trigger a new search or filter
        if (routeData) {
          getFuelPrices(routeData.pois).then(prices => {
            setFuelPrices(prices);
            speak(`Found ${prices.length} fuel stops.`);
          });
        }
        break;
      case 'report_accident':
        // handleUserReport('accident'); // TODO: Update to use new ReportService
        speak("Please use the report button to report accidents.");
        break;
      case 'stop_navigation':
        handleStopNavigation();
        break;
      case 'unknown':
        speak("I didn't catch that. Try saying 'Find Fuel' or 'Report Accident'.");
        break;
    }
  };

  // Simulation Loop
  useEffect(() => {
    if (isNavigating && routeData) {
      simulationInterval.current = window.setInterval(() => {
        setRouteIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex >= routeData.coordinates.length) {
            if (simulationInterval.current) clearInterval(simulationInterval.current);
            speak("You have arrived at your destination.");
            setCurrentSpeed(0);
            return prev;
          }

          const nextLoc = routeData.coordinates[nextIndex];
          setCurrentLocation(nextLoc);

          // Simulate Speed (random between 55 and 75 mph)
          const simulatedSpeed = 55 + Math.random() * 20;
          setCurrentSpeed(simulatedSpeed);

          // Simple instruction trigger logic (demo only)
          if (nextIndex === 5) speak("Head east.");

          // Trigger Weigh Station Prompt at specific index
          if (nextIndex === 20) {
            const weighStation = routeData.pois.find(p => p.type === 'weigh-station');
            if (weighStation && (!weighStation.status || weighStation?.status === 'unknown')) {
              setActivePoiPrompt(weighStation);
              speak("Approaching weigh station. Is it open?");
            }
          }

          return nextIndex;
        });
      }, 1000); // Move every 1 second for smoother speed updates
    }

    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, [isNavigating, routeData]);

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 z-[1000] p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg backdrop-blur-sm"
      >
        {darkMode ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-slate-700" />}
      </button>

      {/* Edit Vehicle Toggle */}
      {!isNavigating && vehicleSpecs && (
        <button
          onClick={() => setShowVehicleSetup(true)}
          className="absolute top-4 right-16 z-[1000] p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg backdrop-blur-sm"
        >
          <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </button>
      )}

      {/* Vehicle Setup Wizard */}
      {showVehicleSetup && (
        <VehicleSetupWizard
          onComplete={(specs) => {
            setVehicleSpecs(specs);
            localStorage.setItem('vehicleSpecs', JSON.stringify(specs));
            setShowVehicleSetup(false);
            speak("Vehicle setup complete.");
          }}
          onClose={() => {
            // Only allow closing if specs exist
            if (vehicleSpecs) {
              setShowVehicleSetup(false);
            }
          }}
        />
      )}

      {!isNavigating ? (
        <RouteInput onStartNavigation={handleStartNavigation} isLoading={isLoading} />
      ) : (
        <>
          {/* Weather Alert Banner */}
          {weatherAlerts.length > 0 && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
              <span className="font-bold">{weatherAlerts[0].message}</span>
            </div>
          )}

          {routeData && (
            <NavigationPanel
              instructions={routeData.instructions}
              distance={routeData.distance}
              duration={routeData.duration}
              routeData={routeData}
              onClose={handleStopNavigation}
            />
          )}

          <ReportButton
            currentLocation={currentLocation}
            onReportAdded={handleReportAdded}
          />
          <Speedometer currentSpeed={currentSpeed} speedLimit={65} />
        </>
      )}

      {/* Profile Button */}
      <button
        onClick={() => setShowGamificationProfile(true)}
        className="fixed top-4 right-4 z-[1000] bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg hover:bg-slate-50 transition-colors"
      >
        <User className="w-6 h-6 text-slate-700 dark:text-slate-200" />
      </button>

      {/* Gamification Profile */}
      <Suspense fallback={<div />}>
        {showGamificationProfile && (
          <ProfilePanel onClose={() => setShowGamificationProfile(false)} />
        )}
      </Suspense>

      {/* Weigh Station Feedback Button (only during navigation) */}
      {isNavigating && (
        <WeighStationFeedback
          currentLocation={currentLocation}
          onFeedback={(status) => {
            if (status === 'ok') {
              addPoints(5, 'Weigh station feedback');
              speak('Thank you for your feedback.');
            } else {
              speak('Thank you. We\'ll improve routing for this area.');
            }
          }}
        />
      )}

      {activePoiPrompt && (
        <PoiPrompt poiName={activePoiPrompt.name} onVote={handlePoiVote} />
      )}

      <Suspense fallback={
        <div className="w-full h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading Weepaa GPS...</p>
          </div>
        </div>
      }>
        <Map
          routeCoordinates={routeData?.coordinates}
          pois={routeData?.pois}
          currentLocation={currentLocation}
          fuelPrices={fuelPrices}
          parkingStatuses={parkingStatuses}
          communityReports={communityReports}
          darkMode={darkMode}
          onReportVerified={handleReportVerified}
        />
      </Suspense>

      <VoiceInput onCommand={handleVoiceCommand} />

      <Suspense fallback={null}>
        <SubscriptionModal />
      </Suspense>

      <OfflineIndicator />
    </div>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <GamificationProvider>
          <App />
        </GamificationProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
