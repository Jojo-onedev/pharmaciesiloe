import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

// Fonction pour générer un PDF à partir de contenu HTML
export const generatePdf = async (htmlContent, filename) => {
  try {
    // Générer le PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    // Pour le web, on utilise une approche différente
    if (Platform.OS === 'web') {
      return {
        filePath: uri,
        share: async () => {
          const response = await fetch(uri);
          const blob = await response.blob();
          const file = new File([blob], `${filename}.pdf`, { type: 'application/pdf' });
          
          if (navigator.share) {
            await navigator.share({
              title: 'Commande Pharmacie Siloé',
              files: [file],
            });
          } else {
            // Fallback pour les navigateurs qui ne supportent pas Web Share API
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
          }
        }
      };
    }

    // Pour les plateformes mobiles
    const newPath = `${FileSystem.documentDirectory}${filename}.pdf`;
    
    // Copier le fichier généré vers un emplacement permanent
    await FileSystem.copyAsync({
      from: uri,
      to: newPath,
    });

    return {
      filePath: newPath,
      share: async () => {
        try {
          // Vérifier si le partage est disponible
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(newPath, {
              mimeType: 'application/pdf',
              dialogTitle: 'Partager la commande',
              UTI: 'com.adobe.pdf',
            });
          } else {
            // Fallback pour les plateformes où le partage n'est pas disponible
            if (Platform.OS === 'android') {
              await FileSystem.getContentUriAsync(newPath).then(uri => {
                // Essayer d'ouvrir le fichier avec une application tierce
                FileSystem.launchViewerAsync(uri);
              });
            } else {
              // Pour iOS, ouvrir dans une visionneuse de documents
              await FileSystem.launchViewerAsync(newPath);
            }
          }
        } catch (error) {
          console.error('Erreur lors du partage du PDF:', error);
          throw error;
        }
      }
    };
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  }
};

// Fonction utilitaire pour formater la date au format JJ-MM-AAAA
export const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Fonction pour générer un numéro de commande unique
export const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().substr(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  
  return `CMD-${year}${month}${day}-${random}`;
};
