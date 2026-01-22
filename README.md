# SR Plumbing & Electrical Service Website

A comprehensive billing and management system for plumbing and electrical services.

## Features

- **Home Page**: Company introduction and quick access to main features
- **About Page**: Detailed information about M. Shanmughan and company experience
- **Billing System**: 
  - Add items to catalog with photos, names, sizes, and rates
  - Shopping cart with quantity management
  - Generate professional invoices
  - Print and save invoices
- **Payment Page**: 
  - QR code display for UPI payments
  - UPI ID: shanmughanraji775@okaxis
  - Card payment recording
- **Management Dashboard**: 
  - CARD operations
  - Invoice management (view, edit, delete)
  - Item catalog management
- **Daily Reports**: 
  - View daily summaries
  - Track invoices and payments
  - Export reports to CSV
  - Monthly summaries

## Setup Instructions

1. **Add Images**: Place the following images in the `assets` folder:
   - `logo.png` - Company logo
   - `profile.jpg` - Profile picture of M. Shanmughan
   - `qr-code.png` - Payment QR code

2. **Open the Website**: Simply open `index.html` in a web browser.

3. **No Server Required**: This is a client-side application using localStorage for data storage.

## Usage

### Adding Items
1. Go to the Billing page
2. Fill in the "Add Item to Catalog" form with:
   - Item photo (optional)
   - Item name
   - Size in inches and mm
   - Item code
   - Rate
3. Click "Add Item"

### Creating an Invoice
1. Go to the Billing page
2. Browse items in the catalog
3. Click "Add to Cart" for desired items
4. Adjust quantities and prices in the cart
5. Click "Generate Invoice"
6. Review and save the invoice

### Recording Payments
1. Go to the Payment page
2. Select payment method (UPI or CARD)
3. Enter amount and status
4. Click "Confirm Payment" or "Record Card Payment"

### Viewing Reports
1. Go to the Reports page
2. Select a date to view daily reports
3. View monthly summaries by selecting a month
4. Export reports to CSV if needed

## Data Storage

All data is stored in the browser's localStorage. This means:
- Data persists between sessions
- Data is specific to the browser/device
- To clear data, use browser's developer tools or clear browser data

## Browser Compatibility

Works best on modern browsers:
- Chrome (recommended)
- Firefox
- Edge
- Safari

## Company Information

- **Name**: SR Plumbing & Electrical Service
- **Location**: Sivan Kovil Street, Choolaimedu, Chennai-94
- **Phone**: 9094599014
- **UPI ID**: shanmughanraji775@okaxis
- **Slogan**: Best work in affordable price

