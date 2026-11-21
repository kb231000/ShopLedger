var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function line(id, sku, name, hsn, price, qty) {
  return { id: id, sku: sku, name: name, hsn: hsn, price: price, qty: qty };
}

var tea = line(8, 'BEV-001', 'Assam CTC Masala Chai 250g', '0902', 140, 1);
var rice = line(1, 'GRN-001', 'Indrayani Basmati Rice 5kg', '1006', 640, 1);
var sunflower = line(4, 'OIL-001', 'Cold-Pressed Sunflower Oil 1L', '1512', 190, 2);
var groundnut = line(5, 'OIL-002', 'Cold-Pressed Groundnut Oil 5L', '1508', 1120, 2);
var ghee = line(6, 'DRY-001', 'A2 Gir Cow Ghee 500ml', '0405', 450, 2);
var save10Order = { id: 1002, items: [rice, sunflower], coupon: 'SAVE10' };

function amounts(result) {
  return {
    subtotal: result.subtotal,
    discount: result.discount,
    tax: result.tax,
    total: result.total
  };
}

function check(order, expectedInvoice, expectedCheckout, expectedRates) {
  var printed = invoice.computeInvoiceFigures(order);
  assert.deepEqual(amounts(printed), expectedInvoice);
  assert.deepEqual(amounts(pricing.computeTotals(order.items, order.coupon)), expectedCheckout);
  assert.deepEqual(printed.rows.map(function (row) { return row.gstPercent; }), expectedRates);
}

test('#1001 applies the 5% dal and 18% tea GST rates', function () {
  var order = {
    id: 1001,
    items: [
      Object.assign({}, tea, { qty: 2 }),
      line(2, 'GRN-002', 'Unpolished Toor Dal 1kg', '0713', 165, 2)
    ]
  };
  check(order,
    { subtotal: 610, discount: 0, tax: 66.90, total: 676.90 },
    { subtotal: 610, discount: 0, tax: 66.90, total: 676.90 },
    [18, 5]);
});

test('#1002 applies SAVE10 before calculating GST', function () {
  check(save10Order,
    { subtotal: 1020, discount: 102, tax: 45.90, total: 963.90 },
    { subtotal: 1020, discount: 102, tax: 45.90, total: 963.90 },
    [5, 5]);
});

test('#1004 applies the ₹150 SAVE10 cap', function () {
  check({ id: 1004, items: [groundnut], coupon: 'SAVE10' },
    { subtotal: 2240, discount: 150, tax: 104.50, total: 2194.50 },
    { subtotal: 2240, discount: 150, tax: 104.50, total: 2194.50 },
    [5]);
});

test('#1007 applies both the 12% ghee and 5% sunflower oil slabs', function () {
  check({ id: 1007, items: [ghee, sunflower] },
    { subtotal: 1280, discount: 0, tax: 127, total: 1407 },
    { subtotal: 1280, discount: 0, tax: 127, total: 1407 },
    [12, 5]);
});

test('#1008 agrees with checkout for 18% items without a coupon', function () {
  var sherbet = line(12, 'BEV-003', 'Kokum Sherbet Concentrate 750ml', '2106', 180, 2);
  var expected = { subtotal: 500, discount: 0, tax: 90, total: 590 };
  check({ id: 1008, items: [tea, sherbet] }, expected, expected, [18, 18]);
});

test('REGRESSION: #1002 preserves line GST amounts and CGST/SGST', function () {
  var printed = invoice.computeInvoiceFigures(save10Order);
  assert.deepEqual(amounts(printed), {
    subtotal: 1020, discount: 102, tax: 45.90, total: 963.90
  });
  assert.deepEqual(printed.rows.map(function (row) {
    return [row.sku, row.gstPercent, row.lineTax];
  }), [['GRN-001', 5, 28.80], ['OIL-001', 5, 17.10]]);
  assert.equal(printed.cgst, 22.95);
  assert.equal(printed.sgst, 22.95);
});
