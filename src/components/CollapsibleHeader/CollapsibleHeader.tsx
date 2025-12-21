import { useRef } from "react";
import { Animated, Dimensions, View, ImageBackground, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants";

interface CollapsibleHeaderProps {
  image: any;
  title?: string;
  maxHeight?: number;
  minHeight?: number;
  children: React.ReactNode;
}

export default function CollapsibleHeader({ image, title, maxHeight = 240, minHeight = 80, children }: CollapsibleHeaderProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_SCROLL_DISTANCE = maxHeight - minHeight;
  const screenWidth = Dimensions.get('window').width;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [maxHeight, minHeight],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.7, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        style={{ flex: 1 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={{ height: maxHeight }} />
        {children}
      </Animated.ScrollView>

      <Animated.View
        style={[
          styles.header,
          {
            height: headerHeight,
            opacity: headerOpacity,
            width: screenWidth,
          },
        ]}
      >
        <ImageBackground source={image} style={styles.imageBackground} resizeMode="cover" blurRadius={2}>
          {title && <Text style={styles.headerText}>{title}</Text>}
        </ImageBackground>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: Colors.mainLight,
    fontSize: 72,
    fontWeight: '700',
  },
});
