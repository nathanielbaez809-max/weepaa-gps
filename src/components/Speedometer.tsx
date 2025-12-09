interface SpeedometerProps {
    currentSpeed: number;
    speedLimit: number;
}

export default function Speedometer({ currentSpeed, speedLimit }: SpeedometerProps) {
    const isSpeeding = currentSpeed > speedLimit;

    return (
        <div className="absolute bottom-4 left-4 z-[1000] flex items-end gap-2">
            {/* Current Speed */}
            <div className={`
        flex flex-col items-center justify-center 
        w-20 h-20 rounded-full border-4 shadow-xl bg-white
        ${isSpeeding ? 'border-red-500 text-red-600' : 'border-gray-800 text-gray-800'}
        transition-colors duration-300
      `}>
                <span className="text-3xl font-black leading-none">{Math.round(currentSpeed)}</span>
                <span className="text-[10px] font-bold uppercase">MPH</span>
            </div>

            {/* Speed Limit */}
            <div className="flex flex-col items-center justify-center w-14 h-16 bg-white border-2 border-black rounded-lg shadow-lg mb-1">
                <span className="text-[8px] font-bold uppercase leading-tight mt-1">Speed</span>
                <span className="text-[8px] font-bold uppercase leading-tight">Limit</span>
                <span className="text-2xl font-black leading-none mt-1">{speedLimit}</span>
            </div>
        </div>
    );
}
