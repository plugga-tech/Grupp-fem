import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

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
      <Text style={styles.title}>Hemma</Text>
    
      <View style={styles.header}>
        <IconButton icon="chevron-left" size={24} onPress={() => {}} />
        <Text style={styles.dateText}>idag</Text>
        <IconButton icon="chevron-right" size={24} onPress={() => {}} />
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

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          icon="plus"
          style={styles.addButton}
          labelStyle={styles.buttonLabel}
          onPress={() => router.push('/chores/create')}
        >
          Lägg till
        </Button>
        <Button 
          mode="contained"
          icon="pencil"
          style={styles.editButton}
          labelStyle={styles.buttonLabel}
          onPress={() => router.push('/chores/edit/1')}
        >
          Ändra
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    gap: 16,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#4DD0C1',
    borderRadius: 24,
    paddingVertical: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#FF9F6E',
    borderRadius: 24,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});