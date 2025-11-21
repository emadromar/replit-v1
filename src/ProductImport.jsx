// ./ProductImport.jsx
import React, { useState } from 'react';
import { getFirestore, collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { Upload, Loader2, FileText, CheckCircle, X, ChevronsRight } from 'lucide-react';

export function ProductImport({ storeId, db, showError, showSuccess }) {
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [jsonData, setJsonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importCount, setImportCount] = useState(0);

  const [columnMap, setColumnMap] = useState({
    name: '',
    price: '',
    stock: '',
  });

  const resetComponent = () => {
    setStep('upload');
    setFile(null);
    setHeaders([]);
    setJsonData([]);
    setLoading(false);
    setImportCount(0);
    setColumnMap({ name: '', price: '', stock: '' });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (fileToParse) => {
    setLoading(true);
    try {
      // Import xlsx dynamically
      const XLSX = await import('xlsx');
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Read headers from the first row
          const parsedHeaders = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (parsedHeaders.length < 1 || parsedHeaders[0].length === 0) {
            showError("Sheet seems empty or has no headers in the first row.");
            setLoading(false);
            return;
          }
          
          const fileHeaders = parsedHeaders[0].filter(h => h != null && h !== '');
          const fileData = XLSX.utils.sheet_to_json(worksheet);

          if (fileData.length === 0) {
            showError("No data found below the header row.");
            setLoading(false);
            return;
          }

          const filteredData = fileData.filter(row =>
            Object.values(row).some(value => value != null && String(value).trim() !== '')
          );

          if (filteredData.length === 0) {
            showError("All data rows appear to be empty.");
            setLoading(false);
            return;
          }

          setHeaders(fileHeaders);
          setJsonData(filteredData);
          setStep('map');
          setLoading(false);

        } catch (parseError) {
          console.error("File parse error:", parseError);
          showError(`Failed to parse file: ${parseError.message}`);
          setLoading(false);
        }
      };

      reader.onerror = (err) => {
        console.error("FileReader error:", err);
        showError("Failed to read the file.");
        setLoading(false);
      };

      reader.readAsArrayBuffer(fileToParse);

    } catch (err) {
      console.error("Import module error:", err);
      showError("Failed to load import module. Try again.");
      setLoading(false);
    }
  };

  const handleMapChange = (e) => {
    const { name, value } = e.target;
    setColumnMap(prev => ({ ...prev, [name]: value }));
  };

  const isMapValid = () => {
    const requiredFieldsMapped = columnMap.name && columnMap.price && columnMap.stock;
    if (!requiredFieldsMapped) return false;

    const allMappedHeadersExist =
         headers.includes(columnMap.name) &&
         headers.includes(columnMap.price) &&
         headers.includes(columnMap.stock);

    return allMappedHeadersExist;
  };

  const handleImport = async () => {
    if (!isMapValid()) {
      showError("Please map all required fields (*) to valid columns found in your file.");
      return;
    }

    setStep('importing');
    setLoading(true);

    const productsCollection = collection(db, "stores", storeId, "products");
    let currentBatch = writeBatch(db);
    let operationsInBatch = 0;
    let successfulImports = 0;
    let skippedRows = 0;
    const BATCH_LIMIT = 499;

    try {
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const name = row[columnMap.name] ? String(row[columnMap.name]).trim() : '';
        const priceString = String(row[columnMap.price] ?? '').trim();
        const stockString = String(row[columnMap.stock] ?? '').trim();

        const price = parseFloat(priceString);
        const stock = parseInt(stockString, 10);

        if (name && !isNaN(price) && price >= 0 && !isNaN(stock) && Number.isInteger(stock) && stock >= 0) {
          const newProductRef = doc(productsCollection);
          currentBatch.set(newProductRef, {
            name,
            price,
            stock,
            imageUrl: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          operationsInBatch++;
          successfulImports++;

          if (operationsInBatch >= BATCH_LIMIT) {
            await currentBatch.commit();
            currentBatch = writeBatch(db);
            operationsInBatch = 0;
          }
        } else {
          let skipReason = "invalid data";
          if (!name) skipReason = "missing name";
          else if (isNaN(price) || price < 0) skipReason = `invalid price ('${priceString}')`;
          else if (isNaN(stock) || !Number.isInteger(stock) || stock < 0) skipReason = `invalid stock ('${stockString}')`;
          console.warn(`Skipping row ${i + 2} due to ${skipReason}:`, row);
          skippedRows++;
        }
      }

      if (operationsInBatch > 0) {
        await currentBatch.commit();
      }

      let successMessage = `${successfulImports} of ${jsonData.length} products imported successfully!`;
      if (skippedRows > 0) {
        successMessage += ` (${skippedRows} rows skipped due to invalid data).`;
      }
      showSuccess(successMessage);
      setImportCount(successfulImports);
      setStep('done');

    } catch (err) {
      console.error("Batch import error:", err);
      showError(`Import failed: ${err.message}`);
      setStep('map');
    }

    setLoading(false);
  };

  const renderUploadStep = () => (
    <div className="text-center">
      <label
        htmlFor="product-upload"
        className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
      >
        {loading ? (
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        ) : (
          <Upload className="w-12 h-12 text-gray-400" />
        )}
        <span className="mt-2 block text-sm font-medium text-gray-700">
          {loading ? 'Parsing file...' : (file ? file.name : 'Upload .xlsx or .csv file')}
        </span>
        <input
          id="product-upload"
          type="file"
          className="sr-only"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          disabled={loading}
          onClick={(event) => { event.target.value = null }}
        />
      </label>

      <div className="mt-4 text-xs text-gray-600 text-left space-y-1 bg-gray-50 p-3 rounded border border-gray-200">
        <p className="font-semibold block mb-1">Template Guide:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Columns for **Name**, **Price**, and **Stock** are required.</li>
          <li>Ensure Price and Stock are valid numbers.</li>
          <li>For best results, download and use our template.</li>
        </ul>
      </div>

      <div className="mt-3 text-sm">
        <a href="/product_template.csv" download className="font-medium text-primary-600 hover:text-primary-500 hover:underline">
          Download Template (.csv)
        </a>
      </div>
    </div>
  );

  const renderMapStep = () => (
    <div className="space-y-4">
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
        <p className="text-sm font-medium text-green-800">
          <FileText className="w-4 h-4 inline mr-1" />
          File parsed: <strong>{jsonData.length} products</strong> found.
        </p>
      </div>
      <p className="text-sm text-gray-700">
        Match the required fields (*) to the corresponding column titles:
      </p>

      <div className="space-y-3">
        <MapSelect
          label="Product Name"
          value={columnMap.name}
          onChange={handleMapChange}
          name="name"
          headers={headers}
        />
        <MapSelect
          label="Price"
          value={columnMap.price}
          onChange={handleMapChange}
          name="price"
          headers={headers}
        />
        <MapSelect
          label="Stock"
          value={columnMap.stock}
          onChange={handleMapChange}
          name="stock"
          headers={headers}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={resetComponent}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={!isMapValid() || loading}
          className="flex-1 flex justify-center items-center px-4 py-2 bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
          Import {jsonData.length} Products
        </button>
      </div>
    </div>
  );

  const renderDoneStep = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="w-16 h-16 text-alert-success mx-auto" />
      <h3 className="text-lg font-semibold">Import Complete</h3>
      <p className="text-gray-700 px-2">
        Successfully imported <strong>{importCount}</strong> products.
        {jsonData.length > importCount &&
         ` (${jsonData.length - importCount} rows were skipped due to invalid data).`}
      </p>
      <button
        type="button"
        onClick={resetComponent}
        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 transition"
      >
        Import Another File
      </button>
    </div>
  );

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-3 flex justify-between items-center border-b pb-3">
        <span>Bulk Product Import</span>
        {step !== 'upload' && !loading && (
          <button onClick={resetComponent} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Start over">
            <X className="w-4 h-4" />
          </button>
        )}
      </h2>

      {step === 'upload' && renderUploadStep()}
      {step === 'map' && renderMapStep()}
      {step === 'importing' && (
        <div className="text-center space-y-3 py-8">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto" />
          <h3 className="text-lg font-semibold">Importing Products...</h3>
          <p className="text-sm text-gray-600">Please wait. This may take a moment for large files.</p>
        </div>
      )}
      {step === 'done' && renderDoneStep()}
    </div>
  );
}

function MapSelect({ label, value, onChange, name, headers }) {
  const normalizeHeader = (h) => (h ? String(h).toLowerCase().replace(/[^a-z0-9]/gi, '') : '');
  const normalizedName = normalizeHeader(name);

  const autoSelectedValue =
    headers.find(h => normalizeHeader(h) === normalizedName) ||
    headers.find(h => normalizeHeader(h).includes(normalizedName)) ||
    '';

  React.useEffect(() => {
    if (!value && autoSelectedValue) {
      if (headers.includes(autoSelectedValue)) {
        onChange({ target: { name, value: autoSelectedValue } });
      }
    }
  }, [autoSelectedValue, onChange, name, headers]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
        {label} <span className="text-red-500 ml-0.5">*</span>
      </label>
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary-100 text-primary-700 rounded-md flex items-center justify-center">
          <ChevronsRight className="w-5 h-5" />
        </div>
        <select
          name={name}
          value={value}
          onChange={onChange}
          required
          className={`flex-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
            value && !headers.includes(value) ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="" disabled>-- Select Column from File --</option>
          {headers.map((header) => (
            header != null ? (
              <option key={String(header)} value={String(header)}>
                {String(header)}
              </option>
            ) : null
          ))}
        </select>
      </div>
      {value && !headers.includes(value) && (
        <p className="text-xs text-red-600 mt-1">Selected column '{value}' not found in file headers.</p>
      )}
    </div>
  );
}