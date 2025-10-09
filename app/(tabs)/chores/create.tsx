import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function CreateChoreScreen() {
  const router = useRouter();

  return (
    <View>
      <Text>Skapa ny syssla</Text>
      <Button>Spara</Button>
      <Button onPress={() => router.back()}>Stäng</Button>
    </View>
  );
}