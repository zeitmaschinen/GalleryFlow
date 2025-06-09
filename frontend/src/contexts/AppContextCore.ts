import { createContext } from 'react';
import type { AppContextValue } from './AppContextTypes';

// Create the context
export const AppContext = createContext<AppContextValue | null>(null);
