import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Share, Platform, Alert } from 'react-native';
import { Button, Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useAppContext } from '../../context/AppContext';
import { generatePdf } from '../../utils/pdfGenerator';

const PdfScreen = ({ navigation }) => {
  const theme = useTheme();
  const { products, orderItems, clearOrder } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUri, setPdfUri] = useState(null);

  // Générer le PDF au chargement de l'écran
  useEffect(() => {
    generatePdfContent();
  }, []);

  const generatePdfContent = async () => {
    if (orderItems.length === 0) {
      Alert.alert('Erreur', 'Aucun article dans la commande');
      navigation.goBack();
      return;
    }

    setIsGenerating(true);
    
    try {
      // Créer le contenu HTML pour le PDF
      const orderDate = new Date().toLocaleDateString('fr-FR');
      const orderTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      let htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="text-align: center; color: #2E7D32; margin-bottom: 5px;">Pharmacie Siloé</h1>
          <h2 style="text-align: center; color: #2E7D32; margin-top: 0; margin-bottom: 20px;">Commande de produits</h2>
          
          <div style="margin-bottom: 20px; text-align: center;">
            <p>Date: ${orderDate} à ${orderTime}</p>
            <p>Référence: CMD-${Date.now().toString().slice(-6)}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #2E7D32; color: white;">
                <th style="padding: 10px; text-align: left; border: 1px solid #2E7D32;">Produit</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #2E7D32;">Quantité</th>
              </tr>
            </thead>
            <tbody>
      `;

      // Trier les articles par ordre alphabétique
      const sortedItems = [...orderItems].sort((a, b) => {
        const productA = products.find(p => p.id === a.productId)?.name || '';
        const productB = products.find(p => p.id === b.productId)?.name || '';
        return productA.localeCompare(productB);
      });

      // Ajouter les lignes du tableau
      sortedItems.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          htmlContent += `
            <tr>
              <td style="padding: 10px; border: 1px solid #E0E0E0;">${product.name}</td>
              <td style="padding: 10px; text-align: right; border: 1px solid #E0E0E0;">${item.quantity}</td>
            </tr>
          `;
        }
      });

      // Fermer le contenu HTML
      htmlContent += `
            </tbody>
          </table>
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p>Merci pour votre confiance. À bientôt à la Pharmacie Siloé !</p>
          </div>
        </div>
      `;

      // Générer le PDF
      const result = await generatePdf(htmlContent, `commande_siloe_${new Date().toISOString().split('T')[0]}`);
      setPdfUri(result.filePath);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      Alert.alert('Erreur', 'Impossible de générer le PDF. Veuillez réessayer.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!pdfUri) return;

    try {
      await Share.share({
        title: 'Commande Pharmacie Siloé',
        url: `file://${pdfUri}`,
        type: 'application/pdf',
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      Alert.alert('Erreur', 'Impossible de partager le fichier PDF.');
    }
  };

  const handleNewOrder = () => {
    clearOrder();
    navigation.navigate('Order');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isGenerating ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Génération du PDF en cours...
          </Text>
        </View>
      ) : pdfUri ? (
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✓</Text>
            <Text variant="headlineMedium" style={[styles.successTitle, { color: theme.colors.primary }]}>
              Commande enregistrée
            </Text>
            <Text style={[styles.successMessage, { color: theme.colors.text }]}>
              Votre commande a été générée avec succès au format PDF.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleShare}
              icon="share-variant"
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              labelStyle={styles.buttonLabel}
            >
              Partager la commande
            </Button>

            <Button
              mode="outlined"
              onPress={handleNewOrder}
              icon="plus"
              style={[styles.button, { borderColor: theme.colors.primary }]}
              textColor={theme.colors.primary}
              labelStyle={styles.buttonLabel}
            >
              Nouvelle commande
            </Button>
          </View>
        </View>
      ) : (
        <View style={styles.centered}>
          <Text>Une erreur est survenue lors de la génération du PDF.</Text>
          <Button
            mode="contained"
            onPress={generatePdfContent}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            labelStyle={styles.buttonLabel}
          >
            Réessayer
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successIcon: {
    fontSize: 80,
    color: '#4CAF50',
    marginBottom: 20,
  },
  successTitle: {
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successMessage: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    marginBottom: 15,
    borderRadius: 8,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
});

export default PdfScreen;
