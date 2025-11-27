import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getProducts } from '../services/database';
import { colors } from '../theme/colors';

export default function ListScreen({ navigation }) {
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async (searchTerm = '') => {
        setLoading(true);
        try {
            const data = await getProducts(searchTerm);
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearch(text);
        loadProducts(text);
    };

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
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Zoek op merk of product..."
                    value={search}
                    onChangeText={handleSearch}
                />
            </View>
            {loading ? (
                <ActivityIndicator size="large" color={colors.nebulaEnd} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>Geen producten gevonden.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgColor,
    },
    searchContainer: {
        padding: 16,
        backgroundColor: colors.bgColor,
    },
    searchInput: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderColor,
        fontSize: 16,
    },
    listContent: {
        paddingHorizontal: 16,
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
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: colors.textSecondary,
    },
});
