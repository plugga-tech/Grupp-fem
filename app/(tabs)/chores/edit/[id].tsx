import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EditChoreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Ändra syssla - ID: {id}</Text>
      <Button>Spara</Button>
      <Button onPress={() => router.back()}>Stäng</Button>
    </View>
  );
}