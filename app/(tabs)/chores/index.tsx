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

