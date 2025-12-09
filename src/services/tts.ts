type Priority = 'safety' | 'navigation' | 'info';

interface TTSMessage {
    text: string;
    priority: Priority;
    timestamp: number;
}

const queue: TTSMessage[] = [];
let isSpeaking = false;

export const speak = (text: string, priority: Priority = 'info') => {
    if (!window.speechSynthesis) {
        console.warn("Text-to-speech not supported.");
        return;
    }

    // Safety messages interrupt everything
    if (priority === 'safety') {
        window.speechSynthesis.cancel();
        queue.length = 0; // Clear queue
        isSpeaking = false;
    }

    queue.push({ text, priority, timestamp: Date.now() });
    processQueue();
};

const processQueue = () => {
    if (isSpeaking && queue.length > 0 && queue[0].priority !== 'safety') return;
    if (queue.length === 0) return;

    const message = queue.shift();
    if (!message) return;

    isSpeaking = true;
    const utterance = new SpeechSynthesisUtterance(message.text);

    // Trucker voice tweaks (deeper, slower)
    utterance.rate = 0.9;
    utterance.pitch = 0.9;

    utterance.onend = () => {
        isSpeaking = false;
        processQueue();
    };

    window.speechSynthesis.speak(utterance);
};
