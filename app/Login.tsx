import { StyleSheet, View, Button, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function Login({ navigation }: any) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Login</ThemedText>

      {/* <View style={styles.buttonContainer}>
        <Button title="Back to Home" onPress={() => navigation.goBack()} />
      </View> */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
});
