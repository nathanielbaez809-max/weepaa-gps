export interface TruckSpecs {
    make: string;
    model: string;
    height: { ft: number; in: number };
    weight: number; // lbs
    length: number; // ft
    axles: number;
}

export const lookupTruckSpecs = async (make: string, model: string): Promise<TruckSpecs> => {
    try {
        // Use Gemini API to look up truck specs
        const prompt = `You are a commercial vehicle database. Given a truck make and model, return ONLY a JSON object with these exact fields:
{
  "height_ft": <number>,
  "height_in": <number>,
  "weight_lbs": <number>,
  "length_ft": <number>,
  "axles": <number>
}

Truck: ${make} ${model}

Return realistic specifications for this commercial truck. If you don't know the exact specs, provide typical values for this class of truck. Return ONLY the JSON, no other text.`;

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + import.meta.env.VITE_GEMINI_API_KEY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const specs = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

        return {
            make,
            model,
            height: {
                ft: specs.height_ft || 13,
                in: specs.height_in || 6
            },
            weight: specs.weight_lbs || 80000,
            length: specs.length_ft || 53,
            axles: specs.axles || 5
        };
    } catch (error) {
        console.error('Error looking up truck specs:', error);
        // Fallback to defaults
        return {
            make,
            model,
            height: { ft: 13, in: 6 },
            weight: 80000,
            length: 53,
            axles: 5
        };
    }
};
