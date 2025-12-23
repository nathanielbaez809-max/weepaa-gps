import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Moon, Sun, Truck, User } from 'lucide-react';
import RouteInput from './components/RouteInput';
import NavigationPanel from './components/NavigationPanel';
import PoiPrompt from './components/PoiPrompt';
import ReportButton from './components/ReportButton';
import Speedometer from './components/Speedometer';
import { type VehicleSpecs } from './components/VehicleProfile';
import { calculateRoute, type RouteData, type POI } from './services/routing';
import { speak } from './services/tts';
import { checkForWeatherAlerts, type WeatherAlert } from './services/weather';
import { getFuelPrices, type FuelPrice } from './services/fuel';
import { getParkingStatus, type ParkingStatus } from './services/parking';
import { subscribeToReports, addReport, type CommunityReport } from './services/reports';
import { AlertTriangle } from 'lucide-react';
import VoiceInput from './components/VoiceInput';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { GamificationProvider, useGamification } from './contexts/GamificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import OfflineIndicator from './components/OfflineIndicator';
import VehicleSetupWizard from './components/VehicleSetupWizard';
import WeighStationFeedback from './components/WeighStationFeedback';
import Logo from './components/Logo';
import { ToastProvider, useToast } from './components/ToastProvider';

// Lazy Load Heavy Components
const Map = lazy(() => import('./components/Map'));
const SubscriptionModal = lazy(() => import('./components/SubscriptionModal'));
const ProfilePanel = lazy(() => import('./components/ProfilePanel'));

function App() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | undefined>(undefined);
  const [activePoiPrompt, setActivePoiPrompt] = useState<POI | null>(null);

  // Advanced Features State
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('weepaa_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
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

  // Persist dark mode
  useEffect(() => {
    localStorage.setItem('weepaa_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
        showToast({
          type: 'warning',
          title: 'Weather Alert',
          message: alerts[0].message,
          duration: 8000,
        });
        speak(`Caution. ${alerts[0].message} reported on your route.`);
      }

      // Get Fuel Prices
      const prices = await getFuelPrices(data.pois);
      setFuelPrices(prices);
      const bestPrice = prices.find(p => p.isBestPrice);
      if (bestPrice) {
        showToast({
          type: 'success',
          title: 'Best Diesel Price Found',
          message: `$${bestPrice.price.toFixed(2)} at upcoming stop`,
          duration: 5000,
        });
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
            showToast({
              type: 'success',
              title: 'Navigation Started',
              message: 'GPS locked. Safe travels!',
            });
          },
          (error) => {
            console.warn('GPS location unavailable:', error);
            if (data.coordinates.length > 0) {
              setCurrentLocation(data.coordinates[0]);
              speak("Starting navigation. Truck route calculated.");
            }
          }
        );
      } else {
        if (data.coordinates.length > 0) {
          setCurrentLocation(data.coordinates[0]);
          speak("Starting navigation. Truck route calculated.");
        }
      }
    } catch (error) {
      console.error("Failed to calculate route", error);
      showToast({
        type: 'danger',
        title: 'Route Error',
        message: 'Failed to calculate route. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setRouteData(null);
    setCurrentLocation(undefined);
    setActivePoiPrompt(null);
    setCurrentSpeed(0);
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    speak("Navigation cancelled.");
    showToast({
      type: 'info',
      title: 'Navigation Ended',
      message: 'Safe travels!',
    });
  };

  const handlePoiVote = (status: 'open' | 'closed' | 'unknown') => {
    if (!activePoiPrompt || !routeData) return;

    const updatedPois = routeData.pois.map(p =>
      p.id === activePoiPrompt.id ? { ...p, status } : p
    );

    setRouteData({ ...routeData, pois: updatedPois });
    setActivePoiPrompt(null);

    if (status !== 'unknown') {
      speak(`Thanks for reporting. Weigh station marked as ${status}.`);
      addPoints(5, 'Weigh station report');
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
        if (routeData) {
          getFuelPrices(routeData.pois).then(prices => {
            setFuelPrices(prices);
            speak(`Found ${prices.length} fuel stops.`);
          });
        }
        break;
      case 'report_accident':
        if (currentLocation) {
          addReport('accident', currentLocation, user?.uid);
          speak("Accident reported. Thank you.");
          showToast({
            type: 'success',
            title: 'Report Submitted',
            message: 'Thanks for helping the community!',
          });
        } else {
          speak("GPS location unavailable. Cannot report accident.");
        }
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
      let routeIndex = 0;
      simulationInterval.current = window.setInterval(() => {
        routeIndex++;
        if (routeIndex >= routeData.coordinates.length) {
          if (simulationInterval.current) clearInterval(simulationInterval.current);
          speak("You have arrived at your destination.");
          showToast({
            type: 'success',
            title: 'Destination Reached! 🎉',
            message: 'You have arrived. Great job!',
            duration: 10000,
          });
          setCurrentSpeed(0);
          return;
        }

        const nextLoc = routeData.coordinates[routeIndex];
        setCurrentLocation(nextLoc);

        // Simulate Speed
        const simulatedSpeed = 55 + Math.random() * 20;
        setCurrentSpeed(simulatedSpeed);

        // Simple instruction trigger
        if (routeIndex === 5) speak("Head east.");

        // Trigger Weigh Station Prompt
        if (routeIndex === 20) {
          const weighStation = routeData.pois.find(p => p.type === 'weigh-station');
          if (weighStation && (!weighStation.status || weighStation?.status === 'unknown')) {
            setActivePoiPrompt(weighStation);
            speak("Approaching weigh station. Is it open?");
          }
        }
      }, 1000);
    }

    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, [isNavigating, routeData, showToast]);

  return (
    <div className={`relative w-screen h-screen overflow-hidden ${darkMode ? 'dark bg-slate-900' : 'bg-slate-100'}`}>
      {/* Weepaa Logo - shown when not navigating */}
      {!isNavigating && (
        <div className="absolute top-4 left-4 z-[1000]">
          <Logo size="md" />
        </div>
      )}

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        {/* Edit Vehicle Toggle */}
        {!isNavigating && vehicleSpecs && (
          <button
            onClick={() => setShowVehicleSetup(true)}
            className="p-3 glass-panel rounded-xl hover:scale-105 transition-transform"
            aria-label="Edit vehicle"
          >
            <Truck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 glass-panel rounded-xl hover:scale-105 transition-transform"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-warning-500" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700" />
          )}
        </button>

        {/* Profile Button */}
        <button
          onClick={() => setShowGamificationProfile(true)}
          className="p-3 glass-panel rounded-xl hover:scale-105 transition-transform"
          aria-label="Open profile"
        >
          <User className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
      </div>

      {/* Vehicle Setup Wizard */}
      {showVehicleSetup && (
        <VehicleSetupWizard
          onComplete={(specs) => {
            setVehicleSpecs(specs);
            localStorage.setItem('vehicleSpecs', JSON.stringify(specs));
            setShowVehicleSetup(false);
            speak("Vehicle setup complete.");
            showToast({
              type: 'success',
              title: 'Vehicle Setup Complete',
              message: 'Your truck profile has been saved.',
            });
          }}
          onClose={() => {
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
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] animate-fade-in-up">
              <div className="flex items-center gap-3 px-5 py-3 bg-danger-500 text-white rounded-full shadow-xl shadow-danger-500/30">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">{weatherAlerts[0].message}</span>
              </div>
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

      {/* Gamification Profile Panel */}
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

      {/* Map */}
      <Suspense fallback={
        <div className="w-full h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 blur-xl opacity-30 rounded-full animate-pulse" />
              <Loader2 className="relative w-12 h-12 text-primary-600 animate-spin" />
            </div>
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

// App Wrapper with all providers
export default function AppWrapper() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <GamificationProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </GamificationProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
