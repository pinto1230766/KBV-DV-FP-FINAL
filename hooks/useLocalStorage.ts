import { useState, useEffect, Dispatch, SetStateAction } from 'react';

// A custom hook to synchronize state with localStorage.
// It abstracts away the logic of reading, parsing, and writing.
function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        // This function runs only once on initial render to get the initial state.
        try {
            const item = window.localStorage.getItem(key);
            // If a value exists in localStorage, parse it.
            if (item) {
                return JSON.parse(item);
            }
            // If not, compute the initial value from the provided function or use the value directly.
            const initial = initialValue instanceof Function ? initialValue() : initialValue;
            // Store the initial value in localStorage.
            window.localStorage.setItem(key, JSON.stringify(initial));
            return initial;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            // Fallback to the initial value if there's an error.
            return initialValue instanceof Function ? initialValue() : initialValue;
        }
    });

    // This effect runs whenever the storedValue or key changes.
    useEffect(() => {
        try {
            // Write the current state to localStorage.
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}

export default useLocalStorage;