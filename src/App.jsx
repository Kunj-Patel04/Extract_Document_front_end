import { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Capture the uploaded file
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setData(null);
    setError(null);
  };

  // Trigger the API call
  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image file first.");
      return;
    }

    setLoading(true);
    setError(null);

    // Prepare the multipart/form-data payload
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Define the base URL dynamically
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

        // Update your fetch call
        const response = await fetch(`${backendUrl}/api/document/extract`, {
            method: 'POST',
            headers: {
                'X-RapidAPI-Proxy-Secret': '1b5f2d90-ba92-11f1-a7cd-0575d93e1e61' 
            },
            body: formData,
        });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred during extraction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      <h1>KYC Document Extractor</h1>
      
      <div style={{ margin: '2rem 0' }}>
        <input 
          type="file" 
          accept="image/jpeg, image/jpg, image/png" 
          onChange={handleFileChange} 
        />
        <button 
          onClick={handleUpload} 
          disabled={loading} 
          style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
        >
          {loading ? 'Extracting...' : 'Get Data'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Render the results dynamically based on document_type */}
      {data && (
        <div style={{ textAlign: 'left', background: '#f4f3ec', padding: '1.5rem', borderRadius: '8px', color: '#08060d' }}>
          <h2>Extraction Results</h2>
          <p><strong>Type:</strong> {data.document_type}</p>
          <hr style={{ margin: '1rem 0' }} />

          {data.document_type === 'Aadhaar' ? (
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
              <li><strong>ID Number:</strong> {data.aadhaar_number}</li>
              <li><strong>Name (EN):</strong> {data.full_name_english}</li>
              <li><strong>Name (Regional):</strong> {data.full_name_regional}</li>
              <li><strong>DOB:</strong> {data.dob}</li>
              <li><strong>Address (EN):</strong> {data.address_english}</li>
              <li><strong>Address (Regional):</strong> {data.address_regional}</li>
            </ul>
          ) : data.document_type === 'PAN' ? (
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
              <li><strong>PAN Number:</strong> {data.pan_number}</li>
              <li><strong>Name:</strong> {data.full_name}</li>
              <li><strong>Father's Name:</strong> {data.fathers_name}</li>
              <li><strong>DOB:</strong> {data.dob}</li>
            </ul>
          ) : (
            <p>Unrecognized document format.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;