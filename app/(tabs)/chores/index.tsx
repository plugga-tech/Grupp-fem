import { View, Text } from 'react-native';
import { Button, Card, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function ChoreScreen() {
  const router = useRouter();

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton icon="chevron-left" onPress={() => {}} />
        <Text>idag</Text>
        <IconButton icon="chevron-right" onPress={() => {}} />
      </View>

      <Card onPress={() => router.push('/chores/details/1')}>
        <Text>Laga mat</Text>
      </Card>
      
      <Card onPress={() => router.push('/chores/details/2')}>
        <Text>Damma</Text>
      </Card>
      
      <Button onPress={() => router.push('/chores/create')}>Lägg till</Button>
      <Button onPress={() => router.push('/chores/edit/1')}>Ändra</Button>
    </View>
  );
}