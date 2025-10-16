import { Link } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Appbar, Avatar, Badge, Button, Card, List } from 'react-native-paper';

export default function HouseholdScreen() {
  const households = [
    { id: '1', name: 'Hushåll 1' },
    { id: '2', name: 'Hushåll 2' },
  ];

  return (
    <View style={styles.container}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content title="Dina hushåll" />
        <Appbar.Action icon="account" onPress={() => {}} />
      </Appbar.Header>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Hushåll</Text>
        <Badge size={24} style={{ alignSelf: 'center', backgroundColor: 'grey' }}>
          2
        </Badge>
      </View>

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={households}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={'/'} asChild>
            <Card style={styles.card} mode="elevated">
              <List.Item
                title={item.name}
                left={() => (
                  <Avatar.Icon size={28} icon="information-outline" style={{ marginLeft: 10 }} />
                )}
                right={() => (
                  <View style={styles.rightBadges}>
                    <Badge size={24} style={{ alignSelf: 'center', backgroundColor: 'green' }}>
                      🐸
                    </Badge>
                    <Badge size={24} style={{ alignSelf: 'center', backgroundColor: 'grey' }}>
                      3
                    </Badge>
                  </View>
                )}
              />
            </Card>
          </Link>
        )}
      />
      <View style={styles.bottomBar}>
        <Button mode="contained" icon="plus" style={styles.barBtn} onPress={() => {}}>
          Skapa
        </Button>
        <Button mode="contained" icon="key-variant" style={styles.barBtn} onPress={() => {}}>
          Gå med
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 8,
    marginLeft: 20,
    marginRight: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionChip: {
    height: 32,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  rightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallChip: {
    height: 32,
    minWidth: 32,
    lineHeight: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'grey',
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  barBtn: {
    flex: 1,
    borderRadius: 20,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
});
