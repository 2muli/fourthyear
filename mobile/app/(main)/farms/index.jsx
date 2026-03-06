import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLanguage } from '@/context/LanguageContext';
import i18n from '../../../src/i18n';

export default function index() {
  const {language}=useLanguage();

  // Sync i18n with language context
  useEffect(()=>{
    i18n.locale=language;
  },[language])

  return (
    <SafeAreaView>
    <View>
      <Text>{i18n.t("Farm")}</Text>
    </View>
    </SafeAreaView>
  )
}