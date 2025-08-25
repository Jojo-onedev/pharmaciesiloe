import React, { useMemo, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert as RNAlert, 
  ActivityIndicator, 
  Platform,
  Linking
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppContext } from '../../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Order, OrderItemWithDetails } from '../../../types';

type ExportAction = 'download' | 'share' | 'open';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60, // Augmenté pour descendre le titre
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#2E7D32',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoContainer: {
    marginBottom: 24,
  },
  orderId: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderDate: {
    color: '#666',
    marginBottom: 8,
  },
  totalItems: {
    fontSize: 16,
    marginBottom: 8,
  },
  productsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '500',
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
  },
  productQuantity: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  exportButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    margin: 16,
  },
  exportButtonDisabled: {
    backgroundColor: '#999',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  exportIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const OrderDetailScreen: React.FC = () => {
  const { id: orderId, autoExport } = useLocalSearchParams<{ 
    id: string; 
    autoExport?: string 
  }>();
  
  const { orders } = useAppContext();
  const [isExporting, setIsExporting] = useState(false);

  const order = useMemo(() => {
    return orders.find((o: Order) => o.id === orderId);
  }, [orderId, orders]);

  useEffect(() => {
    if (autoExport === 'true' && order) {
      handleExportPDF('download');
    }
  }, [autoExport, order]);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const generateHtml = (): string => {
    if (!order) return '';
    
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    // Couleur verte pour le thème
    const primaryColor = '#2E7D32';

    const itemsHtml = order.items
      .map((item) => `
        <tr>
          <td>${item.productName || 'Produit sans nom'}</td>
          <td>${item.quantity}</td>
        </tr>
      `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Commande du ${formattedDate}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px;
              border-bottom: 2px solid #2E7D32;
              padding-bottom: 20px;
            }
            .title { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 5px;
              color: #2E7D32;
            }
            .subtitle {
              font-size: 16px;
              color: #555;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .total {
              text-align: right;
              font-weight: bold;
              font-size: 18px;
              margin-top: 20px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Pharmacie Siloé</h1>
            <p class="subtitle">Secteur 2, Réo, Burkina Faso</p>
            <p>Commande #${order.id.substring(0, 8)}</p>
            <p>Date: ${formattedDate}</p>
          </div>
          
          <h2 style="color: #2E7D32; border-bottom: 2px solid #2E7D32; padding-bottom: 8px; margin-top: 20px;">Détails de la commande</h2>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Merci pour votre confiance !</p>
            <p>Pharmacie Siloé - Secteur 2, Réo, Burkina Faso</p>
          </div>
        </body>
      </html>
    `;
  };

  const listFilesInDirectory = async (dir: string): Promise<string[]> => {
    try {
      const files = await FileSystem.readDirectoryAsync(dir);
      console.log(`Contenu de ${dir}:`, files);
      return files;
    } catch (error) {
      console.error(`Erreur lors de la lecture du répertoire ${dir}:`, error);
      return [];
    }
  };

  const showFileOptions = async (filePath: string, fileName: string) => {
    try {
      // Vérifier si le fichier existe
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        throw new Error('Le fichier n\'existe pas');
      }

      // Pour Android, utiliser le Storage Access Framework
      if (Platform.OS === 'android') {
        try {
          // Essayer d'abord d'ouvrir directement le fichier
          const contentUri = await FileSystem.getContentUriAsync(filePath);
          
          // Options pour l'ouverture du fichier
          const openOptions = {
            data: contentUri,
            flags: 1,
            type: 'application/pdf',
          };
          
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', openOptions);
          return;
        } catch (openError) {
          console.warn('Impossible d\'ouvrir directement le fichier, tentative de partage...', openError);
        }
      }
      
      // Si on est sur iOS ou si l'ouverture directe a échoué, proposer le partage
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Ouvrir avec...',
        UTI: 'com.adobe.pdf'
      });
      
    } catch (error) {
      console.error('Erreur lors de la gestion du fichier:', error);
      
      // Afficher un message d'erreur plus convivial
      RNAlert.alert(
        'Fichier enregistré',
        `Le fichier a été enregistré sous :\n${filePath}\n\nVous pouvez le retrouver dans le dossier Téléchargements de votre appareil.`,
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    }
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    // On utilise le dossier de l'application qui ne nécessite pas de permission spéciale
    return true;
  };

  const handleExportPDF = async (action: ExportAction = 'download'): Promise<void> => {
    if (isExporting || !order) return;
    
    setIsExporting(true);
    let pdfUri: string | null = null;
    let finalPath = '';
    
    try {
      // Générer le contenu HTML
      const html = generateHtml();
      
      if (!(await Print.printToFileAsync)) {
        throw new Error('La génération de PDF n\'est pas disponible sur cet appareil');
      }
      
      // Générer le nom de fichier
      const orderDate = new Date(order.date);
      const formattedDate = orderDate.toISOString().split('T')[0];
      const baseFileName = `Commande_${order.id.substring(0, 8)}_${formattedDate}.pdf`;
    
      // Générer le PDF
      const result = await Print.printToFileAsync({
        html,
        width: 595,
        height: 842,
        base64: false
      });
      
      pdfUri = result.uri;
      console.log('PDF généré temporairement à:', pdfUri);
      
      // Vérifier que le fichier a bien été créé
      const fileInfo = await FileSystem.getInfoAsync(pdfUri);
      if (!fileInfo.exists) {
        throw new Error('Échec de la création du fichier PDF');
      }
      
      if (Platform.OS === 'android') {
        // Pour Android, utiliser le sélecteur de répertoire natif
        try {
          const directoryUri = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          
          if (!directoryUri.granted) {
            throw new Error('Permission refusée pour accéder au stockage');
          }
          
          // Créer le fichier dans le répertoire sélectionné
          const fileContent = await FileSystem.readAsStringAsync(pdfUri, {
            encoding: FileSystem.EncodingType.Base64
          });
          
          const fileName = await FileSystem.StorageAccessFramework.createFileAsync(
            directoryUri.directoryUri,
            baseFileName,
            'application/pdf'
          );
          
          // Écrire le contenu dans le fichier
          await FileSystem.writeAsStringAsync(fileName, fileContent, {
            encoding: FileSystem.EncodingType.Base64
          });
          
          console.log('Fichier PDF enregistré avec succès à:', fileName);
          finalPath = fileName;
          
          // Vérifier que le fichier a bien été créé
          const finalFileInfo = await FileSystem.getInfoAsync(fileName);
          if (!finalFileInfo.exists) {
            throw new Error('Le fichier n\'a pas pu être enregistré');
          }
        } catch (error) {
          console.error('Erreur avec Storage Access Framework:', error);
          // En cas d'échec, essayer avec le dossier de l'application
          const downloadDir = `${FileSystem.documentDirectory}factures/`;
          await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
          
          let localPath = `${downloadDir}${baseFileName}`;
          let counter = 1;
          
          while (await FileSystem.getInfoAsync(localPath).then(info => info.exists)) {
            const nameWithoutExt = baseFileName.replace(/\.pdf$/i, '');
            localPath = `${downloadDir}${nameWithoutExt}(${counter}).pdf`;
            counter++;
          }
          
          await FileSystem.copyAsync({
            from: pdfUri,
            to: localPath
          });
          
          finalPath = localPath;
        }
      } else {
        // Pour iOS, utiliser le dossier de l'application
        const downloadDir = `${FileSystem.documentDirectory}factures/`;
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
        
        let localPath = `${downloadDir}${baseFileName}`;
        let counter = 1;
        
        while (await FileSystem.getInfoAsync(localPath).then(info => info.exists)) {
          const nameWithoutExt = baseFileName.replace(/\.pdf$/i, '');
          localPath = `${downloadDir}${nameWithoutExt}(${counter}).pdf`;
          counter++;
        }
        
        await FileSystem.copyAsync({
          from: pdfUri,
          to: localPath
        });
        
        finalPath = localPath;
      }
      
      // Vérifier que le fichier a bien été créé
      const finalFileInfo = await FileSystem.getInfoAsync(finalPath);
      if (!finalFileInfo.exists) {
        throw new Error('Le fichier n\'a pas pu être enregistré');
      }
      
      // Afficher un message de succès avec l'emplacement du fichier
      const displayPath = finalPath.split('/').pop() || 'Fichier PDF';
      
      // Afficher une alerte avec les options
      RNAlert.alert(
        'Facture sauvegardée',
        `La facture a été enregistrée :\n${displayPath}`,
        [
          {
            text: 'Ouvrir',
            onPress: async () => {
              try {
                if (Platform.OS === 'android' && finalPath.startsWith('content://')) {
                  // Pour Android avec URI de contenu
                  await IntentLauncher.startActivityAsync(
                    'android.intent.action.VIEW',
                    {
                      data: finalPath,
                      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
                      type: 'application/pdf'
                    }
                  );
                } else {
                  // Pour iOS ou chemins locaux
                  const sharePath = finalPath.startsWith('file://') || finalPath.startsWith('/')
                    ? (finalPath.startsWith('file://') ? finalPath : `file://${finalPath}`)
                    : finalPath;
                  
                  await Sharing.shareAsync(sharePath, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Ouvrir avec',
                    UTI: 'com.adobe.pdf'
                  });
                }
              } catch (error) {
                console.error('Erreur lors de l\'ouverture du fichier:', error);
                RNAlert.alert(
                  'Erreur',
                  'Impossible d\'ouvrir le fichier. Vous pouvez le trouver à :\n' + finalPath
                );
              }
            }
          },
          {
            text: 'Partager',
            onPress: async () => {
              try {
                const sharePath = finalPath.startsWith('file://') || finalPath.startsWith('/')
                  ? (finalPath.startsWith('file://') ? finalPath : `file://${finalPath}`)
                  : finalPath;
                
                await Sharing.shareAsync(sharePath, {
                  mimeType: 'application/pdf',
                  dialogTitle: 'Partager la commande',
                  UTI: 'com.adobe.pdf'
                });
              } catch (error) {
                console.error('Erreur lors du partage:', error);
                RNAlert.alert(
                  'Erreur',
                  'Impossible de partager le fichier. Vous pouvez le trouver à :\n' + finalPath
                );
              }
            }
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      RNAlert.alert(
        'Erreur',
        `Une erreur est survenue lors de la génération du PDF : ${errorMessage}`
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Détail de la commande</Text>
        </View>
        <View style={styles.centeredView}>
          <Text>Commande non trouvée</Text>
        </View>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          disabled={isExporting}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Détail de la commande</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.infoContainer}>
          <Text style={styles.orderId}>Commande #{order.id.substring(0, 8)}</Text>
          <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
          <Text style={styles.totalItems}>
            {order.items.reduce((sum, item) => sum + item.quantity, 0)} article{order.items.length > 1 ? 's' : ''}
          </Text>
        </View>
        
        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>Produits</Text>
          {order.items.map((item, index) => (
            <View key={`${item.productId}-${index}`} style={styles.productItem}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.productName}</Text>
                {item.productCategory && (
                  <Text style={styles.productCategory}>{item.productCategory}</Text>
                )}
              </View>
              <Text style={styles.productQuantity}>x{item.quantity}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          onPress={() => {
            RNAlert.alert(
              'Exporter la commande',
              'Choisissez une option d\'exportation',
              [
                {
                  text: 'Annuler',
                  style: 'cancel',
                },
                {
                  text: 'Télécharger le PDF',
                  onPress: () => handleExportPDF('download'),
                },
                {
                  text: 'Partager',
                  onPress: () => handleExportPDF('share'),
                },
              ],
              { cancelable: true }
            );
          }}
          style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
          disabled={isExporting}
        >
          <Ionicons name="download-outline" size={20} color="#fff" style={styles.exportIcon} />
          <Text style={styles.exportButtonText}>
            {isExporting ? 'Traitement...' : 'Exporter'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isExporting && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
};

export default OrderDetailScreen;
