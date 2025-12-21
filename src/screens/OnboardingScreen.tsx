import { StyleSheet, Image, Button, View } from 'react-native'
import React, { useRef } from 'react'
import Onboarding from 'react-native-onboarding-swiper';
import { Colors } from '../constants';
import { useNavigation } from '@react-navigation/native';

export default function OnboardingScreen() {
  const onboardingRef = useRef<Onboarding>(null);
  const image = () => (
    <Image source={require('../../assets/images/amishav-icon.png')} width={150} height={96} style={{width: 150, height: 96}} />
  )

  const navigation = useNavigation();

  const next = () => (
    <View style={{paddingRight: 20}}>
      <Button
        title={'הבא'}
        color={Colors.mainDark}
        onPress={() => onboardingRef.current?.goNext()}
        />
    </View>
  )

  const skip = () => (
    <View style={{paddingLeft: 20}}>
      <Button
        title={'דלג'}
        color={Colors.mainDark}
        onPress={() => navigation.navigate("Login" as never)}
        />
    </View>
  )

  const done = () => (
    <View style={{paddingRight: 20}}>
      <Button
        title={'כניסה'}
        color={Colors.mainDark}
        onPress={() => navigation.navigate("Login" as never)}
        />
    </View>
  )

  return (
    <Onboarding
      ref={onboardingRef}
      pages={[
        {
          backgroundColor: Colors.primaryLight,
          image: image(),
          title: 'לעבוד',
          subtitle: 'תשלטו על המשמרות שלכם, תהיו גמישים ללא חפירות והתחייבויות',
        },
        {
          backgroundColor: Colors.primaryLight,
          image: image(),
          title: 'להרוויח',
          subtitle: 'תראה כמה עשית ממש כאן, תוך כדי המשמרת!',
        },
        {
          backgroundColor: Colors.primaryLight,
          image: image(),
          title: 'להתקדם',
          subtitle: "תנצלו את הזמן ואת הפוטנציאל שלכם!",
        },
      ]}

      subTitleStyles={{fontSize: 20, maxWidth: '80%', textAlign: 'center', color: Colors.mainDark}}
      titleStyles={{fontSize: 30, fontWeight: 'bold', color: Colors.mainDark}}
      containerStyles={{paddingBottom: 100}}
      onDone={() => navigation.navigate("Login" as never)}
      onSkip={() => navigation.navigate("Login" as never)}
      bottomBarHighlight={false}
      NextButtonComponent={next}
      SkipButtonComponent={skip}
      DoneButtonComponent={done}
    />
  )
}


const styles = StyleSheet.create({})
