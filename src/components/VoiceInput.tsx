import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
    onCommand: (command: string) => void;
}

export default function VoiceInput({ onCommand }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isSupported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    const handleCommand = useCallback((text: string) => {
        if (text.includes("fuel") || text.includes("gas") || text.includes("diesel")) {
            onCommand("find_fuel");
        } else if (text.includes("accident") || text.includes("crash")) {
            onCommand("report_accident");
        } else if (text.includes("stop") || text.includes("cancel")) {
            onCommand("stop_navigation");
        } else {
            onCommand("unknown");
        }
    }, [onCommand]);

    useEffect(() => {
        if (isSupported) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                setTranscript(transcript);
                handleCommand(transcript);
                setIsListening(false);
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        } else {
            console.warn("Speech Recognition API not supported.");
        }
    }, [isSupported, handleCommand]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
            setTranscript("Listening...");
        }
    };

    if (!isSupported) return null;

    return (
        <div className="absolute bottom-32 right-4 z-[1000]">
            <button
                onClick={toggleListening}
                className={`p-4 rounded-full shadow-lg transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
            >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            {isListening && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/80 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                    {transcript}
                </div>
            )}
        </div>
    );
}
