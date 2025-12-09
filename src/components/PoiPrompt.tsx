import { ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';

interface PoiPromptProps {
    poiName: string;
    onVote: (status: 'open' | 'closed' | 'unknown') => void;
}

export default function PoiPrompt({ poiName, onVote }: PoiPromptProps) {
    return (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[1000] bg-white p-6 rounded-xl shadow-2xl w-80 border-2 border-blue-500 animate-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-center mb-2 text-slate-800">Update Status</h3>
            <p className="text-center text-slate-600 mb-4">Is <span className="font-semibold text-blue-600">{poiName}</span> open?</p>

            <div className="flex justify-between gap-2">
                <button
                    onClick={() => onVote('open')}
                    className="flex-1 flex flex-col items-center gap-1 p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                >
                    <ThumbsUp className="w-6 h-6" />
                    <span className="text-xs font-medium">Open</span>
                </button>

                <button
                    onClick={() => onVote('closed')}
                    className="flex-1 flex flex-col items-center gap-1 p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                >
                    <ThumbsDown className="w-6 h-6" />
                    <span className="text-xs font-medium">Closed</span>
                </button>

                <button
                    onClick={() => onVote('unknown')}
                    className="flex-1 flex flex-col items-center gap-1 p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                >
                    <HelpCircle className="w-6 h-6" />
                    <span className="text-xs font-medium">Not Sure</span>
                </button>
            </div>
        </div>
    );
}
