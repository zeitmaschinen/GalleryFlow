import { createContext } from 'react';
import type { AppContextValue } from './AppContextTypes';

const AppContext = createContext<AppContextValue | null>(null);

export default AppContext;
