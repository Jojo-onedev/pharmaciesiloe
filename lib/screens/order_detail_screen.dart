import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'package:universal_html/html.dart' as html;
import 'package:pdf/widgets.dart' as pw;
import '../models/order.dart';

class OrderDetailScreen extends StatelessWidget {
  final Order order;
  final GlobalKey<ScaffoldMessengerState> _scaffoldKey;

  OrderDetailScreen({
    super.key,
    required this.order,
  }) : _scaffoldKey = GlobalKey<ScaffoldMessengerState>();

  Future<Uint8List> _generatePdf() async {
    // Create a PDF document
    final pdf = pw.Document();
    
    // Add a page to the PDF
    pdf.addPage(
      pw.Page(
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Center(
                child: pw.Text(
                  'PHARMACIE SILOÉ',
                  style: pw.TextStyle(
                    fontSize: 24,
                    fontWeight: pw.FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              pw.SizedBox(height: 10),
              pw.Center(
                child: pw.Text(
                  'COMMANDE #${order.id.substring(0, 8).toUpperCase()}',
                  style: pw.TextStyle(
                    fontSize: 20,
                    fontWeight: pw.FontWeight.bold,
                    letterSpacing: 1.1,
                  ),
                ),
              ),
              pw.Text('Date: ${order.formattedDate}'),
              pw.Divider(),
              pw.Header(level: 1, text: 'Détail de la commande'),
              pw.SizedBox(height: 10),
              // Créer une liste des noms de produits uniques et triés
              ...() {
                final productNames = order.items
                    .map((item) => item.productName)
                    .toSet()
                    .toList()
                  ..sort((a, b) => a.toLowerCase().compareTo(b.toLowerCase()));
                
                return productNames.map((productName) => pw.Padding(
                  padding: const pw.EdgeInsets.only(bottom: 8.0),
                  child: pw.Row(
                    children: [
                      pw.Text(
                        '• $productName',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold),
                      ),
                    ],
                  ),
                ));
              }(),
              pw.Divider(),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('Total des articles:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  pw.Text('${order.itemCount} articles', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                ],
              ),
            ],
          );
        },
      ),
    );
    
    // Save the PDF to bytes
    return await pdf.save();
  }
  
  String _getFormattedDate() {
    final now = DateTime.now();
    final day = now.day.toString().padLeft(2, '0');
    final month = now.month.toString().padLeft(2, '0');
    final year = now.year;
    return '$day-$month-$year';
  }



  Future<void> _generateAndSharePdf() async {
    try {
      final pdfBytes = await _generatePdf();
      
      // Utiliser une approche différente pour le web
      if (kIsWeb) {
        // Pour le web, utiliser la méthode de téléchargement directe
        final blob = html.Blob([pdfBytes], 'application/pdf');
        final url = html.Url.createObjectUrlFromBlob(blob);
        final anchor = html.AnchorElement(href: url)
          ..setAttribute('download', 'commande_siloe_du_${_getFormattedDate()}.pdf')
          ..style.display = 'none';
        
        html.document.body?.children.add(anchor);
        anchor.click();
        html.document.body?.children.remove(anchor);
        html.Url.revokeObjectUrl(url);
      } else {
        // Pour mobile/desktop, utiliser le partage de fichier
        final tempDir = await getTemporaryDirectory();
        final fileName = 'commande_siloe_du_${_getFormattedDate()}.pdf';
        final file = File('${tempDir.path}/$fileName');
        await file.writeAsBytes(pdfBytes);
        
        await SharePlus.instance.share(
          'Commande Pharmacie Siloé - ${_getFormattedDate()}' as ShareParams,
        );
      }
      
    } catch (e) {
      debugPrint('Error in PDF generation: $e');
      if (!_scaffoldKey.currentState!.mounted) return;
      
      final context = _scaffoldKey.currentContext!;
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erreur lors de la génération du PDF'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
  


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        title: Text('Commande #${order.id.substring(0, 8)}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf),
            onPressed: _generateAndSharePdf,
            tooltip: 'Exporter en PDF',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Informations de la commande',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildInfoRow('Date', order.formattedDate),
                    _buildInfoRow('Numéro', order.id.substring(0, 8)),
                    _buildInfoRow('Nombre d\'articles', '${order.itemCount}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Articles commandés',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Card(
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: order.items.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final item = order.items[index];
                  return ListTile(
                    title: Text(item.productName),
                    trailing: Text(
                      '${item.quantity} unité${item.quantity > 1 ? 's' : ''}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Text(
            '$label: ',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          Text(value),
        ],
      ),
    );
  }
}
