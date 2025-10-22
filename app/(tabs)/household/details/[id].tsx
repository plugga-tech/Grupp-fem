import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Appbar, Card, TextInput } from 'react-native-paper';

export default function HouseholdInfoScreen() {
  const router = useRouter();
  const { id, name, code } = useLocalSearchParams<{ id: string; name: string; code: string }>();

  const [householdName, setHouseholdName] = useState(name);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleToggleEdit = () => {
    if (isEditingName) {
      setIsEditingName(false);
    } else {
      setIsEditingName(true);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Appbar.Header mode="center-aligned">
        <Appbar.Action icon="arrow-left" onPress={() => router.back()} />

        <View style={styles.titleContainer}>
          {isEditingName ? (
            <TextInput
              style={styles.titleInput}
              value={householdName}
              onChangeText={setHouseholdName}
              autoFocus
              onSubmitEditing={handleToggleEdit}
              returnKeyType="done"
            />
          ) : (
            <Text>{householdName}</Text>
          )}
        </View>

        <Appbar.Action icon={isEditingName ? 'check' : 'pen'} onPress={handleToggleEdit} />
      </Appbar.Header>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text>Code: </Text>
          <Text>{code}</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  titleInput: {
    minWidth: 180,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    textAlign: 'center',
    fontSize: 18,
  },
  infoCard: {
    margin: 16,
    borderRadius: 12,
  },
});
