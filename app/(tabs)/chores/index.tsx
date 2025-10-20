import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, IconButton } from 'react-native-paper';

export default function ChoreScreen() {
  const router = useRouter();

  const chores = [
    { id: 1, name: 'Laga mat' },
    { id: 2, name: 'Damma' },
    { id: 3, name: 'Diska' },
    { id: 4, name: 'Ta hand om My' },
    { id: 5, name: 'Torka golvet' },
    { id: 6, name: 'Vattna blommor' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hemma</Text>
        <IconButton 
          icon="plus-circle-outline" 
          size={36}
          onPress={() => router.push('/chores/create')}
          style={styles.plusButton}
        />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {chores.map((chore) => (
          <Card 
            key={chore.id} 
            style={styles.card}
            onPress={() => router.push(`/chores/details/${chore.id}`)}
          >
            <Card.Content>
              <Text style={styles.choreName}>{chore.name}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  plusButton: {
    position: 'absolute',
    right: 19,
    top:30,
    margin: 0,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  choreName: {
    fontSize: 18,
    fontWeight: '500',
  },
});