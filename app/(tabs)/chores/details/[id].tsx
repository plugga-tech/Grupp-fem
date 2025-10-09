import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ChoreDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Sysslans information - ID: {id}</Text>
      
      <Text>✅ Sysslan är markerad som gjord!</Text>
      
      <Button onPress={() => router.back()}>Markera som gjord ✓</Button>
    </View>
  );
}   