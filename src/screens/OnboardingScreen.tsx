import { StyleSheet, Image, Button } from 'react-native'
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
    <Button
      title={'הבא'}
      color='black'
      onPress={() => onboardingRef.current?.goNext()}
    />
  )

  const skip = () => (
    <Button
      title={'דלג'}
      color='black'
      onPress={() => navigation.navigate("Login" as never)}
    />
  )

  const done = () => (
    <Button
      title={'כניסה'}
      color='black'
      onPress={() => navigation.navigate("Login" as never)}
    />
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
      subTitleStyles={{fontSize: 20, maxWidth: '80%', textAlign: 'center', color: 'black'}}
      titleStyles={{fontSize: 30, fontWeight: 'bold', color: 'black'}}
      containerStyles={{paddingBottom: 100}}
      onDone={() => navigation.navigate("Login" as never)}
      onSkip={() => navigation.navigate("Login" as never)}
      NextButtonComponent={next}
      SkipButtonComponent={skip}
      DoneButtonComponent={done}
    />
  )
}


const styles = StyleSheet.create({})
