import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Platform, Alert } from 'react-native';
import { Svg, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { getProductByBarcode } from '../services/database';

// Platform specific imports
let NativeBarcodeScanner, NativeCameraView;
let ExpoCameraView, useExpoPermissions;

if (Platform.OS !== 'web') {
    try {
        const nativeScanner = require('@pushpendersingh/react-native-scanner');
        NativeBarcodeScanner = nativeScanner.BarcodeScanner;
        NativeCameraView = nativeScanner.CameraView;
    } catch (e) {
        console.warn("Failed to load native scanner:", e);
    }
} else {
    try {
        const expoCamera = require('expo-camera');
        ExpoCameraView = expoCamera.CameraView;
        useExpoPermissions = expoCamera.useCameraPermissions;
    } catch (e) {
        console.warn("Failed to load expo-camera:", e);
    }
}

export default function HomeScreen({ navigation }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // Expo Camera specific state
    const [expoPermission, requestExpoPermission] = useExpoPermissions ? useExpoPermissions() : [null, null];

    useEffect(() => {
        if (Platform.OS !== 'web') {
            checkNativePermission();
            return () => {
                if (NativeBarcodeScanner) NativeBarcodeScanner.stopScanning();
            };
        } else {
            // Web permission handling via expo-camera hook
            if (expoPermission) {
                setHasPermission(expoPermission.granted);
            }
        }
    }, [expoPermission]);

    const checkNativePermission = async () => {
        if (!NativeBarcodeScanner) return;
        try {
            const granted = await NativeBarcodeScanner.hasCameraPermission();
            setHasPermission(granted);
        } catch (e) {
            console.log("Error checking permission:", e);
            setHasPermission(false);
        }
    };

    const requestPermission = async () => {
        if (Platform.OS !== 'web') {
            if (!NativeBarcodeScanner) return;
            try {
                const granted = await NativeBarcodeScanner.requestCameraPermission();
                setHasPermission(granted);
            } catch (e) {
                console.log("Error requesting permission:", e);
                Alert.alert("Error", "Could not request camera permission.");
            }
        } else {
            if (requestExpoPermission) {
                const result = await requestExpoPermission();
                setHasPermission(result.granted);
            }
        }
    };

    const startScanning = async () => {
        if (!hasPermission) {
            await requestPermission();
            // Re-check permission after request
            if (Platform.OS === 'web' && !expoPermission?.granted) return;
            if (Platform.OS !== 'web' && !hasPermission) return; // Note: state update might be async, this is simplified
        }

        setScanned(false);
        setIsScanning(true);

        if (Platform.OS !== 'web' && NativeBarcodeScanner) {
            try {
                await NativeBarcodeScanner.startScanning((barcodes) => {
                    if (barcodes.length > 0) {
                        const barcode = barcodes[0];
                        handleBarCodeScanned(barcode.data);
                    }
                });
            } catch (e) {
                console.error("Failed to start scanning:", e);
                setIsScanning(false);
            }
        }
    };

    const stopScanning = async () => {
        if (Platform.OS !== 'web' && NativeBarcodeScanner) {
            try {
                await NativeBarcodeScanner.stopScanning();
            } catch (e) {
                console.error("Failed to stop scanning:", e);
            }
        }
        setIsScanning(false);
    };

    const handleBarCodeScanned = async (data) => {
        // Prevent multiple scans
        if (Platform.OS !== 'web' && NativeBarcodeScanner) {
            await NativeBarcodeScanner.stopScanning();
        }
        setScanned(true);
        setIsScanning(false);

        console.log("Scanned:", data);
        const product = await getProductByBarcode(data);
        if (product) {
            navigation.navigate('Result', { productId: product.id });
        } else {
            Alert.alert("Niet gevonden", `Product niet gevonden voor barcode: ${data}`, [
                { text: "OK", onPress: () => { } }
            ]);
        }
    };

    const handleExpoBarCodeScanned = ({ type, data }) => {
        if (scanned) return;
        handleBarCodeScanned(data);
    };

    const takePicture = () => {
        stopScanning();
        setScanned(true);
        // Simulate finding a product via visual search
        navigation.navigate('Result', { productId: 1 });
    };

    if (hasPermission === false && isScanning) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center', marginBottom: 20 }}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
                <Button onPress={() => setIsScanning(false)} title="Cancel" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Svg width="100" height="50" viewBox="0 0 100 50">
                    <Defs>
                        <LinearGradient id="nebulaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={colors.nebulaStart} stopOpacity="1" />
                            <Stop offset="100%" stopColor={colors.nebulaEnd} stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Path fill="url(#nebulaGradient)" d="M0,20 Q25,0 50,20 T100,20 L100,50 L0,50 Z" />
                </Svg>
                <Text style={styles.title}>NebulaTide</Text>
            </View>

            <View style={styles.scanArea}>
                {isScanning ? (
                    <View style={styles.cameraContainer}>
                        {Platform.OS === 'web' ? (
                            ExpoCameraView ? (
                                <ExpoCameraView
                                    style={styles.camera}
                                    facing="back"
                                    onBarcodeScanned={scanned ? undefined : handleExpoBarCodeScanned}
                                />
                            ) : <Text style={{ color: 'white' }}>Camera not supported on web</Text>
                        ) : (
                            NativeCameraView ? (
                                <NativeCameraView style={styles.camera} />
                            ) : <Text style={{ color: 'white' }}>Camera not loaded</Text>
                        )}

                        <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
                            <View style={styles.shutterInner} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeButton} onPress={stopScanning}>
                            <Text style={styles.closeButtonText}>Sluiten</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity style={styles.scanPlaceholder} onPress={startScanning}>
                            <Text style={styles.scanPlaceholderText}>Tik om te scannen</Text>
                        </TouchableOpacity>
                        <Text style={styles.scanText}>Richt op een barcode</Text>
                    </>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={() => navigation.navigate('List')}
                >
                    <Text style={styles.ctaButtonText}>Simuleer via lijst</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Favorites')}
                >
                    <Text style={styles.secondaryButtonText}>Mijn Favorieten</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgColor,
        padding: 20,
        justifyContent: 'space-between',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 10,
        color: colors.nebulaStart,
    },
    scanArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    scanPlaceholder: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: colors.nebulaEnd,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    scanPlaceholderText: {
        color: colors.textSecondary,
    },
    cameraContainer: {
        width: '100%',
        height: 400,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    shutterButton: {
        position: 'absolute',
        bottom: 80,
        alignSelf: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    closeButton: {
        position: 'absolute',
        bottom: 40, // Increased base bottom margin
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', // Slightly darker for better contrast
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        zIndex: 10, // Ensure it's on top
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    scanText: {
        fontSize: 18,
        color: colors.textPrimary,
        marginTop: 20,
    },
    buttonContainer: {
        gap: 10,
        marginBottom: 40,
    },
    ctaButton: {
        backgroundColor: colors.nebulaStart,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    ctaButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#e5e5e5',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '500',
    },
});
