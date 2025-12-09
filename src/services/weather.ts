export interface WeatherAlert {
    id: string;
    type: 'wind' | 'snow' | 'ice' | 'storm';
    severity: 'moderate' | 'severe' | 'extreme';
    message: string;
    location: [number, number];
    radius: number; // miles
}

export const checkForWeatherAlerts = async (
    routeCoordinates: [number, number][]
): Promise<WeatherAlert[]> => {
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const alerts: WeatherAlert[] = [];

    // 30% chance of a weather alert on the route
    if (Math.random() > 0.7 && routeCoordinates.length > 20) {
        const index = Math.floor(Math.random() * (routeCoordinates.length - 10)) + 5;
        const location = routeCoordinates[index];

        const types: WeatherAlert['type'][] = ['wind', 'snow', 'ice', 'storm'];
        const type = types[Math.floor(Math.random() * types.length)];

        let message = "";
        switch (type) {
            case 'wind': message = "High Wind Warning: Gusts up to 60mph"; break;
            case 'snow': message = "Heavy Snow: Visibility < 1/4 mile"; break;
            case 'ice': message = "Black Ice Reported on Bridges"; break;
            case 'storm': message = "Severe Thunderstorm Warning"; break;
        }

        alerts.push({
            id: `alert-${Date.now()}`,
            type,
            severity: 'severe',
            message,
            location,
            radius: 10
        });
    }

    return alerts;
};
