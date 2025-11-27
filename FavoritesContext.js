import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem('nebulaTideFavorites');
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error('Failed to load favorites', error);
        }
    };

    const toggleFavorite = async (productId) => {
        let newFavorites;
        if (favorites.includes(productId)) {
            newFavorites = favorites.filter(id => id !== productId);
        } else {
            newFavorites = [...favorites, productId];
        }
        setFavorites(newFavorites);
        try {
            await AsyncStorage.setItem('nebulaTideFavorites', JSON.stringify(newFavorites));
        } catch (error) {
            console.error('Failed to save favorites', error);
        }
    };

    const isFavorite = (productId) => {
        return favorites.includes(productId);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};
