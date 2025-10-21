import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getChores } from '../../../api/chores';
import { useAtom } from 'jotai';
import { currentHouseholdAtom, currentUserAtom } from '../../../atoms';

export default function ChoreScreen() {
  const router = useRouter();
  const [currentHousehold] = useAtom(currentHouseholdAtom);
  const [currentUser] = useAtom(currentUserAtom);

  const { data: chores, isLoading, isError, refetch } = useQuery({
    queryKey: ['chores', currentHousehold?.id],
    queryFn: () => getChores(currentHousehold?.id || ''),
    enabled: !!currentHousehold?.id,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <View style={styles.header}>
          <Text style={styles.title}>Hemma</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Laddar sysslor...</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.center]}>
        <View style={styles.header}>
          <Text style={styles.title}>Hemma</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Kunde inte ladda sysslor</Text>
          <IconButton icon="refresh" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
   
      <View style={styles.header}>
        <Text style={styles.title}>Hemma</Text>
        {currentUser?.is_admin && (
          <IconButton 
            icon="plus-circle-outline" 
            size={36}
            onPress={() => router.push('/chores/create')}
            style={styles.plusButton}
            iconColor="#000000"
          />
        )}
      </View>

    
      {!chores || chores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconText}>📋</Text>
          </View>
          <Text style={styles.emptyTitle}>Inga sysslor än</Text>
          <Text style={styles.emptySubtitle}>
            Tryck på + för att lägga till din första syssla
          </Text>
        </View>
      ) : (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
  },
  plusButton: {
    position: 'absolute',
    right: 16,
    top: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    borderStyle: 'dashed',
  },
  iconText: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#404040',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#808080',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 16,
  },
});