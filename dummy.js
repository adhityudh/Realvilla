const fs = require('fs');

async function test() {
  const formData = new FormData();
  formData.append('propertyId', '123');
  formData.append('propertyCode', 'P-123');
  formData.append('propertyTitle', 'Test Villa');
  formData.append('locale', 'en');
  formData.append('depositAmount', '500');
  formData.append('personal', JSON.stringify({ fullName: 'John Doe', idNumber: '123', email: 'john@example.com', phone: '123', address: '123' }));
  formData.append('offer', JSON.stringify({ offerPrice: '100000', additionalConditions: '' }));
  
  // mock file
  const blob = new Blob(['test file content'], { type: 'application/pdf' });
  formData.append('receipt', blob, 'receipt.pdf');

  try {
    const res = await fetch('http://localhost:3000/api/offer/submit', {
      method: 'POST',
      body: formData
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error(err);
  }
}
test();
