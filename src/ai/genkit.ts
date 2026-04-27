import "dotenv/config";
import {genkit} from 'genkit';
import {googleAI, gemini15Flash} from '@genkit-ai/googleai';

// Initialize Genkit

export const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});
