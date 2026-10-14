import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { formatMoney, type Invoice, type Totals } from './model'

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: 'Helvetica', color: '#1e293b' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flexDirection: 'row', alignItems: 'flex-start' },
  logo: { width: 64, height: 64, objectFit: 'contain', marginRight: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  number: { fontSize: 10, color: '#64748b', marginTop: 2 },
  meta: { fontSize: 10, color: '#475569', textAlign: 'right' },
  status: { fontSize: 9, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start', marginTop: 6 },
  parties: { flexDirection: 'row', marginTop: 24 },
  party: { flex: 1 },
  partyLabel: { fontSize: 9, color: '#64748b', textTransform: 'uppercase' },
  partyName: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', marginTop: 3 },
  partyText: { fontSize: 10, color: '#475569', marginTop: 1 },
  table: { marginTop: 24 },
  tableHead: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 6 },
  headCell: { fontSize: 9, color: '#94a3b8' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 6 },
  cell: { fontSize: 10, color: '#334155' },
  colDesc: { flex: 3 },
  colNum: { flex: 1, textAlign: 'right' },
  totals: { marginTop: 14, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', width: 220, justifyContent: 'space-between', paddingVertical: 2 },
  totalLabel: { fontSize: 10, color: '#64748b' },
  totalValue: { fontSize: 10, color: '#1e293b' },
  grandTotalRow: { flexDirection: 'row', width: 220, justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 3, paddingTop: 7 },
  grandTotalLabel: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  grandTotalValue: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  footer: { marginTop: 28 },
  footerLabel: { fontSize: 9, color: '#64748b', textTransform: 'uppercase' },
  footerText: { fontSize: 10, color: '#475569', marginTop: 3 },
  footerBlock: { marginTop: 14 },
})

export function InvoicePdf({ invoice, totals }: { invoice: Invoice; totals: Totals }) {
  const statusColor = invoice.status === 'paid' ? '#059669' : invoice.status === 'sent' ? '#0284c7' : '#64748b'
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {invoice.logo.startsWith('data:image/') ? <Image src={invoice.logo} style={styles.logo} /> : null}
            <View>
              <Text style={styles.title}>Invoice</Text>
              <Text style={styles.number}>{invoice.number}</Text>
              <Text style={[styles.status, { color: statusColor, backgroundColor: `${statusColor}1a` }]}>{invoice.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.meta}>
            <Text>Issued {invoice.issueDate}</Text>
            <Text>Due {invoice.dueDate}</Text>
          </View>
        </View>

        <View style={styles.parties}>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>{invoice.from.name || '—'}</Text>
            <Text style={styles.partyText}>{invoice.from.email}</Text>
            <Text style={styles.partyText}>{invoice.from.address}</Text>
          </View>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Bill to</Text>
            <Text style={styles.partyName}>{invoice.to.name || '—'}</Text>
            <Text style={styles.partyText}>{invoice.to.email}</Text>
            <Text style={styles.partyText}>{invoice.to.address}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.headCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.headCell, styles.colNum]}>Qty</Text>
            <Text style={[styles.headCell, styles.colNum]}>Price</Text>
            <Text style={[styles.headCell, styles.colNum]}>Amount</Text>
          </View>
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={[styles.cell, styles.colDesc]}>{item.description || '—'}</Text>
              <Text style={[styles.cell, styles.colNum]}>{item.quantity}</Text>
              <Text style={[styles.cell, styles.colNum]}>{formatMoney(item.unitPrice, invoice.currency)}</Text>
              <Text style={[styles.cell, styles.colNum]}>{formatMoney(item.quantity * item.unitPrice, invoice.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatMoney(totals.subtotal, invoice.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
            <Text style={styles.totalValue}>{formatMoney(totals.tax, invoice.currency)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatMoney(totals.total, invoice.currency)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          {invoice.notes ? (
            <View>
              <Text style={styles.footerLabel}>Notes</Text>
              <Text style={styles.footerText}>{invoice.notes}</Text>
            </View>
          ) : null}
          {invoice.paymentDetails ? (
            <View style={styles.footerBlock}>
              <Text style={styles.footerLabel}>Payment details</Text>
              <Text style={styles.footerText}>{invoice.paymentDetails}</Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  )
}