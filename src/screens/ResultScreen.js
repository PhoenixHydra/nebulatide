import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { FavoritesContext } from '../context/FavoritesContext';
import { getProductById, getRecommendations } from '../services/database';
import { colors } from '../theme/colors';

export default function ResultScreen({ route, navigation }) {
    const { productId } = route.params;
    const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [showAllRecs, setShowAllRecs] = useState(false);

    useEffect(() => {
        loadData();
    }, [productId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const foundProduct = await getProductById(productId);
            setProduct(foundProduct);
            if (foundProduct) {
                const recs = await getRecommendations(foundProduct.category, foundProduct.rating);
                setRecommendations(recs);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (rating) => {
        if (!rating) return colors.scoreC;
        const letter = rating.charAt(0).toUpperCase();
        const colorMap = {
            'A': colors.scoreA,
            'B': colors.scoreB,
            'C': colors.scoreC,
            'D': colors.scoreD,
            'E': colors.scoreE
        };
        return colorMap[letter] || colors.scoreC;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.nebulaEnd} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.container}>
                <Text>Product niet gevonden.</Text>
            </View>
        );
    }

    const reasons = product.reasons || [];

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(product.id)}
            >
                <Text style={[styles.favoriteIcon, isFavorite(product.id) && styles.favoriteActive]}>
                    {isFavorite(product.id) ? '❤️' : '🤍'}
                </Text>
            </TouchableOpacity>

            <View style={styles.header}>
                <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="contain" />
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBrand}>van {product.brand}</Text>
            </View>

            <View style={styles.scoreCard}>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(product.rating) }]}>
                    <Text style={styles.scoreText}>{product.rating}</Text>
                </View>
                <Text style={styles.scoreLabel}>Milieu Rating</Text>
            </View>

            <View style={styles.breakdownSection}>
                {reasons.map((reason, index) => {
                    const icon = reason.startsWith('✅') ? '✅' : (reason.startsWith('❌') ? '❌' : '⚠️');
                    const text = reason.substring(2).trim();
                    return (
                        <View key={index} style={styles.breakdownItem}>
                            <Text style={styles.breakdownIcon}>{icon}</Text>
                            <Text style={styles.breakdownText}>{text}</Text>
                        </View>
                    );
                })}
            </View>

            {recommendations.length > 0 && (
                <View style={styles.recommendationsSection}>
                    <Text style={styles.recTitle}>Betere Keuzes</Text>
                    {(showAllRecs ? recommendations : recommendations.slice(0, 3)).map(rec => (
                        <TouchableOpacity
                            key={rec.id}
                            style={styles.recCard}
                            onPress={() => navigation.push('Result', { productId: rec.id })}
                        >
                            <Image source={{ uri: rec.imageUrl }} style={styles.recImage} resizeMode="contain" />
                            <View style={styles.recTextContainer}>
                                <Text style={styles.recBrand}>{rec.brand}</Text>
                                <Text style={styles.recName}>{rec.name}</Text>
                            </View>
                            <View style={[styles.recRating, { backgroundColor: getScoreColor(rec.rating) }]}>
                                <Text style={styles.recRatingText}>{rec.rating}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                    {!showAllRecs && recommendations.length > 3 && (
                        <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAllRecs(true)}>
                            <Text style={styles.showMoreText}>Meer alternatieven</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.cardBg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 20,
        zIndex: 10,
    },
    favoriteIcon: {
        fontSize: 28,
    },
    favoriteActive: {
        // color handled by emoji
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    productImage: {
        width: 120,
        height: 120,
        marginBottom: 12,
    },
    productName: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    productBrand: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 4,
    },
    scoreCard: {
        backgroundColor: colors.bgColor,
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        margin: 16,
    },
    scoreBadge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    scoreText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    scoreLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    breakdownSection: {
        paddingHorizontal: 16,
        gap: 10,
    },
    breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgColor,
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    breakdownIcon: {
        fontSize: 20,
        marginRight: 14,
    },
    breakdownText: {
        fontSize: 14,
        color: colors.textPrimary,
        flex: 1,
    },
    recommendationsSection: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: colors.borderColor,
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    recTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 10,
    },
    recCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgColor,
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    recImage: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    recTextContainer: {
        flex: 1,
        marginLeft: 10,
    },
    recBrand: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    recName: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    recRating: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recRatingText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    showMoreButton: {
        marginTop: 10,
        padding: 12,
        backgroundColor: colors.nebulaStart,
        borderRadius: 10,
        alignItems: 'center',
    },
    showMoreText: {
        color: 'white',
        fontWeight: '600',
    },
});
