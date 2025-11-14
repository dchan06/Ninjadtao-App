import { Asset } from "expo-asset";
import { useEffect, useRef, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
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
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const animOpacity = useRef(new Animated.Value(0)).current;
  const animScale = useRef(new Animated.Value(0.95)).current;
  const photoScale = useRef(new Animated.Value(1)).current;
  const swipeScale = useRef(new Animated.Value(1)).current;
  const swipeOpacity = useRef(new Animated.Value(1)).current;
  const hideSwipeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flatRef = useRef<FlatList<PhotoItem> | null>(null);

  const resetSwipeTimer = () => {
    if (!isDetailOpen) {
      Animated.timing(swipeOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
    if (hideSwipeTimeout.current) clearTimeout(hideSwipeTimeout.current);
    hideSwipeTimeout.current = setTimeout(() => {
      Animated.timing(swipeOpacity, { toValue: 0, duration: 500, useNativeDriver: true }).start();
    }, 6000);
  };

  // Load local assets once on mount
  useEffect(() => {
    let mounted = true;

    const loadLocal = async () => {
      try {
        const trial = Asset.fromModule(require("@/assets/images/eventsTrial2.jpeg")).uri;
        const sale = Asset.fromModule(require("@/assets/images/eventsSale.jpeg")).uri;

        if (!mounted) return;
        setPhotos([
          { uri: trial, date: "", time: "", description: "" },
          { uri: sale, date: "", time: "", description: "" },
        ]);
      } catch (err) {
        console.warn("Failed to load local assets", err);
      }
    };

    loadLocal();

    // Breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(photoScale, { toValue: 1.03, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(photoScale, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(swipeScale, { toValue: 1.2, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(swipeScale, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    resetSwipeTimer();

    return () => {
      mounted = false;
      if (hideSwipeTimeout.current) clearTimeout(hideSwipeTimeout.current);
    };
  }, []);

  // Fetch events from backend
  const fetchEventsFromBackend = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1.0/user/events/");
      if (!res.ok) return console.warn("Failed to fetch events list:", res.status);
      const text = await res.text();
      let json;
      try { json = text ? JSON.parse(text) : null; } 
      catch { json = null; }

      let arr: any[] = [];
      if (Array.isArray(json)) arr = json;
      else if (json && Array.isArray(json.events)) arr = json.events;

      // Sort by primary key event_id
      arr.sort((a, b) => a.event_id - b.event_id);

      setEventsData(arr);
      console.log("Fetched events sorted by ID:", arr);
    } catch (err) {
      console.warn("Could not fetch events:", err);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchEventsFromBackend(); }, [fetchEventsFromBackend]));

  // Map backend fields to photos (in primary key order)
useEffect(() => {
  if (eventsData.length === 0 || photos.length === 0) return;

  setPhotos((prev) =>
    prev.map((p, i) => {
      const ev = eventsData[i];
      if (!ev) return p;

      // Convert YYYY-MM-DD -> DD-MM-YYYY
      let formattedDate = p.date;
      if (ev.date) {
        const [year, month, day] = ev.date.split("-");
        formattedDate = `${day}-${month}-${year}`;
      }

      const start = ev.start_time ?? "";
      const end = ev.end_time ?? "";
      return {
        ...p,
        date: formattedDate,
        time: start && end ? `${start} - ${end}` : start || end || p.time,
        description: ev.description ?? p.description,
      };
    })
  );
}, [eventsData]);


 const openDetail = (index: number) => {
  if (eventsData && eventsData[index]) {
    const ev = eventsData[index];

    // Format date to DD-MM-YYYY
    let formattedDate = photos[index]?.date ?? "";
    if (ev.date) {
      const [year, month, day] = ev.date.split("-");
      formattedDate = `${day}-${month}-${year}`;
    }

    updatePhotoField(index, {
      date: formattedDate,
      time: ev.start_time && ev.end_time ? `${ev.start_time} - ${ev.end_time}` : (ev.start_time ?? ev.end_time ?? photos[index]?.time ?? ""),
      description: ev.description ?? photos[index]?.description ?? "",
    });
  }

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
    <Pressable style={{ flex: 1 }} onPress={resetSwipeTimer}>
      <FlatList
        ref={flatRef}
        data={photos}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        onScrollBeginDrag={resetSwipeTimer}
        onTouchStart={resetSwipeTimer}
        renderItem={({ item, index }) => (
          <TouchableOpacity activeOpacity={1} onPress={() => openDetail(index)} style={styles.imageContainer}>
            <View style={styles.backgroundOverlay}>
              <Image source={{ uri: item.uri }} style={StyleSheet.absoluteFillObject} blurRadius={20} resizeMode="cover" />
            </View>
            <Animated.Image source={{ uri: item.uri }} style={[styles.image, { transform: [{ scale: photoScale }] }]} resizeMode="cover" />
            {photos.length > 1 && (
              <Animated.View style={[styles.swipeHintTop, { transform: [{ scale: swipeScale }], opacity: swipeOpacity }]}>
                <Text style={styles.swipeArrow}>‹‹</Text>
                <Text style={styles.swipeText}>Swipe</Text>
                <Text style={styles.swipeArrow}>››</Text>
              </Animated.View>
            )}
            <View style={styles.dateOverlayContainer}>
              <Text style={styles.dateInput}>{item.date}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={isDetailOpen} transparent statusBarTranslucent animationType="none">
        <View style={styles.detailBackdrop}>
          <Animated.View style={[styles.detailCard, { opacity: animOpacity, transform: [{ scale: animScale }] }]}>
            <TouchableOpacity onPress={closeDetail} style={styles.closeIconButton} accessibilityLabel="Close details">
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={styles.detailScroll}>
                <Image source={{ uri: photos[currentIndex]?.uri }} style={styles.detailImage} resizeMode="cover" />
                <Text style={styles.sectionLabel}>Date</Text>
                <Text style={styles.readOnlyField}>{photos[currentIndex]?.date}</Text>
                <Text style={styles.sectionLabel}>Time</Text>
                <Text style={styles.readOnlyField}>{photos[currentIndex]?.time}</Text>
                <Text style={styles.sectionLabel}>Description</Text>
                <Text style={[styles.readOnlyField, { minHeight: 80 }]}>{photos[currentIndex]?.description}</Text>
                <TouchableOpacity onPress={() => console.log("Buy Ticket pressed")} style={[styles.closeButton, { backgroundColor: "#28a745", marginBottom: 12 }]}>
                  <Text style={styles.closeButtonText}>Buy Ticket</Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>
    </Pressable>
  );
}

// (Keep your styles as before)


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1c1c0c" },
  imageContainer: { width, height, justifyContent: "center", alignItems: "center" },
  image: { width: width * 0.92, height: height * 0.72, zIndex: 4, borderRadius: 16 },
  shadowLayer: { position: "absolute", borderRadius: 16, zIndex: 1 },
  backgroundOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#111", zIndex: 0 },

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

  detailBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: Platform.OS === "ios" ? 50 : (StatusBar && StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 20),
  },

  detailCard: {
    width: "98%",
    maxWidth: 920,
    height: "86%",
    backgroundColor: "#0b0b0b",
    borderRadius: 16,
    overflow: "hidden",
    paddingTop: 10,
  },

  detailScroll: { paddingBottom: 36 },
  detailImage: { width: "100%", height: 320, backgroundColor: "#111" },
  sectionLabel: { color: "#aaa", fontSize: 14, marginTop: 18, paddingHorizontal: 16 },
  readOnlyField: { color: "#fff", fontSize: 16, padding: 12, marginHorizontal: 16, marginTop: 8, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 8 },

  descriptionInput: { minHeight: 120, color: "#fff", fontSize: 16, padding: 12, marginHorizontal: 16, marginTop: 8, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 8, textAlignVertical: "top" },
  closeButton: { marginTop: 22, alignSelf: "center", paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10, marginBottom: 36, backgroundColor: "#007aff" },
  closeButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  closeIconButton: { position: "absolute", top: 8, left: 8, zIndex: 40, padding: 8, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.04)" },
  closeIconText: { color: "#fff", fontSize: 20, fontWeight: "800" },
});
