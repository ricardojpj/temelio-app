import * as XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tcs = [
  // Budgeting - Page Load
  { id: 'TC-B001', suite: 'Budgeting - Page Load', title: 'Budgeting section heading and description are visible', type: 'Positive', expected: 'h2 "Budgeting" heading and description text are visible', status: 'Pass' },
  { id: 'TC-B002', suite: 'Budgeting - Page Load', title: 'Start Of Budget Year label and selector are visible', type: 'Positive', expected: 'Label and combobox for Start Of Budget Year are present', status: 'Pass' },
  { id: 'TC-B003', suite: 'Budgeting - Page Load', title: 'Budget year selector shows current fiscal year range', type: 'Positive', expected: 'Button displays "Jun 1, 2026 - May 31, 2027"', status: 'Pass' },
  { id: 'TC-B004', suite: 'Budgeting - Page Load', title: 'Total budget input is visible and shows a dollar amount', type: 'Positive', expected: 'Input is visible with value matching $xxx,xxx format', status: 'Pass' },
  { id: 'TC-B005', suite: 'Budgeting - Page Load', title: 'Allocation categories heading and "at least one required" note are visible', type: 'Positive', expected: '"Allocation categories" heading and required note are visible', status: 'Pass' },
  { id: 'TC-B006', suite: 'Budgeting - Page Load', title: 'At least one allocation category exists on load', type: 'Positive', expected: 'At least 1 category row is present on page load', status: 'Pass' },
  { id: 'TC-B007', suite: 'Budgeting - Page Load', title: 'Category rows have name input and amount input', type: 'Positive', expected: 'Each row has a text input (name) and number input (amount)', status: 'Pass' },
  { id: 'TC-B008', suite: 'Budgeting - Page Load', title: 'Each category has a Remove and Add sub button', type: 'Positive', expected: 'Each row has visible Remove and Add sub buttons', status: 'Pass' },
  { id: 'TC-B009', suite: 'Budgeting - Page Load', title: 'Total Allocated amount is shown', type: 'Positive', expected: '"Total Allocated:" displays a value in $xxx,xxx format', status: 'Pass' },
  { id: 'TC-B010', suite: 'Budgeting - Page Load', title: 'Remaining amount is shown', type: 'Positive', expected: '"Remaining:" displays a value in $xxx,xxx format', status: 'Pass' },
  { id: 'TC-B011', suite: 'Budgeting - Page Load', title: 'Total Allocated + Remaining equals total budget', type: 'Positive', expected: 'Allocated + Remaining = Total Budget (math check)', status: 'Pass' },
  { id: 'TC-B012', suite: 'Budgeting - Page Load', title: 'Add category button is visible', type: 'Positive', expected: '"Add" button for categories is visible', status: 'Pass' },

  // Budgeting - Fiscal Year Selector
  { id: 'TC-B013', suite: 'Budgeting - Fiscal Year Selector', title: 'Opening fiscal year menu shows multiple year options', type: 'Positive', expected: 'Opening the menu shows ≥5 fiscal year options', status: 'Pass' },
  { id: 'TC-B014', suite: 'Budgeting - Fiscal Year Selector', title: 'Fiscal year menu contains navigate-years controls', type: 'Positive', expected: 'Menu shows "Navigate Years" text with arrow controls', status: 'Pass' },
  { id: 'TC-B015', suite: 'Budgeting - Fiscal Year Selector', title: 'Selecting a different fiscal year updates the menu button label', type: 'Positive', expected: 'Selecting 2025-2026 updates the button label accordingly', status: 'Pass' },
  { id: 'TC-B016', suite: 'Budgeting - Fiscal Year Selector', title: 'Current year option has a Copy button next to it', type: 'Positive', expected: 'Open menu shows a "Copy budget from..." button', status: 'Pass' },

  // Budgeting - Add Category (Positive)
  { id: 'TC-B017', suite: 'Budgeting - Add Category', title: 'Adding a new category increases category count by 1', type: 'Positive', expected: 'Row count increases by 1 after clicking Add', status: 'Pass' },
  { id: 'TC-B018', suite: 'Budgeting - Add Category', title: 'New category is added with a placeholder name and zero amount', type: 'Positive', expected: 'New row has an auto-generated name and amount = 0', status: 'Pass' },
  { id: 'TC-B019', suite: 'Budgeting - Add Category', title: 'Setting a category name persists the value in the input', type: 'Positive', expected: 'Entered name is retained in the input field', status: 'Pass' },
  { id: 'TC-B020', suite: 'Budgeting - Add Category', title: 'Setting a category amount updates Total Allocated', type: 'Positive', expected: 'Total Allocated increases by the entered amount', status: 'Pass' },
  { id: 'TC-B021', suite: 'Budgeting - Add Category', title: 'Removing an added category restores original count', type: 'Positive', expected: 'Row count returns to original after removing added category', status: 'Pass' },
  { id: 'TC-B022', suite: 'Budgeting - Add Category', title: 'Total Allocated is recalculated after removing category', type: 'Positive', expected: 'Total Allocated returns to original value after removal', status: 'Pass' },
  { id: 'TC-B023', suite: 'Budgeting - Add Category', title: 'Add sub-category button adds a nested category row', type: 'Positive', expected: 'Clicking "Add sub" increases the row count', status: 'Pass' },

  // Budgeting - Negative / Edge Cases
  { id: 'TC-B024', suite: 'Budgeting - Negative / Edge Cases', title: 'Category amount with value 0 does not increase Total Allocated', type: 'Negative', expected: 'Amount of 0 does not change Total Allocated', status: 'Pass' },
  { id: 'TC-B025', suite: 'Budgeting - Negative / Edge Cases', title: 'Allocation exceeding total budget shows Remaining as negative or zero', type: 'Negative', expected: 'When category exceeds budget, Remaining ≤ 0', status: 'Pass' },
  { id: 'TC-B026', suite: 'Budgeting - Negative / Edge Cases', title: 'Entering a negative number in category amount is not accepted', type: 'Negative', expected: 'input[type=number] rejects negative values (min=0)', status: 'Pass' },
  { id: 'TC-B027', suite: 'Budgeting - Negative / Edge Cases', title: 'Category name field accepts special characters', type: 'Edge Case', expected: 'Name "R&D / Tech (2026)" is saved correctly', status: 'Pass' },
  { id: 'TC-B028', suite: 'Budgeting - Negative / Edge Cases', title: 'Very large category amount is accepted without crashing', type: 'Edge Case', expected: 'Amount 999999999 does not crash the page', status: 'Pass' },
  { id: 'TC-B029', suite: 'Budgeting - Negative / Edge Cases', title: '[BUG] App allows removing last category despite "at least one required" note', type: 'Negative', expected: 'Remove button should be disabled when only 1 category remains', status: 'BUG' },
  { id: 'TC-B030', suite: 'Budgeting - Negative / Edge Cases', title: 'Budget year start month selector opens dropdown with 12 month options', type: 'Positive', expected: 'Opening react-select shows exactly 12 month options', status: 'Pass' },
];

const wb = XLSX.utils.book_new();

// Sheet 1: All TCs
const headers = ['TC ID', 'Suite', 'Title', 'Type', 'Expected Result', 'Status'];
const rows = tcs.map(tc => [tc.id, tc.suite, tc.title, tc.type, tc.expected, tc.status]);
const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

// Column widths
ws['!cols'] = [
  { wch: 10 },  // TC ID
  { wch: 32 },  // Suite
  { wch: 60 },  // Título
  { wch: 12 },  // Tipo
  { wch: 55 },  // Resultado Esperado
  { wch: 10 },  // Estado
];

// Style header row (bold via s property — supported in xlsx pro, basic here)
XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');

// Sheet 2: Summary
const passCount = tcs.filter(t => t.status === 'Pass').length;
const bugCount = tcs.filter(t => t.status === 'BUG').length;
const summary = [
  ['Summary', ''],
  ['Total TCs', tcs.length],
  ['Passed', passCount],
  ['Bugs found', bugCount],
  ['', ''],
  ['By type', ''],
  ['Positive', tcs.filter(t => t.type === 'Positive').length],
  ['Negative', tcs.filter(t => t.type === 'Negative').length],
  ['Edge Case', tcs.filter(t => t.type === 'Edge Case').length],
];
const wsSummary = XLSX.utils.aoa_to_sheet(summary);
wsSummary['!cols'] = [{ wch: 22 }, { wch: 12 }];
XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

const outPath = path.join(__dirname, '..', 'test-cases.xlsx');
XLSX.writeFile(wb, outPath);
console.log('Archivo generado:', outPath);
