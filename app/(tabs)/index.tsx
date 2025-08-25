import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Bienvenue sur</Text>
        <Text style={styles.appName}>Pharmacie Siloé</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.subtitle}>Gérez facilement vos produits et commandes</Text>
        
        <View style={styles.buttonsContainer}>
          <Button 
            mode="contained" 
            onPress={() => router.push('/(tabs)/products')}
            style={styles.button}
            icon="medkit"
          >
            Gérer les produits
          </Button>
          
          <Button 
            mode="contained" 
            onPress={() => router.push('/(tabs)/order')}
            style={styles.button}
            icon="cart"
          >
            Nouvelle commande
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontWeight: '300',
  },
  appName: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#555',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 15,
  },
  button: {
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
  },
});
