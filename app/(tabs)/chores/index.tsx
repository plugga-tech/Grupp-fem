import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';

export default function ChoreScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Hemma</Text>
        <IconButton 
          icon="plus-circle-outline" 
          size={36}
          onPress={() => router.push('/chores/create')}
          style={styles.plusButton}
          iconColor="#000000"
        />
      </View>

      {/* Tom lista? har lagt till en Placeholder/skeleton */}
      <View style={styles.emptyContainer}>
        <View style={styles.iconPlaceholder}>
          <Text style={styles.iconText}>📋</Text>
        </View>
        <Text style={styles.emptyTitle}>Inga sysslor än</Text>
        <Text style={styles.emptySubtitle}>
          Tryck på + för att lägga till din första syssla
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8E8',
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
    right: 19,
    top: 30,
    margin: 0,
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
});