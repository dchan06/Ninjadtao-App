import { Asset } from "expo-asset";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

type PhotoItem = {
  uri: string;
  date: string;
  time: string;
  description: string;
};

export default function Events() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const animOpacity = useRef(new Animated.Value(0)).current;
  const animScale = useRef(new Animated.Value(0.95)).current;
  const photoScale = useRef(new Animated.Value(1)).current;
  const swipeAnim = useRef(new Animated.Value(1)).current; // for breathing effect

  const flatRef = useRef<FlatList<PhotoItem> | null>(null);

  useEffect(() => {
    const load = async () => {
      const trial = Asset.fromModule(require("@/assets/images/eventsTrial2.jpeg")).uri;
      const sale = Asset.fromModule(require("@/assets/images/eventsSale.jpeg")).uri;

      setPhotos([
        { uri: trial, date: "22-11-2025", time: "19:00 - 21:00", description: "Friendly open evening with sparring." },
        { uri: sale, date: "23-11-2025", time: "17:00 - 19:00", description: "Special discounted training sessions." },
      ]);
    };
    load();

    // Synchronized breathing animation duration
    const duration = 2000;

    // Synchronized breathing animation for photo and swipe hint
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(photoScale, { toValue: 1.03, duration, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(swipeAnim, { toValue: 0.5, duration, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ]),
        Animated.parallel([
          Animated.timing(photoScale, { toValue: 1, duration, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(swipeAnim, { toValue: 1, duration, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ]),
      ])
    ).start();
  }, []);

  const openDetail = (index: number) => {
    setCurrentIndex(index);
    setIsDetailOpen(true);
    animOpacity.setValue(0);
    animScale.setValue(0.95);
    Animated.parallel([
      Animated.timing(animOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(animScale, { toValue: 1, duration: 350, easing: Easing.out(Easing.back(0.4)), useNativeDriver: true }),
    ]).start();
  };

  const closeDetail = () => {
    Animated.parallel([
      Animated.timing(animOpacity, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(animScale, { toValue: 0.95, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(() => setIsDetailOpen(false));
  };

  const updatePhotoField = (index: number, fields: Partial<PhotoItem>) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, ...fields } : p)));
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index ?? 0);
  }).current;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Gallery */}
      <FlatList
        ref={flatRef}
        data={photos}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity activeOpacity={1} onPress={() => openDetail(index)} style={styles.imageContainer}>
            {/* Blurred background */}
            <View style={styles.backgroundOverlay}>
              <Image source={{ uri: item.uri }} style={StyleSheet.absoluteFillObject} blurRadius={20} resizeMode="cover" />
            </View>

            {/* Soft 3D shadows */}
            <View style={[styles.shadowLayer, { width: width * 0.92, height: height * 0.72, left: -6, backgroundColor: 'rgba(60,60,60,0.24)' }]} />
            <View style={[styles.shadowLayer, { width: width * 0.92, height: height * 0.72, right: -6, backgroundColor: 'rgba(40,40,40,0.18)' }]} />
            <View style={[styles.shadowLayer, { width: width * 0.92, height: height * 0.72, top: 6, backgroundColor: 'rgba(30,30,30,0.12)' }]} />

            {/* Main photo */}
            <Animated.Image
              source={{ uri: item.uri }}
              style={[styles.image, { transform: [{ scale: photoScale }] }]}
              resizeMode="cover"
            />

            {/* Swipe hint above date box */}
            {photos.length > 1 && (
              <Animated.View style={[styles.swipeHintTop, { opacity: swipeAnim }]}>
                <Text style={styles.swipeArrow}>‹‹</Text>
                <Text style={styles.swipeText}>Swipe</Text>
                <Text style={styles.swipeArrow}>››</Text>
              </Animated.View>
            )}

            {/* Date overlay */}
            <View style={styles.dateOverlayContainer}>
              <TextInput
                style={styles.dateInput}
                value={item.date}
                onChangeText={(t) => updatePhotoField(index, { date: t })}
                placeholder="DD-MM-YYYY"
                placeholderTextColor="rgba(255,255,255,0.7)"
              />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Details modal */}
      <Modal visible={isDetailOpen} transparent statusBarTranslucent animationType="none">
        <View style={styles.detailBackdrop}>
          <Animated.View style={[styles.detailCard, { opacity: animOpacity, transform: [{ scale: animScale }] }]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={styles.detailScroll}>
                <Image source={{ uri: photos[currentIndex]?.uri }} style={styles.detailImage} resizeMode="cover" />

                <Text style={styles.sectionLabel}>Date</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={photos[currentIndex]?.date}
                  onChangeText={(t) => updatePhotoField(currentIndex, { date: t })}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                />

                <Text style={styles.sectionLabel}>Time</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={photos[currentIndex]?.time}
                  onChangeText={(t) => updatePhotoField(currentIndex, { time: t })}
                  placeholder="HH:MM - HH:MM"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                />

                <Text style={styles.sectionLabel}>Description</Text>
                <TextInput
                  style={styles.descriptionInput}
                  value={photos[currentIndex]?.description}
                  onChangeText={(t) => updatePhotoField(currentIndex, { description: t })}
                  placeholder="Enter event description..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  multiline
                />

                <TouchableOpacity onPress={closeDetail} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Done</Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1c1c1c" },
  imageContainer: { width, height, justifyContent: "center", alignItems: "center" },

  // Main photo
  image: { width: width * 0.92, height: height * 0.72, zIndex: 4, borderRadius: 16 },

  // Shadows
  shadowLayer: { position: "absolute", borderRadius: 16, zIndex: 1 },

  // Blurred background
  backgroundOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#111", zIndex: 0 },

  // Swipe hint above date
  swipeHintTop: {
    position: "absolute",
    top: 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 7,
  },
  swipeArrow: { color: "#aaa", fontSize: 20, fontWeight: "700", marginHorizontal: 4 },
  swipeText: { color: "#aaa", fontSize: 18, fontWeight: "600" },

  // Date overlay
  dateOverlayContainer: {
    position: "absolute",
    top: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 18,
    backgroundColor: "rgba(255,165,0,0.92)",
    shadowColor: "#ffb347",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 6,
  },
  dateInput: { color: "#fff", fontSize: 20, fontWeight: "700", textAlign: "center", minWidth: 140 },

  // Modal
  detailBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: Platform.OS === "ios" ? 44 : 28,
  },
  detailCard: { width: "98%", maxWidth: 920, height: "88%", backgroundColor: "#0b0b0b", borderRadius: 16, overflow: "hidden" },
  detailScroll: { paddingBottom: 36 },
  detailImage: { width: "100%", height: 320, backgroundColor: "#111" },
  sectionLabel: { color: "#aaa", fontSize: 14, marginTop: 18, paddingHorizontal: 16 },
  fieldInput: { color: "#fff", fontSize: 16, padding: 12, marginHorizontal: 16, marginTop: 8, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 8 },
  descriptionInput: { minHeight: 120, color: "#fff", fontSize: 16, padding: 12, marginHorizontal: 16, marginTop: 8, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 8, textAlignVertical: "top" },
  closeButton: { marginTop: 22, alignSelf: "center", backgroundColor: "#007aff", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10, marginBottom: 36 },
  closeButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
