import React, { useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FavoritesContext } from '../context/FavoritesContext';
import { productDatabase } from '../data/products';
import { colors } from '../theme/colors';

export default function FavoritesScreen({ navigation }) {
    const { favorites } = useContext(FavoritesContext);
    const favoriteProducts = productDatabase.filter(p => favorites.includes(p.id));

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('Result', { productId: item.id })}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="contain" />
            <View style={styles.itemTextContainer}>
                <Text style={styles.itemBrand}>{item.brand}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={favoriteProducts}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Je hebt nog geen favorieten.</Text>
                        <Text style={styles.emptySubText}>Druk op het hartje bij een product.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgColor,
    },
    listContent: {
        padding: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderColor,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    itemTextContainer: {
        marginLeft: 15,
        flex: 1,
    },
    itemBrand: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    itemName: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
});
